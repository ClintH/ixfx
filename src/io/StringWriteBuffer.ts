import type { Interval } from '../flow/IntervalType.js';
import { QueueMutable } from '../collections/queue/QueueMutable.js';
import {
  type Continuously,
  continuously
} from '../flow/index.js';
import { splitByLength } from '../Text.js';

export type Opts = {
  readonly chunkSize?: number;
  readonly interval?: Interval;
};

/**
 * Buffers a queue of strings.
 *
 * When text is queued via {@link add}, it is chopped up
 * into chunks and sent in serial to the `dataHandler` function.
 * Data is processed at a set rate, by default 10ms.
 *
 * ```js
 * const dataHandler = (data:string) => {
 *  // Do something with queued data.
 *  // eg. send to serial port
 * }
 *
 * // Create a buffer with a chunk size of 100 characters
 * const b = new StringWriteBuffer(dataHandler, { chunkSize: 100 });
 * b.add('some text'); // Write to buffer
 * // dataHandler will be called until queued data is empty
 * ```
 *
 * It's also possible to get the buffer as a WritableStream<string>:
 * ```js
 * const dataHandler = (data:string) => { ... }
 * const b = new StringWriteBuffer(dataHandler, 100);
 * const s = b.writable();
 * ```
 *
 * Other functions:
 * ```js
 * b.close(); // Close buffer
 * b.clear(); // Clear queued data, but don't close anything
 * ```
 */
export class StringWriteBuffer {
  paused = false;
  queue = new QueueMutable<string>();
  writer: Continuously;
  stream: WritableStream<string> | undefined;
  closed = false;
  chunkSize: number;

  /**
   * Constructor
   * @param dataHandler Calback to 'send' data onwards
   * @param chunkSize Size to break up strings
   */
  constructor(
    private dataHandler: (data: string) => Promise<void>,
    opts: Opts = {}
  ) {
    this.chunkSize = opts.chunkSize ?? -1;
    this.writer = continuously(this.onWrite, opts.interval ?? 10);
  }

  /**
   * Close writer (async)
   */
  async close() {
    if (this.closed) return;
    const w = this.stream?.getWriter();
    w?.releaseLock();
    await w?.close();
    this.closed = true;
  }

  /**
   * Clear queued data.
   *
   * Throws an error if {@link close} has been called.
   */
  clear() {
    if (this.closed) throw new Error(`Buffer closed`);
    this.queue = new QueueMutable<string>();
  }

  /**
   * Gets the buffer as a writable stream.
   *
   * Do not close stream directly, use .close on this class instead.
   *
   * Throws an error if .close() has been called.
   * @returns Underlying stream
   */
  writable() {
    if (this.closed) throw new Error(`Buffer closed`);
    if (this.stream === undefined) this.stream = this.createWritable();
    return this.stream;
  }

  private createWritable() {
    //eslint-disable-next-line @typescript-eslint/no-this-alias
    const b = this;
    return new WritableStream<string>({
      write(chunk) {
        b.add(chunk);
      },
      close() {
        b.clear();
      },
    });
  }

  /**
   * Run in a `continunously` loop to process queued data
   * @returns _False_ if queue is empty and loop should stop. _True_ if it shoud continue.
   */
  async onWrite(): Promise<boolean> {
    if (this.queue.isEmpty) {
      //console.warn(`WriteBuffer.onWrite: queue empty`);
      return false; // Stop continuously
    }

    if (this.paused) {
      console.warn(`WriteBuffer.onWrite: paused...`);
      return true; // Keep going tho
    }

    // Dequeue and send
    const s = this.queue.dequeue();
    if (s === undefined) return false;
    await this.dataHandler(s);

    return true;
  }

  /**
   * Returns _true_ if {@link close} has been called.
   */
  get isClosed() {
    return this.closed;
  }

  /**
   * Adds some queued data to send.
   * Longer strings are automatically chunked up according to the buffer's settings.
   *
   * Throws an error if {@link close} has been called.
   * @param str
   */
  add(str: string) {
    if (this.closed) throw new Error(`Buffer closed`);
    // Add whole string or chunked string
    if (this.chunkSize > 0) {
      this.queue.enqueue(...splitByLength(str, this.chunkSize));
    } else {
      this.queue.enqueue(str);
    }

    // Run continuously loop if it's not already running
    this.writer.start();
  }
}
