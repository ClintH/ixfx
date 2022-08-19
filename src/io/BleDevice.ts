import {SimpleEventEmitter} from "../Events.js";
import { StateMachine} from "../flow/StateMachine.js";
import {indexOfCharCode, omitChars} from "../Text.js";
import {Codec} from "./Codec.js";
import {StringReceiveBuffer} from "./StringReceiveBuffer.js";
import {StringWriteBuffer} from "./StringWriteBuffer.js";
import {retry} from "../flow/Retry.js";
import {Events} from "./Espruino.js";

export type Opts = {
  readonly service:string
  readonly rxGattCharacteristic:string
  readonly txGattCharacteristic:string
  readonly chunkSize:number
  readonly name:string
  readonly connectAttempts:number
  readonly debug:boolean
}

const reconnect = async () => {
  console.log(`Connect?`);
  if (!(`bluetooth` in navigator)) return false;
  if (!(`getDevices` in navigator.bluetooth)) return false;

  const devices = await navigator.bluetooth.getDevices();
  console.log(devices);

  for (const device of devices) {
    console.log(device);
    // Start a scan for each device before connecting to check that they're in
    // range.
    const abortController = new AbortController();
    await device.watchAdvertisements({ signal: abortController.signal });
    device.addEventListener(`advertisementreceived`, async (evt) => {
      console.log(evt);
      // Stop the scan to conserve power on mobile devices.
      abortController.abort();
   
   
      // At this point, we know that the device is in range, and we can attempt
      // to connect to it.
      await evt.device.gatt?.connect();
      console.log(`Connected!`);
    });
  }
};

export class BleDevice extends SimpleEventEmitter<Events> {
  states: StateMachine;
  codec: Codec;
  rx: BluetoothRemoteGATTCharacteristic | undefined;
  tx: BluetoothRemoteGATTCharacteristic | undefined;
  gatt: BluetoothRemoteGATTServer | undefined;
  verboseLogging = false;

  rxBuffer: StringReceiveBuffer;
  txBuffer: StringWriteBuffer;

  constructor(private device: BluetoothDevice, private config:Opts) {
    super();
    this.verboseLogging = config.debug;
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
      if (this.isClosed) return;
      this.verbose(`GATT server disconnected`);
      this.states.state = `closed`;
    });

    this.verbose(`ctor ${device.name} ${device.id}`);
  }

  get isConnected():boolean {
    return this.states.state === `connected`;
  }

  get isClosed():boolean {
    return this.states.state === `closed`;
  }

  write(txt: string) {
    if (this.states.state !== `connected`) throw new Error(`Cannot write while state is ${this.states.state}`);
    this.txBuffer.add(txt);
  }

  private async writeInternal(txt: string) {
    this.verbose(`writeInternal ${txt}`);
    const tx = this.tx;
    if (tx === undefined) throw new Error(`Unexpectedly without tx characteristic`);
    try {
      await tx.writeValue(this.codec.toBuffer(txt));
    } catch (ex:unknown) {
      this.warn(ex);
    }
  }

  disconnect() {
    if (this.states.state !== `connected`) return;
    this.gatt?.disconnect();
  }

  async connect() {
    const attempts = this.config.connectAttempts ?? 3;

    this.states.state = `connecting`;

    this.verbose(`connect`);
    const gatt = this.device.gatt;
    if (gatt === undefined) throw new Error(`Gatt not available on device`);

    await retry(async () => {
      const server = await gatt.connect();
      this.verbose(`Getting primary service`);
      const service = await server.getPrimaryService(this.config.service);
      this.verbose(`Getting characteristics`);
      const rx = await service.getCharacteristic(this.config.rxGattCharacteristic);
      const tx = await service.getCharacteristic(this.config.txGattCharacteristic);
  
      rx.addEventListener(`characteristicvaluechanged`, (evt) => this.onRx(evt));
      this.rx = rx;
      this.tx = tx;
      this.gatt = gatt;
      this.states.state = `connected`;
  
      await rx.startNotifications();
    }, attempts, 200);
  }

  private onRx(evt: Event) {
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

