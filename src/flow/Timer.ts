import {integer as guardInteger} from '../Guards.js';
import {clamp} from '../Util.js';

/**
 * Creates a timer
 * @private
 */
export type TimerSource = () => Timer;
 
/**
 * A timer instance
 * @private
 */
export type Timer = {
  reset(): void
  get elapsed(): number
}

export type ModTimer = Timer & {
  mod(amt:number):void
}
/**
 * @private
 */
export type HasCompletion = {
  get isDone(): boolean;
}

/**
 * A resettable timeout, returned by {@link timeout}
 */
export type Timeout = HasCompletion & {
  start(altTimeoutMs?: number, args?:readonly unknown[]): void;
  cancel(): void;
  get isDone(): boolean;
}

/**
 * Creates a debounce function
 * ```js
 * // Create
 * const d = debounce(fn, 1000);
 * 
 * // Use
 * d(); // Only calls fn after 1000s
 * ```
 * 
 * @example Handle most recent pointermove event after 1000ms
 * ```js
 * // Set up debounced handler
 * const moveDebounced = debounce((elapsedMs, evt) => {
 *    // Handle event
 * }, 500);
 * 
 * // Wire up event
 * el.addEventListener(`pointermove`, moveDebounced);
 * ```
 * 
 * Debounced function can be awaited:
 * ```js
 * const d = debounce(fn, 1000);
 * await d();
 * ```
 * @param callback 
 * @param timeoutMs 
 * @returns 
 */
export const debounce = (callback:TimeoutSyncCallback|TimeoutAsyncCallback, timeoutMs:number):DebouncedFunction => {
  const t = timeout(callback, timeoutMs);
  return (...args:unknown[]) => t.start(undefined, args);
};

/**
 * Debounced function
 * @private
 */
export type DebouncedFunction = (...args:readonly unknown[]) =>void

/***
 * Throttles a function. Callback only allowed to run after minimum of `intervalMinMs`.
 * 
 * @example Only handle move event every 500ms
 * ```js
 * const moveThrottled = throttle( (elapsedMs, args) => {
 *  // Handle ar
 * }, 500);
 * el.addEventListener(`pointermove`, moveThrottled)
 * ```
 * 
 * Note that `throttle` does not schedule invocations, but rather acts as a filter that
 * sometimes allows follow-through to `callback`, sometimes not. There is an expectation then
 * that the return function from `throttle` is repeatedly called, such as the case for handling
 * a stream of data/events.
 * 
 * @example Manual trigger
 * ```js
 * // Set up once
 * const t = throttle( (elapsedMs, args) => { ... }, 5000);
 * 
 * // Later, trigger throttle. Sometimes the callback will run,
 * // with data passed in to args[0]
 * t(data);
 * ```
 */
export const throttle = (callback:(elapsedMs:number, ...args:readonly unknown[]) => void|Promise<unknown>, intervalMinMs:number) => {
  //eslint-disable-next-line functional/no-let
  let trigger = 0;

  return async (...args:unknown[]) => {
    const elapsed = performance.now()-trigger; 
    if (elapsed >= intervalMinMs) {
      const r = callback(elapsed, ...args);
      if (typeof r === `object`) await r;
      trigger = performance.now();
    }
  };
};

export type IntervalAsync<V> = (() => V|Promise<V>) | Generator<V>;
/**
 * Generates values from `produce` with `intervalMs` time delay. 
 * `produce` can be a simple function that returns a value, an async function, or a generator.
 * 
 * @example Produce a random number every 500ms:
 * ```
 * const randomGenerator = interval(() => Math.random(), 1000);
 * for await (const r of randomGenerator) {
 *  // Random value every 1 second
 *  // Warning: does not end by itself, a `break` statement is needed
 * }
 * ```
 *
 * @example Return values from a generator every 500ms:
 * ```js
 * // Make a generator that counts to 10
 * const counter = count(10);
 * for await (const v of interval(counter, 1000)) {
 *  // Do something with `v`
 * }
 * ```
 * @template V Returns value of `produce` function
 * @param intervalMs Interval between execution
 * @param produce Function to call
 * @template V Data type
 * @returns
 */
