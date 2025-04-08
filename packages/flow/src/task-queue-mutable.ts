import { SimpleEventEmitter } from '@ixfxfun/events';
import { Queues } from '@ixfxfun/collections';
import { continuously } from './continuously.js';

export type AsyncTask = () => Promise<void>;

export type TaskQueueEvents = {
  /**
   * Task queue has emptied.
   * @returns
   */
  empty: any
  /**
   * Task queue was empty and now processing
   * @returns 
   */
  started: any
}

/**
 * Simple task queue. Each task is awaited and run
 * in turn.
 * 
 * The TaskQueueMutable is shared across your code,
 * so you don't create it directly. Rather, use:
 * 
 * ```js
 * import { TaskQueueMutable } from "https://unpkg.com/ixfx/dist/flow.js"
 * const queue = TaskQueueMutable.shared;
 * ```
 *
 * @example Usage
 * ```js
 * import { TaskQueueMutable, sleep } from "https://unpkg.com/ixfx/dist/flow.js"
 * const queue = TaskQueueMutable.shared;
 * q.enqueue(async () => {
 *  // Takes one second to run
 *  await sleep(1000);
 * });
 * ```
 * 
 * You can listen to events from the TaskQueue:
 * ```js
 * TaskQueueMutable.shared.addEventListener(`started`, () => {
 *  // Queue was empty, now started processing
 * });
 * 
 * TaskQueueMutable.shared.addEventListener(`empty`, () => {
 *  // Queue has finished processing all items
 * });
 * ```
 */
export class TaskQueueMutable extends SimpleEventEmitter<TaskQueueEvents> {
  static readonly shared = new TaskQueueMutable();
  private _loop;
  private _queue;

  private constructor() {
    super();
    this._queue = Queues.mutable<AsyncTask>();
    this._loop = continuously(() => {
      return this.processQueue();
    }, 100);
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
  enqueue(task: () => Promise<void>) {
    const length = this._queue.enqueue(task);
    if (this._loop.runState === `idle`) {
      this.fireEvent(`started`, {});
      this._loop.start();
    }
    return length;
  }

  dequeue() {
    return this._queue.dequeue();
  }

  private async processQueue() {
    const task = this._queue.dequeue();
    if (task === undefined) {
      this.fireEvent(`empty`, {});
      return false;

    }

    try {
      await task();
    } catch (error) {
      console.error(error);
    }

  }

  /**
   * Clears all tasks, and stops any scheduled processing.
   * Currently running tasks will continue.
   * @returns 
   */
  clear() {
    if (this._queue.length === 0) return;
    this._queue.clear();
    this._loop.cancel();
    this.fireEvent(`empty`, {});
  }

  /**
  * Returns true if queue is empty
  */
  get isEmpty() {
    return this._queue.isEmpty;
  }


  /**
   * Number of items in queue
   */
  get length() {
    return this._queue.length
  }
}
