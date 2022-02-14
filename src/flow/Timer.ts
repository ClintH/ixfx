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
 * const moveDebounced = debounce((evt) => {
 *    // Handle event
 * }, 500);
 * 
 * // Wire up event
 * el.addEventListener(`pointermove`, moveDebounced);
 * ```
 * @param callback 
 * @param timeoutMs 
 * @returns 
 */
export const debounce = (callback:()=> void, timeoutMs:number) => {
  const t = timeout(callback, timeoutMs);
  return (...args:unknown[]) => t.start(undefined, args);
};

/***
 * Throttles an function. Callback only triggered after minimum of `intervalMinMs`.
 * 
 * @example Only handle move event every 500ms
 * ```js
 * const moveThrottled = throttle( (elapsedMs, args) => {
 *  // Handle ar
 * }, 500);
 * el.addEventListener(`pointermove`, moveThrottled)
 * ```
 */
export const throttle = (callback:(elapsedMs:number, ...args:readonly unknown[]) => void, intervalMinMs:number) => {
  //eslint-disable-next-line functional/no-let
  let trigger = 0;

  return (...args:unknown[]) => {
    const elapsed = performance.now()-trigger; 
    if (elapsed >= intervalMinMs) {
      callback(elapsed, ...args);
      trigger = performance.now();
    }
  };
};

/**
 * Generates values from `produce` with `intervalMs` time delay
 * 
 * @example Produce a random number every 500ms:
 * ```
 * const randomGenerator = interval(() => Math.random(), 1000);
 * for await (const r of randomGenerator) {
 *  // Random value every 1 second
 * }
 * ```
 *
 * @template V
 * @param intervalMs Interval between execution
 * @param produce Function to call
 * @template V Data type
 * @returns
 */
export const interval = async function*<V>(produce: () => Promise<V>, intervalMs: number) {
  //eslint-disable-next-line functional/no-let
  let cancelled = false;
  //eslint-disable-next-line functional/no-try-statement
  try {
    //eslint-disable-next-line functional/no-loop-statement
    while (!cancelled) {
      await sleep(intervalMs);
      if (cancelled) return;
      yield await produce();
    }
  } finally {
    cancelled = true;
  }
};

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
 * @param callback 
 * @param timeoutMs 
 * @returns {@link Timeout}
 */
export const timeout = (callback:(elapsedMs?:number, ...args:readonly unknown[])=>void, timeoutMs:number):Timeout => {
  if (callback === undefined) throw new Error(`callback parameter is undefined`);
  guardInteger(timeoutMs, `aboveZero`, `timeoutMs`);

  //eslint-disable-next-line functional/no-let
  let timer = 0;
  //eslint-disable-next-line functional/no-let
  let startedAt = 0;

  const start = (altTimeoutMs:number = timeoutMs, ...args:unknown[]) => {
    startedAt = performance.now();
    guardInteger(altTimeoutMs, `aboveZero`, `altTimeoutMs`);
    if (timer !== 0) cancel();
    timer = window.setTimeout(() => {
      callback(performance.now() - startedAt, ...args);
      timer = 0;
    }, altTimeoutMs);
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
 * @param callback Function to run. If it returns false, loop exits.
 * @param resetCallback Callback when/if loop is reset. If it returns false, loop exits
 * @param intervalMs 
 * @returns 
 */
export const continuously = (callback:(ticks?:number, elapsedMs?:number)=>boolean|void, intervalMs?:number, resetCallback?:((ticks?:number, elapsedMs?:number) => boolean|void)):Continuously => {
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

  const loop = () => {
    //console.log(`loop`);
    if (!running) return;
    const r = callback(ticks++, performance.now() - startedAt);
    if (r !== undefined && !r) {
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