
import { SimpleEventEmitter } from '@ixfx/events';
import { StateMachineWithEvents } from '@ixfx/flow/state-machine';
import { retryFunction } from '@ixfx/flow';
import { indexOfCharCode, omitChars } from '@ixfx/core/text';

import { Codec } from './codec.js';
import { StringReceiveBuffer } from './string-receive-buffer.js';
import { StringWriteBuffer } from './string-write-buffer.js';
import {
  type BleDeviceOptions,
  type GenericStateTransitions,
  type IoEvents,
} from './types.js';
import { genericStateTransitionsInstance } from './generic-state-transitions.js';



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

    device.addEventListener(`advertisementreceived`, async (event) => {
      console.log(event);
      // Stop the scan to conserve power on mobile devices.
      abortController.abort();

      // At this point, we know that the device is in range, and we can attempt
      // to connect to it.
      await event.device.gatt?.connect();
      console.log(`Connected!`);
    });
  }
};

export class BleDevice extends SimpleEventEmitter<
  IoEvents<GenericStateTransitions>
> {
  states: StateMachineWithEvents<GenericStateTransitions>;
  codec: Codec;
  rx: BluetoothRemoteGATTCharacteristic | undefined;
  tx: BluetoothRemoteGATTCharacteristic | undefined;
  gatt: BluetoothRemoteGATTServer | undefined;
  verboseLogging = false;

  rxBuffer: StringReceiveBuffer;
  txBuffer: StringWriteBuffer;

  constructor(
    private device: BluetoothDevice,
    private config: BleDeviceOptions
  ) {
    super();
    this.verboseLogging = config.debug;
    this.txBuffer = new StringWriteBuffer(async (data) => {
      await this.writeInternal(data);
    }, config);

    this.rxBuffer = new StringReceiveBuffer((line) => {
      this.fireEvent(`data`, { data: line });
    });

    this.codec = new Codec();
    this.states = new StateMachineWithEvents<GenericStateTransitions>(
      genericStateTransitionsInstance,
      {
        initial: `ready`,
      }
    );
    this.states.addEventListener(`change`, (event) => {
      this.fireEvent(`change`, event);
      this.verbose(`${ event.priorState } -> ${ event.newState }`);

      if (event.priorState === `connected`) {
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

    this.verbose(`ctor ${ device.name } ${ device.id }`);
  }

  get isConnected(): boolean {
    return this.states.state === `connected`;
  }

  get isClosed(): boolean {
    return this.states.state === `closed`;
  }

  write(txt: string) {
    if (this.states.state !== `connected`) {
      throw new Error(`Cannot write while state is ${ this.states.state }`);
    }
    this.txBuffer.add(txt);
  }

  private async writeInternal(txt: string) {
    this.verbose(`writeInternal ${ txt }`);
    const tx = this.tx;
    if (tx === undefined) {
      throw new Error(`Unexpectedly without tx characteristic`);
    }
    try {
      await tx.writeValue(this.codec.toBuffer(txt));
    } catch (error: unknown) {
      this.warn(error);
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

    await retryFunction(
      async () => {
        this.verbose(`connect.retry`);
        const server = await gatt.connect();
        this.verbose(`Getting primary service`);
        const service = await server.getPrimaryService(this.config.service);
        this.verbose(`Getting characteristics`);
        const rx = await service.getCharacteristic(
          this.config.rxGattCharacteristic
        );
        const tx = await service.getCharacteristic(
          this.config.txGattCharacteristic
        );

        rx.addEventListener(`characteristicvaluechanged`, (event) => { this.onRx(event); }
        );
        this.rx = rx;
        this.tx = tx;
        this.gatt = gatt;
        this.states.state = `connected`;

        await rx.startNotifications();
        return true;
      },
      {
        limitAttempts: attempts,
        startAt: 200,
      }
    );
  }

  private onRx(event: Event) {
    const rx = this.rx;
    if (rx === undefined) return;

    const view = (event.target as any).value as DataView;
    if (view === undefined) return;

    let text = this.codec.fromBuffer(view.buffer as ArrayBuffer);

    // Check for flow control chars
    const plzStop = indexOfCharCode(text, 19);
    const plzStart = indexOfCharCode(text, 17);

    // Remove if found
    if (plzStart && plzStop < plzStart) {
      this.verbose(`Tx plz start`);
      text = omitChars(text, plzStart, 1);
      this.txBuffer.paused = false;
    }
    if (plzStop && plzStop > plzStart) {
      this.verbose(`Tx plz stop`);
      text = omitChars(text, plzStop, 1);
      this.txBuffer.paused = true;
    }

    this.rxBuffer.add(text);
  }

  protected verbose(m: string) {
    if (this.verboseLogging) console.info(this.config.name, m);
  }

  protected log(m: string) {
    console.log(this.config.name, m);
  }

  protected warn(m: unknown) {
    console.warn(this.config.name, m);
  }
}
