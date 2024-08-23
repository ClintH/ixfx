import { intervalToMs } from "../flow/IntervalType.js";
import type { ReactiveOrSource, ToArrayOptions } from "./Types.js";
import { resolveSource } from "./ResolveSource.js";
import { messageHasValue, messageIsDoneSignal } from "./Util.js";

/**
 * Reads a set number of values from `source`, returning as an array. May contain
 * empty values if desired values is not reached.
 * 
 * After the limit is reached (or `source` completes), `source` is unsubscribed from.
 * 
 * If no limit is set, it will read until `source` completes or `maximumWait` is reached.
 * `maximumWait` is 10 seconds by default.
 * 
 * Use {@link toArrayOrThrow} to throw if desired limit is not reached.
 * 
 * ```js
 * // Read from `source` for 5 seconds
 * const data = await toArray()(source);
 * // Read 5 items from `source`
 * const data = await toArray({ limit: 5 })(source);
 * // Read for 10s
 * const data = await toArray({ maximumWait: 10_1000 })(source);
 * ```
 * @param source 
 * @param options 
 * @returns 
 */
export async function toArray<V>(source: ReactiveOrSource<V>, options: Partial<ToArrayOptions<V>> = {}): Promise<Array<V | undefined>> {
  const limit = options.limit ?? Number.MAX_SAFE_INTEGER;
  const maximumWait = intervalToMs(options.maximumWait, 10 * 1000);
  const underThreshold = options.underThreshold ?? `partial`
  const read: Array<V | undefined> = [];

  const rx = resolveSource(source);

  const promise = new Promise<Array<V | undefined>>((resolve, reject) => {
    const done = () => {
      clearTimeout(maxWait);
      unsub();
      if (read.length < limit && underThreshold === `throw`) {
        reject(new Error(`Threshold not reached. Wanted: ${ limit } got: ${ read.length }. Maximum wait: ${ maximumWait }`));
        return;
      }
      if (read.length < limit && underThreshold === `fill`) {
        for (let index = 0; index < limit; index++) {
          if (read[ index ] === undefined) {
            //console.log(`Rx.toArray filling at index: ${ index }`);
            read[ index ] = options.fillValue;
          }
        }
      }
      resolve(read);
    }

    const maxWait = setTimeout(() => {
      done();
    }, maximumWait);

    const unsub = rx.on(message => {
      //console.log(`Rx.toArray: ${ JSON.stringify(message) }`);
      if (messageIsDoneSignal(message)) {
        done();
      } else if (messageHasValue(message)) {
        read.push(message.value);
        //console.log(`Rx.toArray read buffer: ${ JSON.stringify(read) }`);
        if (read.length === limit) {
          done();
        }
      }
    });
  });

  return promise;
}


/**
 * By default, reads all the values from `source`, or until 5 seconds has elapsed.
 * 
 * If `limit` is provided as an option, it will exit early, or throw if that number of values was not acheived.
 * 
 * ```js
 * // Read from `source` for 5 seconds
 * const data = await toArrayOrThrow()(source);
 * // Read 5 items from `source`
 * const data = await toArrayOrThrow({ limit: 5 })(source);
 * // Read for 10s
 * const data = await toArrayOrThrow({ maximumWait: 10_1000 })(source);
 * ```
 * @param source 
 * @param options 
 * @returns 
 */
export async function toArrayOrThrow<V>(source: ReactiveOrSource<V>, options: Partial<ToArrayOptions<V>> = {}): Promise<Array<V>> {
  const limit = options.limit ?? Number.MAX_SAFE_INTEGER;
  const maximumWait = options.maximumWait ?? 5 * 1000;
  const v = await toArray(source, { limit, maximumWait, underThreshold: `partial` });

  // There was a limit, but it wasn't reached
  if (options.limit && v.length < options.limit) throw new Error(`Threshold not reached. Wanted: ${ options.limit }, got ${ v.length }`);

  // Otherwise, we may have been reading for a specified duration
  return v as Array<V>;

}