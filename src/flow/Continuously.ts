import {integer as guardInteger} from '../Guards.js';
import {HasCompletion} from './index.js';

/**
 * Runs a function continuously, returned by {@link Continuously}
 */
export type Continuously = HasCompletion & {
  /**
   * Starts loop. If already running, it is reset
   */
  start(): void
  /**
   * How many milliseconds since start() was last called
   */
  get elapsedMs(): number
  /**
   * How many iterations of the loop since start() was last called
   */
  get ticks(): number
  /**
   * Whether loop has finished
   */
  get isDone(): boolean
  /**
   * Stops loop
   */
  cancel(): void
}

export type ContinuouslySyncCallback = (ticks?:number, elapsedMs?:number) => boolean|void
export type ContinuouslyAsyncCallback = (ticks?:number, elapsedMs?:number) => Promise<boolean|void>

/**
 * Returns a {@link Continuously} that continuously executes `callback`. 
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
 * And if `callback` explicitly returns _false_, the loop will exit:
 * ```js
 * continuously((ticks) => {
 *  // Stop after 100 iterations
 *  if (ticks > 100) return false;
 * }).start();
 * ```
 * @param callback Function to run. If it returns false, loop exits.
 * @param resetCallback Callback when/if loop is reset. If it returns false, loop exits
 * @param intervalMs 
 * @returns 
 */
export const continuously = (callback:ContinuouslyAsyncCallback|ContinuouslySyncCallback, intervalMs?:number, resetCallback?:((ticks?:number, elapsedMs?:number) => boolean|void)):Continuously => {
  if (intervalMs !== undefined) guardInteger(intervalMs, `positive`, `intervalMs`);

  //eslint-disable-next-line functional/no-let
  let running = false;
  //eslint-disable-next-line functional/no-let
  let ticks = 0;
  //eslint-disable-next-line functional/no-let
  let startedAt = performance.now();
  const schedule = (intervalMs === undefined || intervalMs === 0) ? (cb:()=>void) => window.requestAnimationFrame(cb) : (cb:()=>void) => window.setTimeout(cb, intervalMs);
  const cancel = () => {
    if (!running) return;
    running = false;
    ticks = 0;
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

    schedule(loop);
  };

  const start = () => {
    // Already running, but theres a resetCallback to check if we should keep going
    if (running && resetCallback !== undefined) {
      const r = resetCallback(ticks, performance.now() - startedAt);
      startedAt = performance.now();
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
      return !running;
    },
    get ticks() {
      return ticks;
    },
    get elapsedMs() {
      return performance.now() - startedAt;
    },
    cancel
  };
};