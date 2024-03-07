import { numberTest } from '../Guards.js';

/**
 * Interval types allows for more expressive coding, rather than embedding millisecond values.
 * 
 * That is, we can use `{ mins: 5 }` to mean 5 minutes rather than 5*60*1000 
 * or worse, 300000, for the same value.
 *
 * Examples:
 * ```js
 * { hours: 1 };  // 1 hour
 * { mins: 5 };   // 5 mins
 * { secs: 5 };   // 5 secs
 * { millis: 5 }; // 5 milliseconds
 * ```
 * 
 * Fields are be combined, adding the value.
 * ```js
 * { secs: 2, millis: 1 }; // equal 2001 milliseconds.
 * ```
 * 
 * Wherever ixfx takes an Interval, you can also just provide a number instead.
 * This will be taken as a millisecond value.
 * 
 * Use {@link intervalToMs} to convert to milliseconds. Use {@link Elapsed.toString} to get a human-readable representation of the Interval.s
 */
export type Interval =
  | number
  | {
    readonly millis?: number;
    readonly secs?: number;
    readonly hours?: number;
    readonly mins?: number;
  };

export function intervalToMs(interval: Interval | undefined): number | undefined;
export function intervalToMs(
  interval: Interval | undefined,
  defaultNumber: number
): number;


/**
 * Return the millisecond value of an Interval.
 * ```js
 * intervalToMs(100); // 100
 * intervalToMs({ millis: 100 }); // 100
 * ```
 *
 * Use `defaultNumber` to return a default in the case of
 * undefined or invalid input.
 *
 * ```js
 * intervalToMs(undefined); // undefined
 * intervalToMs(undefined, 100); // 100
 * ```
 *
 * If no default is provided, an exception is thrown.
 * @param interval Interval
 * @param defaultNumber Default value if `i` is undefined
 * @returns Milliseconds, or undefined
 */
export function intervalToMs(
  interval: Interval | undefined,
  defaultNumber?: number
): number | undefined {
  if (isInterval(interval)) {
    // Number given, must be millis?
    if (typeof interval === `number`) return interval;

    //eslint-disable-next-line functional/no-let
    let ms = interval.millis ?? 0;
    ms += (interval.hours ?? 0) * 60 * 60 * 1000;
    ms += (interval.mins ?? 0) * 60 * 1000;
    ms += (interval.secs ?? 0) * 1000;
    return ms;
  } else {
    if (typeof defaultNumber !== `undefined`) return defaultNumber;
    throw new Error(`Not a valid interval: ${ interval }`);
  }
}

export function isInterval(interval: number | Interval | undefined): interval is Interval {
  if (interval === undefined) return false;
  if (interval === null) return false;
  if (typeof interval === `number`) {
    if (Number.isNaN(interval)) return false;
    if (!Number.isFinite(interval)) return false;
    return true;
  } else if (typeof interval !== `object`) return false;

  const hasMillis = `millis` in interval;
  const hasSecs = `secs` in interval;
  const hasMins = `mins` in interval;
  const hasHours = `hours` in interval;
  if (hasMillis && !numberTest(interval.millis)[ 0 ]) return false;
  if (hasSecs && !numberTest(interval.secs)[ 0 ]) return false;
  if (hasMins && !numberTest(interval.mins)[ 0 ]) return false;
  if (hasHours && !numberTest(interval.hours)[ 0 ]) return false;
  if (hasMillis || hasSecs || hasHours || hasMins) return true;
  return false;
}
