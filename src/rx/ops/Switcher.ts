import { initStream } from "../InitStream.js";
import { resolveSource } from "../ResolveSource.js";
import type { ReactiveOrSource, Reactive, ReactiveStream } from "../Types.js";
import { messageHasValue, messageIsDoneSignal } from "../Util.js";
import type { FilterPredicate, SwitcherOptions } from "./Types.js";

/**
 * Switcher generates several output streams, labelled according to the values of `cases`.
 * Values from `source` are fed to the output streams if their associated predicate function returns _true_.
 * 
 * In this way, we can split one input stream into several output streams, each potentially getting a different
 * subset of the input.
 * 
 * With `options`, you can specify whether to send to multiple outputs if several match, or just the first (default behaviour).
 * 
 * The below example shows setting up a switcher and consuming the output streams.
 * @example
 * ```js
 * // Initialise a reactive number, starting at 0
 * const switcherSource = Reactive.number(0);
 * // Set up the switcher
 * const x = Reactive.switcher(switcherSource, {
 *  even: v => v % 2 === 0,
 *  odd: v => v % 2 !== 0
 * });
 * // Listen for outputs from each of the resulting streams
 * x.even.on(msg => {
 *   log(`even: ${msg.value}`);
 * });
 * x.odd.on(msg => {
 *   log(`odd: ${msg.value}`);
 * })
 * // Set new values to the number source, counting upwards
 * // ...this will in turn trigger the outputs above
 * setInterval(() => {
 *   switcherSource.set(switcherSource.last() + 1);
 * }, 1000);
 * ```
 * 
 * If `source` closes, all the output streams will be closed as well.
 * @param reactiveOrSource 
 * @param cases 
 * @param options 
 * @returns 
 */
export const switcher = <TValue, TRec extends Record<string, FilterPredicate<TValue>>, TLabel extends keyof TRec>(reactiveOrSource: ReactiveOrSource<TValue>, cases: TRec, options: Partial<SwitcherOptions> = {}): Record<TLabel, Reactive<TValue>> => {
  // return (r: ReactiveOrSource<TValue>): Record<TLabel, Reactive<TValue>> => {
  const match = options.match ?? `first`;
  const source = resolveSource(reactiveOrSource);
  let disposed = false;
  // Setup output streams
  const t: Partial<Record<TLabel, ReactiveStream<TValue>>> = {}
  for (const label of Object.keys(cases)) {
    (t as any)[ label ] = initStream<TValue>();
  }

  const performDispose = () => {
    if (disposed) return;
    unsub();
    disposed = true;
    for (const stream of Object.values(t)) {
      (stream as ReactiveStream<any>).dispose(`switcher source dispose`);
    }
  }

  // Listen to source
  const unsub = source.on(message => {
    // Got a value
    if (messageHasValue(message)) {
      for (const [ lbl, pred ] of Object.entries(cases)) {
        if (pred(message.value)) {
          ((t as any)[ lbl ] as ReactiveStream<TValue>).set(message.value);
          if (match === `first`) break;
        }
      }
    } else if (messageIsDoneSignal(message)) {
      performDispose();
    }
  })
  return t as Record<TLabel, Reactive<TValue>>;
  // }
}
