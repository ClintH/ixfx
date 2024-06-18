/* eslint-disable @typescript-eslint/unbound-method */
import { initStream } from "../InitStream.js";
import { resolveSource } from "../ResolveSource.js";
import type { ReactiveOrSource, CombineLatestOptions, Reactive, RxValueTypes } from "../Types.js";
import { messageIsDoneSignal, messageHasValue } from "../Util.js";

/**
 * Monitors input reactive values, storing values as they happen to an array.
 * Whenever a new value is emitted, the whole array is sent out, containing current
 * values from each source, or _undefined_ if not yet emitted.
 * 
 * See {@link combineLatestToObject} to combine streams by name into an object, rather than array.
 * 
 * ```
 * const sources = [
 *  Rx.fromFunction(Math.random, { loop: true, interval: 100 }),
 *  Rx.fromFunction(Math.random, { loop: true, interval: 200 })
 * ];
 * const r = Rx.combineLatestToArray(sources);
 * r.onValue(value => {
 *  // Value will be an array of last value from each source:
 *  // [number,number]  
 * });
 * ```
 * 
 * The tempo of this stream will be set by the fastest source stream.
 * See {@link syncToArray} to have pace determined by slowest source, and only
 * send when each source has produce a new value compared to last time.
 * 
 * Set `onSourceDone` to choose behaviour if a source stops. By default it
 * is 'break', meaning the whole merged stream stops.
 * 
 * Note: unlike RxJS's `combineLatest`, does not wait for each source to emit once
 * before emitting first value.
 * @param reactiveSources Sources to merge
 * @param options Options for merging 
 * @returns 
 */
export function combineLatestToArray<const T extends ReadonlyArray<ReactiveOrSource<any>>>(reactiveSources: T, options: Partial<CombineLatestOptions> = {}): Reactive<RxValueTypes<T>> {
  const event = initStream<RxValueTypes<T>>();
  const onSourceDone = options.onSourceDone ?? `break`;
  const data: Array<RxValueTypes<T> | undefined> = [];
  const sources = reactiveSources.map(source => resolveSource(source));
  const noop = () => {/** no-op */ };
  const sourceOff = sources.map(_ => noop);
  const doneSources = sources.map(_ => false);

  const unsub = () => {
    for (const v of sourceOff) { v() }
  }

  for (const [ index, v ] of sources.entries()) {
    data[ index ] = undefined;
    sourceOff[ index ] = v.on(message => {
      if (messageIsDoneSignal(message)) {
        doneSources[ index ] = true;
        sourceOff[ index ]();
        sourceOff[ index ] = noop;
        if (onSourceDone === `break`) {
          unsub();
          event.dispose(`Source has completed and 'break' is set`);
          return;
        }
        if (!doneSources.includes(false)) {
          // All sources are done
          unsub();
          event.dispose(`All sources completed`);
        }
      } else if (messageHasValue(message)) {
        data[ index ] = message.value;
        event.set([ ...data ] as RxValueTypes<T>);
      }
    });
  }

  return {
    dispose: event.dispose,
    isDisposed: event.isDisposed,
    on: event.on,
    onValue: event.onValue
  }
}
