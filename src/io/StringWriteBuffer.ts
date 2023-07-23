import { queueMutable } from '../collections/queue/index.js';
import { type Continuously, continuously } from '../flow/index.js';
import { splitByLength } from '../Text.js';

export class StringWriteBuffer {
  paused = false;
  queue = queueMutable<string>();
  writer: Continuously;
  intervalMs: number;
  stream: WritableStream<string> | undefined;

  constructor(
    private onData: (data: string) => Promise<void>,
    private chunkSize = -1
  ) {
    this.intervalMs = 10;
    this.writer = continuously(() => this.onWrite(), this.intervalMs);
  }

  async close() {
    const w = this.stream?.getWriter();
    w?.releaseLock();
    await w?.close();
  }

  clear() {
    this.queue = queueMutable<string>();
  }

  writable() {
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
    await this.onData(s);

    return true;
  }

  add(str: string) {
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
