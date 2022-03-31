import {QueueMutable, queueMutable} from "../collections";
import {Continuously, continuously} from "../flow";
import {splitByLength} from "../Text";

export class StringWriteBuffer {
  paused = false;
  queue: QueueMutable<string>;
  writer: Continuously;
  intervalMs: number;

  constructor(private onData: (data: string) => Promise<void>, private chunkSize = -1) {
    this.intervalMs = 10;
    this.queue = queueMutable<string>();
    this.writer = continuously(() => this.onWrite(), this.intervalMs);
  }

  clear() {
    this.queue = queueMutable<string>();
  }

  async onWrite(): Promise<boolean> {
    if (this.queue.isEmpty) {
      console.debug(`WriteBuffer.onWrite: queue empty`);
      return false; // Stop continuously
    }

    if (this.paused) {
      console.debug(`WriteBuffer.onWrite: paused...`);
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
    if (this.chunkSize) {
      this.queue.enqueue(...splitByLength(str, this.chunkSize));
    } else {
      this.queue.enqueue(str);
    }

    // Run continuously loop if it's not already running
    this.writer.start();
  }
}