export type TrackChangeResult = {
  /**
   * If value has changed
   */
  changed: boolean
  /**
   * Number of times value has changed for duration of monitor
   */
  changes: number
  /**
   * Number of times the same value has come
   * up in a row
   */
  identicalRun: number
  /**
   * Number of values total
   */
  total: number
};

export type TrackChangeOptions<T> = {
  includeFirstValueInCount: boolean
  initial: T
}

export type TrackNumberChangeOptions = TrackChangeOptions<number> & {
  nanHandling: `allow` | `skip` | `error`
}

/**
 * Run a function if a value changes
 * ```js
 * const r = handleChangeResult(trackNumberChange, (value) => {
 *  // Called when value changes
 * });
 * r(10);
 * ```
 * @param monitor 
 * @param onChanged 
 * @param onNotChanged 
 * @returns 
 */
export function handleChangeResult<T>(monitor: (v: T) => TrackChangeResult, onChanged: (v: T, countChanges: number, countTotal: number) => void, onNotChanged?: (v: T, countIdentical: number, countTotal: number) => void) {
  return (v: T): void => {
    const r = monitor(v);
    if (r.changed) {
      onChanged(v, r.changes, r.total);
    }
    else if (typeof onNotChanged !== `undefined`) {
      onNotChanged(v, r.identicalRun, r.total);
    }
  };
}

/**
 * Returns a function to monitor value changes.
 * ```js
 * const f = trackNumberChange(true);
 * f(10); // { changed: true, changesCount: 1 }
 * f(10); // { changed: false, changesCount: 1 }
 * ```
 * 
 * Default options:
 * * nanHandling: error
 * * includeFirstValueInCount: false
 * 
 * NaN handling:
 * * allow: use NaN value as a legal value and report a change
 * * skip: ignore NaN values, reporting back no change and use the same changes count
 * * error: throw an error if a NaN value is received
 * 
 * 
 * @returns 
 */
export function trackNumberChange(options: Partial<TrackNumberChangeOptions> = {}) {
  const nanHandling = options.nanHandling ?? `error`
  const includeFirstValueInCount = options.includeFirstValueInCount ?? false
  let lastValue: number | undefined = options.initial;
  let changes = 0;
  let total = 0;
  let identicalRun = 0;
  return (v: number): TrackChangeResult => {
    if (typeof v !== `number`) throw new TypeError(`Parameter should be number. Got type: ${ typeof v }`);

    if (Number.isNaN(v)) {
      switch (nanHandling) {
        case `error`:
          throw new Error(`Parameter is NaN`);
        case `skip`:
          return { changed: false, changes, total, identicalRun };
      }
    }
    total++;
    let eq = lastValue === v;
    // Because two NaNs don't equal (!?)
    if (Number.isNaN(lastValue) && Number.isNaN(v)) eq = true;

    if (!eq) {
      identicalRun = 0;
      if (lastValue !== undefined || includeFirstValueInCount) {
        changes++;
      }
      lastValue = v;
      return { changed: true, changes, total, identicalRun };
    }
    else {
      identicalRun++;
    }
    return { changed: false, changes, total, identicalRun };
  };
}



/**
 * Returns a function to track changes in a boolean value
 * ```js
 * const t = trackBooleanChange();
 * t(true); // { changed:false }
 * t(true); // { changed:false }
 * t(false); // { changed: true }
 * ```
 * 
 * Default options:
 * * includeFirstValueInCount: false
 * @param options 
 * @returns 
 */
export function trackBooleanChange(options: Partial<TrackChangeOptions<boolean>> = {}) {
  const includeFirstValueInCount = options.includeFirstValueInCount ?? false;
  let lastValue: boolean | undefined = options.initial;
  let changes = 0;
  let total = 0;
  let identicalRun = 0;

  return (v: boolean): TrackChangeResult => {
    if (typeof v !== `boolean`) throw new TypeError(`Parameter should be boolean. Got type: ${ typeof v }`);
    total++;
    if (lastValue !== v) {
      identicalRun = 0;
      if (lastValue !== undefined || includeFirstValueInCount) {
        changes++;
      }
      lastValue = v;
      return { changed: true, changes, total, identicalRun };
    }
    else {
      identicalRun++;
    }
    return { changed: false, changes, total, identicalRun };
  };
}
