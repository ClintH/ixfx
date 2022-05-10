/**
 * Generic support for Bluetooth LE devices
 */
export * as Bluetooth from './NordicBleDevice.js';

/**
 * Espruino-based devices connected via Bluetooth LE
 * 
 * Overview:
 * * {@link puck}: Connect to a Puck.js
 * * {@link connect}: Connect to a generic Espruino
 */
export * as Espruino from './EspruinoDevice.js';

export * as Camera from './Camera.js';
