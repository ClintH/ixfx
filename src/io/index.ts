/**
 * Generic support for Bluetooth LE devices
 */
export * as Bluetooth from './NordicBleDevice.js';

export type { Events, DataEvent } from './BleDevice.js';
export * as AudioAnalysers from './AudioAnalyser.js';
export * as AudioVisualisers from './AudioVisualiser.js';

export { StringReceiveBuffer } from './StringReceiveBuffer.js';
export { StringWriteBuffer } from './StringWriteBuffer.js';
export { Codec } from './Codec.js';

/**
 * Espruino-based devices connected via Bluetooth LE
 *
 * See [demos](https://clinth.github.io/ixfx-demos/io/)
 *
 * Overview:
 * * {@link puck}: Connects a [Espruino BLE Device](../classes/Io.Espruino.EspruinoBleDevice.html).
 * * {@link Espruino.connectBle}: Connect to a generic Espruino via BLE
 */
export * as Espruino from './Espruino.js';

export * as Camera from './Camera.js';

export * as VideoFile from './VideoFile.js';

export { FrameProcessor } from './FrameProcessor.js';
export type { FrameProcessorOpts } from './FrameProcessor.js';

/**
 * Microcontrollers such as Arduinos connected via USB serial
 *
 * Overview
 * * {@link Serial.Device}
 *
 */
export * as Serial from './Serial.js';
