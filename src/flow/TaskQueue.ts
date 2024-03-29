import { mutable } from '../collections/queue/QueueMutable.js';

type Task = () => Promise<void>;

export type TaskQueueOpts = {
  /**
   * How long to wait before starting the queue 'thread'
   * when something is added.
   *
   * Default: 500ms
   */
  readonly startDelayMs?: number;

  /**
   * Once running, sleeping period between each item
   * being processed.
   *
   * Default: 100ms
   */
  readonly intervalMs?: number;
};

/**
 * Simple task queue. Each task is awaited and run
 * in turn.
 *
 * @example Usage
 * ```js
 * const q = new TaskQueue();
 * q.add(async () => {
 *  // Takes one second to run
 *  await sleep(1000);
 * });
 * ```
 */
export class TaskQueue {
  static instance = new TaskQueue();
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _timer: any = 0;
  private _queue;
  private readonly _startDelayMs;
  private readonly _intervalMs;

  private constructor(opts: TaskQueueOpts = {}) {
    this._startDelayMs = opts.startDelayMs ?? 500;
    this._intervalMs = opts.intervalMs ?? 100;
    this._queue = mutable<Task>(); // new QueueMutable<Task>();
  }

  /**
   * Adds a task. This triggers processing loop if not already started.
   *
   * ```js
   * queue.add(async () => {
   *  await sleep(1000);
   * });
   * ```
   * @param task Task to run
   */
  add(task: () => Promise<void>) {
    this._queue.enqueue(task);
    if (this._timer === 0) this.schedule(this._startDelayMs);
  }

  private schedule(intervalMs: number) {
    // If the queue is empty, allow loop to stop
    if (this._queue.length === 0) {
      //eslint-disable-next-line functional/immutable-data
      this._timer = 0;
      return;
    }

    if (this._timer !== 0) {
      // Seems to be running
      return;
    }

    // Start the processing loop
    //eslint-disable-next-line functional/immutable-data
    this._timer = setTimeout(() => {
      void this.processQueue();
    }, intervalMs);
  }

  private async processQueue() {
    const task = this._queue.dequeue();

    //eslint-disable-next-line functional/immutable-data
    this._timer = 0;
    if (task !== undefined) {
      try {
        await task();
        //eslint-disable-next-line functional/immutable-data
        this._timer = 0;
        this.schedule(this._intervalMs);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
