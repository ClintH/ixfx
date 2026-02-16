import { SimpleEventEmitter } from '@ixfx/events';
import { Queues } from '@ixfx/collections';
import { continuously, HasCompletionRunStates } from '@ixfx/core';

export type AsyncTaskVoid = () => Promise<void>;
export type AsyncTaskResult<T> = () => Promise<T>;
export type AsyncTask = AsyncTaskVoid | AsyncTaskResult<any>;

export type TaskQueueEvents = {
  /**
   * Task queue has emptied: it has nothing left to do.
   * @returns
   */
  empty: any
  /**
   * Task queue was empty and now processing. This does not fire for each task, only when the queue transitions from empty to non-empty.
   * @returns 
   */
  started: any

  /**
   * An error occurred when running a task
   * @param error 
   * @returns 
   */
  error: {error:unknown, task:AsyncTask}

  /**
   * Event fired when a task completes
   */
  progress: {task:AsyncTask, result?:any,remaining:number}
}

/**
 * Simple task queue. Each task is awaited and run
 * in turn.
 * 
 * The TaskQueueMutable is shared across your code,
 * so you don't create it directly. Rather, use:
 * 
 * ```js
 * const queue = TaskQueueMutable.shared;
 * ```
 *
 * @example Usage
 * ```js
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
 * 
 * TaskQueueMutable.shared.addEventListener(`error`, ({error,task}) => {
 *  // Reports if a task threw an exception
 * });
 * 
 * ```
 */
export class TaskQueueMutable extends SimpleEventEmitter<TaskQueueEvents> {
  static readonly shared: TaskQueueMutable = new TaskQueueMutable();
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
  enqueue(task: () => Promise<void>): number {
    const length = this._queue.enqueue(task);
    if (this._loop.runState === `idle`) {
      this.fireEvent(`started`, {});
      this._loop.start();
    }
    return length;
  }


  private async processQueue() {
    const task = this._queue.dequeue();
    if (typeof task === `undefined`) {
      this.fireEvent(`empty`, {});
      return false;
    }

    try {
      const result = await task();
      this.fireEvent(`progress`, {task, remaining:this._queue.length,result});
    } catch (error) {
      this.fireEvent(`error`, {error,task});
    }
    return true;
  }

  /**
   * Clears all tasks, and stops any scheduled processing.
   * Currently running tasks will continue.
   * @fires empty event if queue was not already empty
   * @returns 
   */
  clear(): void {
    if (this._queue.length === 0) return;
    this._queue.clear();
    this._loop.cancel();
    this.fireEvent(`empty`, {});
  }

  /**
  * Returns _true_ if queue is empty
  */
  get isEmpty(): boolean {
    return this._queue.isEmpty;
  }


  /**
   * Number of items in queue
   */
  get length(): number {
    return this._queue.length
  }

  /**
   * Returns the run state of the procesing loop. This is `idle` when no processing is scheduled, `scheduled` when processing is scheduled, and `running` when actively running a task.
   */
  get runState():HasCompletionRunStates {
    return this._loop.runState;
  }
}
