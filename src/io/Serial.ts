// Source: Love Lagerkvist (https://github.com/motform)
// https://gist.githubusercontent.com/motform/41f3c573e54f9373107ac070ec05afea/raw/7b112fed0a6479e8ec5b3b3a9fce75f94b2f605b/webSerialRead.js
//  Partially adapted from https://github.com/svendahlstrand/web-serial-api and https://web.dev/serial/

// const guard = (port:SerialPort) => {
//   if (port === undefined) throw new Error(`port undefined`);
//   if (port === null) throw new Error(`port null`);
// };

/**
 * Reads from a serial port in a line-by-line fashion. 
 * Assumes \n as a line separator.
 * 
 * @example
 * ```js
 * document.querySelector(`btnStart`).addEventListener(`click`, async () => {
 *  const port = await navigator.serial.requestPort();
 *  await port.open({baudRate: 9600});
 *  read(port, line => {
 *    // Do something with line (string)
 *  });
 * });
 * ```
 * @param port Opened port to read from
 * @param separator Line separator `\n` by default 
 * @param callback Callback for each line read
 */
// export const read = async (port:SerialPort, callback:(line:string)=>void, separator = `\n`) => {
//   guard(port);

//   const textDecoder = new TextDecoderStream();
//   const readable = port.readable;
  
//   if (readable === null) throw new Error(`Could not open readable stream from port`);
//   readable.pipeTo(textDecoder.writable);
  
//   const reader = textDecoder.readable.getReader();
  
//   //eslint-disable-next-line functional/no-let
//   let lineBuffer = ``;

//   // Listen to data coming from the serial device.
//   //eslint-disable-next-line functional/no-loop-statement,no-constant-condition
//   while (true) {
//     const {done, value} = await reader.read();

//     if (done) {
//       reader.releaseLock();
//       break;
//     }

//     lineBuffer += value;
//     const lines = lineBuffer.split(separator);
//     //eslint-disable-next-line functional/no-loop-statement
//     while (lines.length > 1) {
//       //eslint-disable-next-line functional/immutable-data
//       lineBuffer = lines.pop() as string;
//       //eslint-disable-next-line functional/immutable-data
//       const line = lines.pop();
//       if (line !== undefined) {
//         
//         try {
//           callback(JSON.parse(line.trim()));
//         } catch (error) {
//           console.warn(`Discarding malformed JSON: ${line}`);
//         }
//       }
//     }
//   }
// };