export const interval = async function*<V>(produce: IntervalAsync<V>, intervalMs: number) {
  //eslint-disable-next-line functional/no-let
  let cancelled = false;
  try {
    //eslint-disable-next-line functional/no-loop-statement
    while (!cancelled) {
      await sleep(intervalMs);
      if (cancelled) return;
      if (typeof produce === `function`) {
        // Returns V or Promise<V>
        const result = await produce();
        yield result;
      } else if (typeof produce === `object`) {
        // Generator, perhaps?
        if (`next` in produce && `return` in produce && `throw` in produce) {
          const result = await produce.next();
          if (result.done) return;
          yield result.value; 
        } else {
          throw new Error(`interval: produce param does not seem to be a generator?`);
        }
      } else {
        throw new Error(`produce param does not seem to return a value/Promise and is not a generator?`);
      }
    }
  } finally {
    cancelled = true;
  }
};

export type TimeoutSyncCallback = (elapsedMs?:number, ...args:readonly unknown[]) => void

export type TimeoutAsyncCallback = (elapsedMs?:number, ...args:readonly unknown[]) => Promise<void>

/**
 * Returns a {@link Timeout} that can be triggered, cancelled and reset
 *  
 * Once `start()` is called, `callback` will be scheduled to execute after `timeoutMs`.
 * If `start()` is called again, the waiting period will be reset to `timeoutMs`.
 * 
 * @example Essential functionality
 * ```js
 * const fn = () => {
 *  console.log(`Executed`);
 * };
 * const t = timeout(fn, 60*1000); 
 * t.start();   // After 1 minute `fn` will run, printing to the console
 * ```
 * 
 * @example Control execution functionality
 * ```
 * t.cancel();  // Cancel it from running
 * t.start();   // Schedule again after 1 minute
 * t.start(30*1000); // Cancel that, and now scheduled after 30s
 * t.isDone;    // True if a scheduled event is pending
 * ```
 * 
 * Callback function receives any additional parameters passed in from start.
 * This can be useful for passing through event data:
 * 
 * @example
 * ```js
 * const t = timeout( (elapsedMs, ...args) => {
 *  // args contains event data
 * }, 1000);
 * el.addEventListener(`click`, t.start);
 * ```
 * 
 * Asynchronous callbacks can be used as well:
 * ```js
 * timeout(async () => {...}, 100);
 * ```
 * 
 * @param callback 
 * @param timeoutMs 
 * @returns {@link Timeout}
 */
