import { Adsr } from './envelope/Adsr.js';
import type { AdsrIterableOpts, EnvelopeOpts } from './envelope/Types.js';
import { resolveWithFallbackSync } from '@ixfx/core';
import { repeat } from '@ixfx/flow';

export * from './envelope/Types.js';
export * from './envelope/Adsr.js';
export * from './envelope/AdsrBase.js';

/**
 * Returns a function that iterates over an envelope
 * ```js
 * const e = Envelopes.adsr();
 * 
 * e(); // Yields current value
 * ```
 * 
 * Starts the envelope the first time the return function is called.
 * When the envelope finishes, it continues to return the `releaseLevel` of the envelope.
 * 
 * Options can be provided to set the shape of the envelope as usual, eg:
 * ```js
 * const e = Envelopes.adsr({
 *  attackDuration: 1000,
 *  releaseDuration: 500
 * });
 * ```
 * @param opts 
 * @returns 
 */
export const adsr = (opts: EnvelopeOpts = {}): () => number => {
  const envelope = new Adsr(opts);
  const finalValue = envelope.releaseLevel;
  const iterator = envelope[ Symbol.iterator ]();
  return () => resolveWithFallbackSync(iterator, { overrideWithLast: true, value: finalValue });
}

/**
 * Creates and runs an envelope, sampling its values at `sampleRateMs`.
 * Note that if the envelope loops, iterator never returns.
 *
 * @example Init
 * ```js
 * import { Envelopes } from '@ixfx/modulation.js';
 * import { IterableAsync } from  '@ixfx/iterable.js';
 *
 * const opts = {
 *  attackDuration: 1000,
 *  releaseDuration: 1000,
 *  sustainLevel: 1,
 *  attackBend: 1,
 *  decayBend: -1
 * };
 * ```
 *
 * ```js
 * //  Add data to array
 * // Sample an envelope every 20ms into an array
 * const data = await IterableAsync.toArray(Envelopes.adsrIterable(opts, 20));
 * ```
 *
 * ```js
 * // Iterate with `for await`
 * // Work with values as sampled
 * for await (const v of Envelopes.adsrIterable(opts, 5)) {
 *  // Work with envelope value `v`...
 * }
 * ```
 * @param opts Envelope options
 * @returns
 */
export async function* adsrIterable(
  opts: AdsrIterableOpts
): AsyncGenerator<number> {
  const envelope = new Adsr(opts.env);
  const sampleRateMs = opts.sampleRateMs ?? 100;
  envelope.trigger();

  const r = repeat<number>(() => envelope.value, {
    while: () => !envelope.isDone,
    delay: sampleRateMs,
    signal: opts.signal,
  })
  for await (const v of r) {
    yield v;
  }
}
