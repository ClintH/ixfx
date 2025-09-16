import { Paths, Beziers } from '@ixfx/geometry';
import { scale } from '@ixfx/numbers';
import { AdsrBase } from './AdsrBase.js';
import type { EnvelopeOpts } from './Types.js';

export const defaultAdsrOpts = Object.freeze({
  attackBend: -1,
  decayBend: -0.3,
  releaseBend: -0.3,
  peakLevel: 1,
  initialLevel: 0,
  sustainLevel: 0.6,
  releaseLevel: 0,
  retrigger: false
})

export class AdsrIterator implements Iterator<number> {

  constructor(private adsr: Adsr) {

  }

  next(...args: [] | [ undefined ]): IteratorResult<number> {
    if (!this.adsr.hasTriggered) {
      this.adsr.trigger();
    }

    const c = this.adsr.compute();
    return {
      value: c[ 1 ],
      done: c[ 0 ] === `complete`
    }
  }

  readonly [ Symbol.toStringTag ] = `Generator`;
}
/**
 * ADSR (Attack Decay Sustain Release) envelope. An envelope is a value that changes over time,
 * usually in response to an intial trigger.
 *
 * [See the ixfx Guide on Envelopes](https://ixfx.fun/modulation/envelopes/introduction/).
 *
 * @example Setup
 * ```js
 * const env = new Envelopes.Adsr({
 *  attackDuration: 1000,
 *  decayDuration: 200,
 *  sustainDuration: 100
 * });
 * ```
 *
 * Options for envelope are as follows:
 *
 * ```js
 * initialLevel?: number
 * attackBend: number
 * attackDuration: number
 * decayBend: number
 * decayDuration:number
 * sustainLevel: number
 * releaseBend: number
 * releaseDuration: number
 * releaseLevel?: number
 * peakLevel: number
 * retrigger?: boolean
 * shouldLoop: boolean
 * ```
 *
 * If `retrigger` is _false_ (default), a re-triggered envelope continues at current value
 * rather than resetting to `initialLevel`.
 *
 * If `shouldLoop` is true, envelope loops until `release()` is called.
 *
 * @example Using
 * ```js
 * env.trigger(); // Start envelope
 * ...
 * // Get current value of envelope
 * const [state, scaled, raw] = env.compute();
 * ```
 *
 * * `state` is a string, one of the following: 'attack', 'decay', 'sustain', 'release', 'complete'
 * * `scaled` is a value scaled according to the stage's _levels_
 * * `raw` is the progress from 0 to 1 within a stage. ie. 0.5 means we're halfway through a stage.
 *
 * Instead of `compute()`, most usage of the envelope is just fetching the `value` property, which returns the same scaled value of `compute()`:
 *
 * ```js
 * const value = env.value; // Get scaled number
 * ```
 *
 * @example Hold & release
 * ```js
 * env.trigger(true);   // Pass in true to hold
 * ...envelope will stop at sustain stage...
 * env.release();      // Release into decay
 * ```
 *
 * Check if it's done:
 *
 * ```js
 * env.isDone; // True if envelope is completed
 * ```
 *
 * Envelope has events to track activity: 'change' and 'complete':
 *
 * ```
 * env.addEventListener(`change`, ev => {
 *  console.log(`Old: ${evt.oldState} new: ${ev.newState}`);
 * })
 * ```
 * 
 * It's also possible to iterate over the values of the envelope:
 * ```js
 * const env = new Envelopes.Adsr();
 * for await (const v of env) {
 *  // v is the numeric value
 *  await Flow.sleep(100); // Want to pause a little to give envelope time to run
 * }
 * // Envelope has finished
 * ```
 */
export class Adsr extends AdsrBase implements Iterable<number> {
  readonly attackPath: Paths.Path;
  readonly decayPath: Paths.Path;
  readonly releasePath: Paths.Path;

  readonly initialLevel: number;
  readonly peakLevel: number;
  readonly releaseLevel: number;
  readonly sustainLevel: number;

  readonly attackBend: number;
  readonly decayBend: number;
  readonly releaseBend: number;

