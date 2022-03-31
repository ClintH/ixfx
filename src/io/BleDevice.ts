import {SimpleEventEmitter} from "../Events.js";
import {StateChangeEvent, StateMachine} from "../flow/StateMachine";
import {indexOfCharCode, omitChars} from "../Text";
import {Codec} from "./Codec";
import {StringReceiveBuffer} from "./StringReceiveBuffer";
import {StringWriteBuffer} from "./StringWriteBuffer";

export type Opts = {
  readonly service:string
  readonly rxGattCharacteristic:string
  readonly txGattCharacteristic:string
  readonly chunkSize:number
  readonly name:string
}

export type DataEvent = {
  readonly data:string
}

type Events = {
  readonly data: DataEvent
  readonly change: StateChangeEvent
};

export class BleDevice extends SimpleEventEmitter<Events> {
  states: StateMachine;
  codec: Codec;
  rx: BluetoothRemoteGATTCharacteristic | undefined;
  tx: BluetoothRemoteGATTCharacteristic | undefined;
  verboseLogging = true;

  rxBuffer: StringReceiveBuffer;
  txBuffer: StringWriteBuffer;

  constructor(private device: BluetoothDevice, private config:Opts) {
    super();
    this.txBuffer = new StringWriteBuffer(async data => {
      await this.writeInternal(data);
    }, config.chunkSize);

    this.rxBuffer = new StringReceiveBuffer(line => {
      this.fireEvent(`data`, { data:line });
    });

    this.codec = new Codec();
    this.states = new StateMachine(`ready`, {
      ready: `connecting`,
      connecting: [`connected`, `closed`],
      connected: [`closed`],
      closed: `connecting`
    });

    this.states.addEventListener(`change`, evt => {
      this.fireEvent(`change`, evt);
      this.verbose(`${evt.priorState} -> ${evt.newState}`);
      if (evt.priorState === `connected`) {
        // Clear out buffers
        this.rxBuffer.clear();
        this.txBuffer.clear();
      }
    });

    device.addEventListener(`gattserverdisconnected`, () => {
      this.log(`GATT server disconnected`);
      this.states.state = `closed`;
    });

    this.verbose(`ctor ${device.name} ${device.id}`);
  }

  write(txt: string) {
    if (this.states.state !== `connected`) throw new Error(`Cannot write while state is ${this.states.state}`);
    this.txBuffer.add(txt);
  }

  private async writeInternal(txt: string) {
    this.log(`writeInternal ${txt}`);
    const tx = this.tx;
    if (tx === undefined) throw new Error(`Unexpectedly without tx characteristic`);
    try {
      await tx.writeValue(this.codec.toBuffer(txt));
    } catch (ex:unknown) {
      this.warn(ex);
    }
  }

  async connect() {
    this.states.state = `connecting`;

    this.log(`connect`);
    const gatt = this.device.gatt;
    if (gatt === undefined) throw new Error(`Gatt not available on device`);

    const server = await gatt.connect();
    this.verbose(`Getting primary service`);
    const service = await server.getPrimaryService(this.config.service);
    this.verbose(`Getting characteristics`);
    const rx = await service.getCharacteristic(this.config.rxGattCharacteristic);
    const tx = await service.getCharacteristic(this.config.txGattCharacteristic);

    rx.addEventListener(`characteristicvaluechanged`, (evt) => this.onRx(evt));
    this.rx = rx;
    this.tx = tx;
    this.states.state = `connected`;

    await rx.startNotifications();
  }

  onRx(evt: Event) {
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

  protected verbose(m: string) {
    if (this.verboseLogging) console.info(`${this.config.name} `, m);
  }

  protected log(m: string) {
    console.log(`${this.config.name} `, m);
  }

  protected warn(m:unknown) {
    console.warn(`${this.config.name} `, m);
  }
}

