import { intervalToMs } from "@ixfx/core"
import type { IteratorControllerState, IteratorControllerOptions } from "./types.js"
import { continuously } from "@ixfx/core/continuously";

export type IteratorController = {
  get state(): IteratorControllerState
  /**
   * Starts 'playback' of the iterator.
   * If already started, this does nothing.
   * If paused, continues playback.
   * Use {@link restart} if you want to start with a reset.
   * @returns 
   */
  start: () => void
  /**
   * Starts or restarts 'playback' of the iterator.
   * @returns 
   */
  restart: () => void
  /**
   * Pauses 'playback' of the iterator.
   * If already paused, does nothing.
   * Use {@link start} to resume.
   * @returns 
   */
  pause: () => void
  /**
   * Cancels the running timer. This will
   * stop playback, and next time {@link start}
   * is called, it will be from the beginning.
   * @returns 
   */
  cancel: () => void
}

/**
 * Retrieve values from an iterator, passing them to a callback.
 * Allows iterator to be started, paused, or restarted and an optional delay between reading items from iterator.
 * @param options 
 * @returns 
 */
export const iteratorController = <T>(options: IteratorControllerOptions<T>): IteratorController => {
  const delayMs = intervalToMs(options.delay, 10);
  let gen: AsyncGenerator<T> | IterableIterator<T> | undefined;
  const onValue = options.onValue;
  let state: IteratorControllerState = `stopped`;

  const loop = continuously(async () => {
    if (gen) {
      const r = await gen.next();
      if (r.done) {
        state = `stopped`;
        return false;
      }
      const r2 = onValue(r.value);
      if (typeof r2 === `boolean`) {
        if (!r2) {
          state = `stopped`;
        }
        return r2;

      }
      return true;
    } else {
      state = `stopped`
      return false;
    }
  }, delayMs);

  const cancel = () => {
    if (state === `stopped`) return;
    gen = undefined;
    loop.cancel();
    state = `stopped`;
  }

  const pause = () => {
    if (state === `paused`) return;
    loop.cancel();
    state = `paused`;
  }

  const start = () => {
    if (state === `running`) return;
    if (!gen) {
      remake();
    }
    state = `running`;
    loop.start();
  }

  const remake = () => {
    if (options.iterator) {
      gen = options.iterator();
    } else {
      throw new Error(`No source iterator`);
    }
  }
  const restart = () => {
    remake();
    start();
  }

  return {
    start, cancel, restart, pause,
    get state() {
      return state
    }
  }
}