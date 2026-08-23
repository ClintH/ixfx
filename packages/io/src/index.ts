export * as Audio from './audio/index.js';

export * as Camera from './camera.js';
export { Codec } from './codec.js';
/**
 * Espruino-based devices connected via Bluetooth LE
 *
 * See [demos](https://demos.ixfx.fun/io/)
 *
 * Overview:
 * {@link puck}: Connects a {@link Espruino.EspruinoBleDevice | Espruino BLE Device}.
 * {@link Espruino.connectBle}: Connect to a generic Espruino via BLE
 */
export * as Espruino from './espruino.js';
export { FrameProcessor } from './frame-processor.js';
export type { FrameProcessorOpts } from './frame-processor.js';

export * from './generic-state-transitions.js';
export type * from './json-device.js';
export * as Midi from './midi/index.js';

/**
 * Generic support for Bluetooth LE devices
 */
export * as Bluetooth from './nordic-ble-device.js';

export * from './reconnecting-web-socket.js';

/**
 * Microcontrollers such as Arduinos connected via USB serial
 *
 * Overview
 * {@link Serial.Device}
 *
 */
export * as Serial from './serial.js';

export { StringReceiveBuffer } from './string-receive-buffer.js';
export {
  StringWriteBuffer,
  type Opts as StringWriteBufferOpts,
} from './string-write-buffer.js';

export * from './types.js';
export * as VideoFile from './video-file.js';
