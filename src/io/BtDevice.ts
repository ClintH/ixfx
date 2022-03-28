import {StateMachine} from "../flow/StateMachine";
import {indexOfCharCode, omitChars } from "../Text";
import {Codec} from "./Codec";
import {StringReceiveBuffer} from "./StringReceiveBuffer";
import {StringWriteBuffer} from "./StringWriteBuffer";

const nordicService = `6e400001-b5a3-f393-e0a9-e50e24dcca9e`;
const nordicTx  = `6e400002-b5a3-f393-e0a9-e50e24dcca9e`;
const nordicRx = `6e400003-b5a3-f393-e0a9-e50e24dcca9e`;
const chunkSize = 20;

export class Nordic {
  states:StateMachine;
  codec:Codec;
  rx:BluetoothRemoteGATTCharacteristic|undefined;
  tx:BluetoothRemoteGATTCharacteristic|undefined;
  verboseLogging = false;

  rxBuffer:StringReceiveBuffer;
  txBuffer:StringWriteBuffer;

  constructor(private device: BluetoothDevice) {
    this.txBuffer = new StringWriteBuffer(async data => {
      await this.writeInternal(data);
    }, chunkSize);

    this.rxBuffer = new StringReceiveBuffer(line => {
      this.verbose(`Line: ${line}`);
    });

    this.codec = new Codec();
    this.states = new StateMachine(`ready`, {
      ready: `connecting`,
      connecting: [`connected`, `closed`],
      connected: [`closed`],
      closed: `connecting`
    });

    this.states.addEventListener(`change`, evt => {
      this.log(`${evt.priorState} -> ${evt.newState}`);
    });

    device.addEventListener(`gattserverdisconnected`, () => {
      this.log(`GATT server disconnected`);
      this.states.state = `closed`;
    });

    this.verbose(`ctor ${device.name} ${device.id}`);
  }

  write(txt:string) {
    if (this.states.state !== `connected`) throw new Error(`Cannot write while state is ${this.states.state}`);
    this.txBuffer.add(txt);
  }

  private async writeInternal(txt:string) {
    this.log(`writeInternal ${txt}`);
    const tx = this.tx;
    if (tx === undefined) throw new Error(`Unexpectedly without tx characteristic`);
    await tx.writeValue(this.codec.toBuffer(txt));
  }

  async connect() {
    this.states.state = `connecting`;

    this.log(`connect`);
    const gatt = this.device.gatt;
    if (gatt === undefined) throw new Error(`Gatt not available on device`);

    const server = await gatt.connect();
    this.verbose(`Getting primary service`);
    const service = await server.getPrimaryService(nordicService);
    this.verbose(`Getting characteristics`);
    const rx = await service.getCharacteristic(nordicRx);
    const tx = await service.getCharacteristic(nordicTx);

    rx.addEventListener(`characteristicvaluechanged`, (evt) => this.onRx(evt));
    this.rx = rx;
    this.tx = tx;
    this.states.state = `connected`;

    await rx.startNotifications();
  }

  onRx(evt:Event) {
    const rx = this.rx;
    if (rx === undefined) return;

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const view = (evt.target as any).value as DataView;
    if (view === undefined) return;

    //eslint-disable-next-line functional/no-let
    let str = this.codec.fromBuffer(view.buffer);

    // Check for flow control chars
    const plzStop = indexOfCharCode(str, 19);
    const plzStart = indexOfCharCode(str, 17);

    // Remove if found
    if (plzStart && plzStop < plzStart) {
      this.verbose(`Tx plz start`);
      str = omitChars(str, plzStart, 1);
      this.txBuffer.paused = false;
    }
    if (plzStop && plzStop > plzStart) {
      this.verbose(`Tx plz stop`);
      str = omitChars(str, plzStop, 1);
      this.txBuffer.paused = true;
    }

    this.rxBuffer.add(str);
  }

  private verbose(m:string) {
    if (this.verboseLogging) console.info(`BtDevice `, m);
  }

  private log(m:string) {
    console.log(`BtDevice `, m);
  }
}

export const puck = async () => {
  const device = await navigator.bluetooth.requestDevice({
    filters: [
      {namePrefix: `Puck.js`},
      // {namePrefix: 'Pixl.js'},
      // {namePrefix: 'MDBT42Q'},
      // {namePrefix: 'RuuviTag'},
      // {namePrefix: 'iTracker'},
      // {namePrefix: 'Thingy'},
      // {namePrefix: 'Espruino'},
      {services: [nordicService]}
    ], optionalServices: [nordicService]
  });
  const d = new Nordic(device);
  await d.connect();
  return d;
};