export const timeout = (callback:TimeoutSyncCallback|TimeoutAsyncCallback, timeoutMs:number):Timeout => {
  if (callback === undefined) throw new Error(`callback parameter is undefined`);
  guardInteger(timeoutMs, `aboveZero`, `timeoutMs`);

  //eslint-disable-next-line functional/no-let
  let timer = 0;
  //eslint-disable-next-line functional/no-let
  let startedAt = 0;
  const start = async (altTimeoutMs:number = timeoutMs, args:unknown[]):Promise<void> => {
    
    const p = new Promise<void>((resolve, reject) => {
      startedAt = performance.now();
      try {
        guardInteger(altTimeoutMs, `aboveZero`, `altTimeoutMs`);
      } catch (e) {
        reject(e);
        return;
      }
      if (timer !== 0) cancel();
      timer = window.setTimeout(async () => {
        await callback(performance.now() - startedAt, ...args);
        timer = 0;
        resolve(undefined); 
      }, altTimeoutMs);
    });
    return p;
  };

  const cancel = () => {
    if (timer === 0) return;
    startedAt = 0;
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
 * Returns a {@link Continuously} that continuously executes `callback`. If callback returns _false_, loop exits.
 * 
 * Call `start` to begin/reset loop. `cancel` stops loop.
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
 * ```js
 * c.cancel();
 * c.elapsedMs;  // How many milliseconds have elapsed since start
 * c.ticks;      // How many iterations of loop since start
 * ```
 * 
 * Asynchronous callback functions are supported too:
 * ```js
 * continuously(async () => { ..});
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
      return running;
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

export type CancelToken = {
  readonly cancel:boolean
};

/**
 * Keeps executing `calback` until it runs without an exception being thrown.
 * 
 * ```
 * // Retry up to five times, starting at 200ms delay
 * await retry(async () => {
 *  // Do something, sometimes throwing an error
 * }, 5, 200);
 * ```
 * 
 * Each loop will run at twice the duration of the last, beginning at `startingTimeoutMs`.
 * 
 * @param callback Async code to run
 * @param attempts Number of times to try
 * @param startingTimeoutMs Time to sleep for first iteration
 * @param cancelToken If provided, this is checked before and after each sleep to see if retry should continue. If cancelled, promise will be rejected
 * @returns 
 */
export const retry = async <V>(callback:() => Promise<V>, attempts:number = 5, startingTimeoutMs:number = 200, cancelToken?:CancelToken):Promise<V> => {
  guardInteger(attempts, `positive`, `attempts`);
  guardInteger(startingTimeoutMs, `positive`, `startingTimeoutMs`);

  //eslint-disable-next-line functional/no-let
  let timeout = startingTimeoutMs;
  //eslint-disable-next-line functional/no-let
  let totalSlept = 0;
  //eslint-disable-next-line functional/no-loop-statement
  while (attempts > 0) {
    try {
      return await callback();
    } catch (ex) {
      attempts--;
    }
    totalSlept += timeout;

    if (cancelToken && cancelToken.cancel) throw new Error(`Cancelled`);
    await sleep(timeout);
    if (cancelToken && cancelToken.cancel) throw new Error(`Cancelled`);

    timeout *= 2;
  }
  throw new Error(`Retry failed after ${attempts} attempts over ${totalSlept} ms.`);

};


/**
 * Wraps a timer, returning a relative elapsed value.
 * 
 * ```js
 * let t = relativeTimer(1000, msElapsedTimer());
 * ```
 * 
 * @private
 * @param total 
 * @param timer 
 * @param clampValue If true, returned value never exceeds 1.0 
 * @returns 
 */
export const relativeTimer = (total:number, timer: Timer, clampValue = true):ModTimer & HasCompletion => {
  //eslint-disable-next-line functional/no-let
  let done = false;
  //eslint-disable-next-line functional/no-let
  let modAmt = 1;

  return {
    mod(amt:number) {
      modAmt = amt;
    },
    get isDone() {
      return done;
    },
    reset:() => {
      done = false;
      timer.reset();
    },
    get elapsed() {
      //eslint-disable-next-line functional/no-let
      let v = timer.elapsed / (total * modAmt);
      if (clampValue) v = clamp(v);
      if (v >= 1) done = true;
      return v;
    }
  };
};


export const frequencyTimerSource = (frequency:number):TimerSource => () => frequencyTimer(frequency, msElapsedTimer());
  
export const frequencyTimer = (frequency:number, timer:Timer = msElapsedTimer()):ModTimer => {
  const cyclesPerSecond = frequency/1000;
  //eslint-disable-next-line functional/no-let
  let modAmt = 1;
  return {
    mod:(amt:number) => {
      modAmt = amt;
    },
    reset:() => {
      timer.reset();
    },
    get elapsed() {
      // Get position in a cycle
      const v = timer.elapsed * (cyclesPerSecond * modAmt);

      // Get fractional part
      const f = v - Math.floor(v);
      if (f < 0) throw new Error(`Unexpected cycle fraction less than 0. Elapsed: ${v} f: ${f}`);
      if (f > 1) throw new Error(`Unexpected cycle fraction more than 1. Elapsed: ${v} f: ${f}`);
      return f;
    }
  };
};

/**
 * A timer that uses clock time
 * @private
 * @returns {Timer}
 */
export const msElapsedTimer = (): Timer => {
  // eslint-disable-next-line functional/no-let
  let start = performance.now();
  return {
    reset: () => {
      start = performance.now();
    },
    get elapsed() {
      return performance.now() - start;
    }
  };
};

/**
 * A timer that progresses with each call
 * @private
 * @returns {Timer}
 */
export const ticksElapsedTimer = (): Timer => {
  // eslint-disable-next-line functional/no-let
  let start = 0;
  return {
    reset: () => {
      start = 0;
    },
    get elapsed() { return start++; }
  };
};

export type UpdateFailPolicy = `fast` | `slow` | `backoff`; 
/**
 * Calls the async `fn` to generate a value if there is no prior value or
 * `intervalMs` has elapsed since value was last generated.
 * @example
 * ```js
 * const f = updateOutdated(async () => {
 *  const r = await fetch(`blah`);
 *  return await r.json();
 * }, 60*1000);
 * 
 * // Result will be JSON from fetch. If fetch happened already in the
 * // last 60s, return cached result. Otherwise it will fetch data
 * const result = await f();
 * ```
 * 
 * Callback `fn` is passed how many milliseconds have elapsed since last update. It's
 * minimum value will be `intervalMs`.
 * 
 * ```js
 * const f = updateOutdated(async elapsedMs => {
 *  // Do something with elapsedMs?
 * }, 60*1000;
 * ```
 * 
 * There are different policies for what to happen if `fn` fails. `slow` is the default.
 * * `fast`: Invocation will happen immediately on next attempt
 * * `slow`: Next invocation will wait `intervalMs` as if it was successful
 * * `backoff`: Attempts will get slower and slower until next success. Interval is multipled by 1.2 each time.
 * 
 * @param fn Async function to call. Must return a value.
 * @param intervalMs Maximum age of cached result
 * @param updateFail `slow` by default
 * @returns Value
 */
export const updateOutdated = <V>(fn:(elapsedMs?:number)=>Promise<V>, intervalMs:number, updateFail:UpdateFailPolicy = `slow`):()=>Promise<V> => {
  //eslint-disable-next-line functional/no-let
  let lastRun = 0;
  //eslint-disable-next-line functional/no-let
  let lastValue:V|undefined;
  //eslint-disable-next-line functional/no-let
  let intervalMsCurrent = intervalMs;

  return () => (new Promise(async (resolve, reject) => {
    const elapsed = performance.now() - lastRun;
    if (lastValue === undefined || elapsed > intervalMsCurrent) {
      try {
        lastRun = performance.now();
        lastValue = await fn(elapsed);
        intervalMsCurrent = intervalMs;
      } catch (ex) {
        if (updateFail === `fast`) {
          lastValue = undefined;
          lastRun = 0;
        } else if (updateFail === `backoff`) {
          intervalMsCurrent = Math.floor(intervalMsCurrent*1.2);
        }
        reject(ex);
        return;
      }
    } 
    resolve(lastValue);
  }));
};


/**
 * Helper function for calling code that should fail after a timeout.
 * 
 * ```js
 * const onAborted = (reason:string) => {
 *  // 'reason' is a string describing why it has aborted.
 *  // ie: due to timeout or because done() was called with an error
 * };
 * const onComplete = (success:boolean) => {
 *  // Called if we were aborted or finished succesfully.
 *  // onComplete will be called after onAborted, if it was an error case
 * }
 * const done = waitFor(1000, onAborted, onComplete);
 * 
 * // Call done if your code completed successfully:
 * done();
 * 
 * // Or if there was an error
 * done(`Some error`);
 * ```
 * 
 * The completion handler is used for removing event handlers.
 * 
 * @param timeoutMs 
 * @param onAborted 
 * @param onComplete 
 * @returns 
 */
export const waitFor = (timeoutMs:number, onAborted:(reason:string)=>void, onComplete?:(success:boolean)=>void) => {
  //eslint-disable-next-line functional/no-let
  let success = false;
  const done = (error?:string) => {
    if (t !== 0) {
      window.clearTimeout(t);
      t = 0;
    }
    if (error) {
      onAborted(error); 
    } else {
      success = true;
    }
    if (onComplete !== undefined) onComplete(success);
  };
  
  //eslint-disable-next-line functional/no-let
  let t = window.setTimeout(() => {
    t = 0;
    try {
      onAborted(`Timeout after ${timeoutMs}ms`);
    } finally {
      if (onComplete !== undefined) onComplete(success);
    }
  }, timeoutMs);

  return done;
};

// const counterG = count(5);
// const inter = interval(counterG, 1000);
// let loops = 0;
// for await (const r of inter) {
//   console.log(r);
//   loops++;
//   if (loops === 5) break;
// }