  protected initialLevelOverride: number | undefined;
  readonly retrigger: boolean;
  private releasedAt: number | undefined;

  constructor(opts: EnvelopeOpts = {}) {
    super(opts);

    this.retrigger = opts.retrigger ?? defaultAdsrOpts.retrigger;

    this.initialLevel = opts.initialLevel ?? defaultAdsrOpts.initialLevel;
    this.peakLevel = opts.peakLevel ?? defaultAdsrOpts.peakLevel;
    this.releaseLevel = opts.releaseLevel ?? defaultAdsrOpts.releaseLevel;
    this.sustainLevel = opts.sustainLevel ?? defaultAdsrOpts.sustainLevel;

    this.attackBend = opts.attackBend ?? defaultAdsrOpts.attackBend;
    this.releaseBend = opts.releaseBend ?? defaultAdsrOpts.releaseBend;
    this.decayBend = opts.decayBend ?? defaultAdsrOpts.decayBend;

    const max = 1;
    this.attackPath = Beziers.toPath(
      Beziers.quadraticSimple(
        { x: 0, y: this.initialLevel },
        { x: max, y: this.peakLevel },
        -this.attackBend
      )
    );
    this.decayPath = Beziers.toPath(
      Beziers.quadraticSimple(
        { x: 0, y: this.peakLevel },
        { x: max, y: this.sustainLevel },
        -this.decayBend
      )
    );
    this.releasePath = Beziers.toPath(
      Beziers.quadraticSimple(
        { x: 0, y: this.sustainLevel },
        { x: max, y: this.releaseLevel },
        -this.releaseBend
      )
    );
  }

  protected onTrigger() {
    this.initialLevelOverride = undefined;
    if (!this.retrigger) {
      const [ _stage, scaled, _raw ] = this.compute(true, false);
      //console.log(`Adsr stage: ${ _stage } scaled: ${ scaled } raw: ${ _raw }`);

      if (!Number.isNaN(scaled) && scaled > 0) {
        this.initialLevelOverride = scaled;
      }
    }
  }

  [ Symbol.iterator ](): Iterator<number> {
    return new AdsrIterator(this);
  }

  /**
   * Returns the scaled value
   * Same as .compute()[1]
   */
  get value(): number {
    return this.compute(true)[ 1 ];
  }

  /**
   * Compute value of envelope at this point in time.
   *
   * Returns an array of [stage, scaled, raw]. Most likely you want to use {@link value} to just get the scaled value.
   * @param allowStateChange If true (default) envelope will be allowed to change state if necessary before returning value
   */
  compute(
    allowStateChange = true,
    allowLooping = true
  ): [ stage: string | undefined, scaled: number, raw: number ] {
    const [ stage, amt ] = super.computeRaw(allowStateChange, allowLooping);
    //console.log(`Adsr.compute: stage: ${ stage } amt: ${ amt }!`);
    // Stage is undefined when envelope is complete or underlying timer is undefined
    if (stage === undefined) return [ undefined, Number.NaN, Number.NaN ];
    let v: number;
    switch (stage) {
      case `attack`: {
        v = this.attackPath.interpolate(amt).y;
        if (this.initialLevelOverride !== undefined) {
          v = scale(v, 0, 1, this.initialLevelOverride, 1);
        }
        this.releasedAt = v;
        break;
      }
      case `decay`: {
        v = this.decayPath.interpolate(amt).y;
        this.releasedAt = v;
        break;
      }
      case `sustain`: {
        v = this.sustainLevel;
        this.releasedAt = v;
        break;
      }
      case `release`: {
        v = this.releasePath.interpolate(amt).y;
        // Bound release level to the amp level that we released at.
        // ie. when release happens before a stage completes
        if (this.releasedAt !== undefined) {
          v = scale(v, 0, this.sustainLevel, 0, this.releasedAt);
        }
        break;
      }
      case `complete`: {
        v = this.releaseLevel;
        this.releasedAt = undefined;
        break;
      }
      default: {
        throw new Error(`Unknown state: ${ stage }`);
      }
    }
    return [ stage, v, amt ];
  }
}