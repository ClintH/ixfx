import {BleDevice} from "./BleDevice.js";

// export const nordicService = `;
// export const nordicTx  = ;
// export const nordicRx = ;
// const chunkSize = 20;

export const defaultOpts = {
  chunkSize: 20,
  service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`,
  txGattCharacteristic: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`,
  rxGattCharacteristic: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`,
  name: `NordicDevice`,
};

type Opts = {
  readonly chunkSize?:number,
  readonly name?:string
}

export class NordicBleDevice extends BleDevice  {
  constructor(device: BluetoothDevice, opts:Opts = {}) {
    super(device, {...defaultOpts, ...opts});
  }
}

