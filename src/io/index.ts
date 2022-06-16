/**
 * Generic support for Bluetooth LE devices
 */
export * as Bluetooth from './NordicBleDevice.js';

export * as AudioAnalysers from '../io/AudioAnalyser.js';
export * as AudioVisualisers from '../io/AudioVisualiser.js';

/**
 * Espruino-based devices connected via Bluetooth LE
 * 
 * Overview:
 * * {@link puck}: Connect ./EspruinoBleDevice.js
 * * {@link connect}: Connect to a generic Espruino
 */
export * as Espruino from './Espruino.js';

export * as Camera from './Camera.js';

/**
 * Microcontrollers such as Arduinos connected via USB serial
 * 
 * Overview
 * * {@link Serial.Device}
 * 
 */
export * as Serial from './Serial.js';