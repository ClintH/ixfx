import { integer as guardInteger } from '../Guards.js';
import { HasCompletion } from './index.js';

/**
 * Runs a function continuously, returned by {@link Continuously}
 */
export type Continuously = HasCompletion & {
  /**
   * Starts loop. If already running, does nothing
   */
  start():void

  /**
   * (Re-)starts the loop. If an existing iteration has been
   * scheduled, this is cancelled and started again.
   * 
   * This can be useful when adjusting the interval
   */
  reset():void
  /**
   * How many milliseconds since start() was last called
   */
  get elapsedMs():number
  /**
   * How many iterations of the loop since start() was last called
   */
  get ticks():number
  /**
   * Returns true if the loop is not running (for some reason or another)
   */
  get isDone():boolean
  /**
   * If disposed, the continuously instance won't be re-startable
   */
  get isDisposed():boolean
  /**
   * Stops loop. It can be restarted using .start()
   */
  cancel():void
  /**
   * Set interval. Change will take effect on next loop. For it to kick
   * in earlier, call .reset() after changing the value.
   */
  set intervalMs(ms:number);
  get intervalMs():number
}

export type ContinuouslySyncCallback = (ticks?:number, elapsedMs?:number)=>boolean|void
export type ContinuouslyAsyncCallback = (ticks?:number, elapsedMs?:number)=>Promise<boolean|void>

const raf = typeof window !== `undefined` ? (cb:()=>void) => window.requestAnimationFrame(cb) : (cb:()=>void) => window.setTimeout(cb, 1);

export type OnStartCalled = `continue` | `cancel` | `reset` | `dispose`

//eslint-disable-next-line functional/no-mixed-type
export type ContinuouslyOpts = {
  readonly fireBeforeWait?:boolean
  /**
   * Called whenever .start() is invoked.
   * If this function returns:
   *  - `continue`: the loop starts if it hasn't started yet, or continues if already started
   *  - `cancel`: loop stops, but can be re-started if .start() is called again
   *  - `dispose`: loop stops and will throw an error if .start() is attempted to be called 
   *  - `reset`: loop resets (ie. existing scheduled task is cancelled)
   *  
   */
  readonly onStartCalled?:((ticks?:number, elapsedMs?:number)=>OnStartCalled)
}

/**
 * Returns a {@link Continuously} that continuously at `intervalMs`, executing `callback`.
 * By default, first the sleep period happens and then the callback happens.
 * Use {@link Timeout} for a single event.
 *  
 * If callback returns _false_, loop exits.
 * 
 * Call `start` to begin/reset loop. `cancel` stops loop.
 * 
 * @example Animation loop
 * ```js
 * const draw = () => {
 *  // Draw on canvas
 * }
 * 
 * // Run draw() synchronised with monitor refresh rate via `window.requestAnimationFrame`
 * continuously(draw).start();  
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
 * @example Control a 'continuously'
 * ```js
 * c.cancel();   // Stop the loop, cancelling any up-coming calls to `fn`
 * c.elapsedMs;  // How many milliseconds have elapsed since start
 * c.ticks;      // How many iterations of loop since start
 * c.intervalMs; // Get/set speed of loop. Change kicks-in at next loop. 
 *               // Use .start() to reset to new interval immediately
 * ```
 * 
 * Asynchronous callback functions are supported too:
 * ```js
 * continuously(async () => { ..});
 * ```
 * 
 * The `callback` function can receive a few arguments:
 * ```js
 * continuously( (ticks, elapsedMs) => {
 *  // ticks: how many times loop has run
 *  // elapsedMs:  how long since last loop
 * }).start();
 * ```
 * 
 * If the callback explicitly returns _false_, the loop will be cancelled
 * ```js
 * continuously(ticks => {
 *  // Stop after 100 iterations
 *  if (ticks > 100) return false;
 * }).start();
 * ```
 * 
 * You can intercept the logic for calls to `start()` with `onStartCalled`. It can determine
 * whether the `start()` proceeds, if the loop is cancelled, or the whole thing disposed,
 * so it can't run any longer.
 * ```js
 * continuously(callback, intervalMs, {
 *  onStartCalled:(ticks, elapsedMs) => {
 *    if (elapsedMs > 1000) return `cancel`;
 *  }
 * }).start();
 * ```
 * 
 * To run `callback` *before* the sleep happens, set `fireBeforeWait`:
 * ```js
 * continuously(callback, intervalMs, { fireBeforeWait: true });
 * ```
 * @param callback Function to run. If it returns false, loop exits.
 * @param opts Additional options
 * @param intervalMs 
 * @returns 
 */
export const continuously = (callback:ContinuouslyAsyncCallback|ContinuouslySyncCallback, intervalMs?:number, opts:ContinuouslyOpts = {}):Continuously => {
  if (intervalMs !== undefined) guardInteger(intervalMs, `positive`, `intervalMs`);
  const fireBeforeWait = opts.fireBeforeWait ?? false;
  const onStartCalled = opts.onStartCalled;

  //eslint-disable-next-line functional/no-let
  let disposed = false;
  //eslint-disable-next-line functional/no-let
  let running = false;
  //eslint-disable-next-line functional/no-let
  let ticks = 0;
  //eslint-disable-next-line functional/no-let
  let startedAt = performance.now();
  //eslint-disable-next-line functional/no-let
  let iMs = (intervalMs === undefined) ? 0 : intervalMs;
  //eslint-disable-next-line functional/no-let
  let currentTimer = 0;

  const schedule = (iMs === 0) ? raf : (cb:()=>void) => window.setTimeout(cb, iMs);
  const deschedule = (iMs === 0) ? (_:number) => { /** no-op */ } : (timer:number) => window.clearTimeout(timer);

  const cancel = () => {
    if (!running) return;
    running = false;
    ticks = 0;
    if (currentTimer !== 0) deschedule(currentTimer);
    currentTimer = 0;
  };

  const loop = async () => {
    if (!running) return;
    const valOrPromise = callback(ticks++, performance.now() - startedAt);
    //eslint-disable-next-line functional/no-let
    let val;
    if (typeof valOrPromise === `object`) {
      val = await valOrPromise;
    } else {
      val = valOrPromise;
    }
    if (val !== undefined && !val) {
      cancel();
      return;
    }
    currentTimer = schedule(loop);
  };

  const start = () => {
    if (disposed) throw new Error(`Disposed`);
    
    if (onStartCalled !== undefined) {
      // Function governs whether to allow .start() to go ahead
      const doWhat = onStartCalled(ticks, performance.now() - startedAt);      
      if (doWhat === `cancel`) {
        cancel();
        return;
      } else if (doWhat === `reset`) {
        reset();
        return;
      } else if (doWhat === `dispose`) {
        disposed = true;
        cancel();
        return;
      }
    }

    if (!running) {
      // Start running
      startedAt = performance.now();
      running = true;
      if (fireBeforeWait) {
        loop(); // Exec first, then wait
      } else {
        currentTimer = schedule(loop); // Wait first, then exec
      }
    }
  };

  const reset = () => {
    if (disposed) throw new Error(`Disposed`);
    
    // Cancel scheduled iteration
    if (running) {
      cancel();
    }
    start();
  };

  return {
    start,
    reset,
    cancel,
    get intervalMs() {
      return iMs;
    },
    set intervalMs(ms:number) {
      guardInteger(ms, `positive`, `ms`);
      iMs = ms;
    },
    get isDone() {
      return !running;
    },
    get isDisposed() {
      return disposed;
    },
    get ticks() {
      return ticks;
    },
    get elapsedMs() {
      return performance.now() - startedAt;
    }
  };
};