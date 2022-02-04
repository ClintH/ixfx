import {integer as guardInteger} from './Guards.js';
import {ResettableTimeout, Continuously, Timer} from './Interfaces.js';

/**
 * Returns a {@link ResettableTimeout} that can be triggered or cancelled.
 *  
 * Once `start()` is called, `callback` will be scheduled to execute after `timeoutMs`.
 * If `start()` is called again, the waiting period will be reset to `timeoutMs`.
 * 
 * @example Essential functionality
 * ```js
 * const fn = () => {
 *  console.log(`Executed`);
 * };
 * const t = resettableTimeout(fn, 60*1000); 
 * t.start();   // After 1 minute `fn` will run, printing to the console
 * ```
 * 
 * @example More functionality
 * ```
 * t.cancel();  // Cancel it from running
 * t.start();   // Schedule again after 1 minute
 * t.start(30*1000); // Cancel that, and now scheduled after 30s
 * t.isDone;    // True if a scheduled event is pending
 * ```
 * 
 * @param callback 
 * @param timeoutMs 
 * @returns {@link ResettableTimeout}
 */
export const resettableTimeout = (callback:()=>void, timeoutMs:number):ResettableTimeout => {
  if (callback === undefined) throw new Error(`callback parameter is undefined`);
  guardInteger(timeoutMs, `aboveZero`, `timeoutMs`);

  //eslint-disable-next-line functional/no-let
  let timer = 0;

  const start = (altTimeoutMs:number = timeoutMs) => {
    guardInteger(altTimeoutMs, `aboveZero`, `altTimeoutMs`);
    if (timer !== 0) stop();
    timer = window.setTimeout(() => {
      callback();
      timer = 0;
    }, altTimeoutMs);
  };

  const cancel = () => {
    if (timer === 0) return;
    window.clearTimeout(timer);
  };

  return {
    start,
    cancel,
    get isDone() {
      return timer !== 0;
    },
  };
};

/**
 * Returns a {@link Continuously} that continuously executes `callback`. Call `start` to begin.
 * 
 * @example Animation loop
 * ```js
 * const draw = () => {
 *  // Draw on canvas
 * }
 * continuously(draw).start(); // Run draw as fast as possible using `window.requestAnimationFrame` 
 * ```
 * 
 * @example With delay
 * ```js
 * const fn = () => {
 *  console.log(`1 minute`);
 * }
 * const c = continuously(fn, 60*1000);
 * c.start(); // Runs `fn` every minute
 * ```
 * 
 * @example With res
 * @param callback 
 * @param resetCallback 
 * @param intervalMs 
 * @returns 
 */
export const continuously = (callback:(ticks?:number)=>boolean|void, intervalMs?:number, resetCallback?:((ticks?:number) => boolean|void)):Continuously => {
  if (intervalMs !== undefined) guardInteger(intervalMs, `aboveZero`, `intervalMs`);

  //eslint-disable-next-line functional/no-let
  let running = false;
  //eslint-disable-next-line functional/no-let
  let ticks = 0;
  
  const schedule = intervalMs === undefined ? (cb:()=>void) => window.requestAnimationFrame(cb) : (cb:()=>void) => window.setTimeout(cb, intervalMs);
  const cancel = () => {
    if (!running) return;
    running = false;
    ticks = 0;
  };

  const loop = () => {
    if (!running) return;
    const r = callback(ticks++);
    if (r !== undefined && !r) {
      cancel();
      return;
    }

    schedule(loop);
  };

  const start = () => {
    // Already running, but theres a resetCallback to check if we should keep going
    if (running && resetCallback !== undefined) {
      const r = resetCallback(ticks);
      if (r !== undefined && !r) {
        // Reset callback tells us to stop
        cancel();
        return; // Skip starting again
      } 
    } else if (running) {
      return; // already running
    }

    // Start running
    running = true;
    schedule(loop);
  };

  return {
    start,
    get isDone() {
      return running;
    },
    get ticks() {
      return ticks;
    },
    cancel
  };
};

/**
 * Pauses execution for `timeoutMs`.
 * 
 * @example
 * ```js
 * console.log(`Hello`);
 * await sleep(1000);
 * console.log(`There`); // Prints one second after
 * ```
 * @param timeoutMs
 * @return
 */
export const sleep = <V>(timeoutMs: number): Promise<V> => new Promise<V>(resolve => setTimeout(resolve, timeoutMs));

/**
 * Pauses execution for `timeoutMs` after which the asynchronous `callback` is executed and awaited.
 * 
 * @example
 * ```js
 * const result = await delay(async () => Math.random(), 1000);
 * console.log(result); // Prints out result after one second
 * ```
 * @template V
 * @param callback
 * @param timeoutMs
 * @return
 */
export const delay = async <V>(callback:() => Promise<V>, timeoutMs: number): Promise<V> =>  {
  guardInteger(timeoutMs, `aboveZero`, `timeoutMs`);
  await sleep(timeoutMs);
  return Promise.resolve(await callback());
};

export type TimerSource = () => Timer;
/**
 * A timer that uses clock time
 *
 * @returns {Timer}
 */
export const msRelativeTimer = (): Timer => {
  // eslint-disable-next-line functional/no-let
  let start = window.performance.now();
  return {
    reset: () => {
      start = window.performance.now();
    },
    elapsed: () => (window.performance.now() - start)
  };
};

/**
 * A timer that progresses with each call
 *
 * @returns {Timer}
 */
export const tickRelativeTimer = (): Timer => {
  // eslint-disable-next-line functional/no-let
  let start = 0;
  return {
    reset: () => {
      start = 0;
    },
    elapsed: () => start++
  };
};