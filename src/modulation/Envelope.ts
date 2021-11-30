import {dadsr} from "./DadsrEnvelope";

export {dadsr};

export type StageOpts = {
  /**
   * Timing source for envelope
   *
   * @type {TimerSource}
   */
  timerSource?: TimerSource
  /**
   * If true, envelope indefinately returns to attack stage after release
   *
   * @type {boolean}
   */
  looping?: boolean

  /**
    * Duration for delay stage
    * Unit depends on timer source
    * @type {number}
    */
  delayDuration?: number,
  /**
   * Duration for attack stage
   * Unit depends on timer source
   * @type {number}
   */
  attackDuration?: number,
  /**
   * Duration for decay stage
   * Unit depends on timer source
   * @type {number}
   */
  decayDuration?: number,
  /**
   * Duration for release stage
   * Unit depends on timer source
   * @type {number}
   */
  releaseDuration?: number
}
/**
 * Stage of envelope
 *
 * @export
 * @enum {number}
 */
export enum Stage {
  Stopped = 0,
  Delay = 1,
  Attack = 2,
  Decay = 3,
  Sustain = 4,
  Release = 5
}

export type Envelope = {
  getStage: (stage: Stage) => {duration: number}

  /**
   * Trigger the envelope, with no hold
   *
   */
  trigger(): void

  /**
   * Resets the envelope, ready for hold() or trigger()
   *
   */
  reset(): void
  /**
   * Triggers the envelope and holds the sustain stage
   *
   */
  hold(): void

  /**
   * Releases the envelope if held
   *
   */
  release(): void

  /**
   * Computes the value of the envelope (0-1) and also returns the current stage
   *
   * @returns {[Stage, number]}
   */
  compute(): [Stage, number]
}

type Timer = {
  reset(): void
  elapsed(): number
}

type TimerSource = () => Timer;
/**
 * A timer that uses clock time
 *
 * @returns {Timer}
 */
const msRelativeTimer = function (): Timer {
  let start = performance.now();
  return {
    reset: () => {
      start = performance.now();
    },
    elapsed: () => {
      return (performance.now() - start);
    }
  }
}

/**
 * A timer that progresses with each call
 *
 * @returns {Timer}
 */
const tickRelativeTimer = function (): Timer {
  let start = 0;
  return {
    reset: () => {
      start = 0;
    },
    elapsed: () => {
      return start++;
    }
  }
}
/**
 * Returns a name for a given numerical envelope stage
 *
 * @param {Stage} stage
 * @returns {string} Name of stage
 */
const stageToText = function (stage: Stage): string {
  switch (stage) {
    case Stage.Delay:
      return 'Delay';
    case Stage.Attack:
      return 'Attack';
    case Stage.Decay:
      return 'Decay';
    case Stage.Release:
      return 'Release';
    case Stage.Stopped:
      return 'Stopped';
    case Stage.Sustain:
      return 'Sustain'
  }
}

/**
 * Creates an envelope
 *
 * @param {StageOpts} [opts={}] Options
 * @returns {Readonly<Envelope>} Envelope
 */
export const stages = function (opts: StageOpts = {}): Readonly<Envelope> {
  const {looping = false} = opts;
  const {timerSource = msRelativeTimer} = opts;
  const {delayDuration = 0} = opts;
  const {attackDuration = 300} = opts;
  const {decayDuration = 500} = opts;
  const {releaseDuration = 1000} = opts;

  let stage = Stage.Stopped;
  let timer: Timer | null = null;
  let isHeld = false;

  const setStage = (newStage: Stage) => {
    if (stage == newStage) return;
    console.log('Envelope stage ' + stageToText(stage) + ' -> ' + stageToText(newStage));
    stage = newStage;
    if (stage == Stage.Delay)
      timer = timerSource();
    else if (stage == Stage.Release)
      timer = timerSource();
  }

  const getStage = (stage: Stage): {duration: number} => {
    switch (stage) {
      case Stage.Attack:
        return {duration: attackDuration}
      case Stage.Decay:
        return {duration: decayDuration}
      case Stage.Delay:
        return {duration: delayDuration}
      case Stage.Release:
        return {duration: releaseDuration}
      default:
        throw Error(`Cannot get unknown stage ${stage}`);
    }
  }

  const compute = (): [Stage, number] => {
    if (stage == Stage.Stopped) return [0, 0];
    if (timer == null) throw Error('Bug: timer is null');

    if (stage == Stage.Sustain) return [stage, 1];

    let elapsed = timer.elapsed();

    if (stage == Stage.Release) {
      let relative = elapsed / releaseDuration;
      if (relative > 1) {
        if (looping) {
          // Trigger, even if originally held
          trigger();
        } else {
          setStage(Stage.Stopped);
        }
        return [stage, 0];
      }
      return [stage, relative];
    }

    if (delayDuration > 0 && elapsed <= delayDuration) {
      // With delay
      return [stage, elapsed / delayDuration];
    } else if (elapsed <= attackDuration) {
      // Within attack
      return [stage, elapsed / attackDuration];
    } else if (elapsed <= decayDuration + attackDuration) {
      // Within decay
      if (stage == Stage.Attack) setStage(Stage.Decay);
      return [stage, (elapsed - attackDuration) / decayDuration];
    } else {
      // Within sustain
      if (stage == Stage.Decay) setStage(Stage.Sustain);
      if (!isHeld) {
        setStage(Stage.Release);
      }
      return [stage, 0];
    }
  }

  const trigger = () => {
    isHeld = false;
    setStage(Stage.Delay);
  }

  const hold = () => {
    isHeld = true;
    if (stage == Stage.Stopped) {
      setStage(Stage.Delay);
    } else {
      setStage(Stage.Sustain);
    }
  }

  const release = () => {
    if (!isHeld) throw Error('Not being held');
    setStage(Stage.Release);
  }

  const reset = () => {
    setStage(Stage.Stopped);
  }

  reset();

  return Object.freeze({
    trigger: trigger,
    reset: reset,
    release: release,
    hold: hold,
    compute: compute,
    getStage: getStage
  });
}