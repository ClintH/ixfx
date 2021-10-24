import {adsr} from "./AdsrEnvelope";

export {adsr};

export type StageOpts = {
  timerSource?: TimerSource
  looping?: boolean
  attackDuration?: number,
  decayDuration?: number,
  releaseDuration?: number
}

export enum EnvelopeStage {
  Stopped = 0,
  Attack = 1,
  Decay = 2,
  Sustain = 3,
  Release = 4
}

export type Envelope = {
  trigger(): void
  reset(): void
  hold(): void
  release(): void
  compute(): [EnvelopeStage, number]
}

type Timer = {
  reset(): void
  elapsed(): number
}

type TimerSource = () => Timer;

export const msRelativeTimer = function (): Timer {
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

export const tickRelativeTimer = function (): Timer {
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

export const stageToText = function (stage: EnvelopeStage): string {
  switch (stage) {
    case EnvelopeStage.Attack:
      return 'Attack';
    case EnvelopeStage.Decay:
      return 'Decay';
    case EnvelopeStage.Release:
      return 'Release';
    case EnvelopeStage.Stopped:
      return 'Stopped';
    case EnvelopeStage.Sustain:
      return 'Sustain'
  }
}

export const stages = function (opts: StageOpts = {}): Readonly<Envelope> {
  const {looping = false} = opts;
  const {timerSource = msRelativeTimer} = opts;
  const {attackDuration = 300} = opts;
  const {decayDuration = 500} = opts;
  const {releaseDuration = 1000} = opts;

  let stage = EnvelopeStage.Stopped;
  let timer: Timer | null = null;
  let isHeld = false;

  const setStage = (newStage: EnvelopeStage) => {
    if (stage == newStage) return;
    //console.log('Envelope stage ' + stageToText(stage) + ' -> ' + stageToText(newStage));
    stage = newStage;
    if (stage == EnvelopeStage.Attack)
      timer = timerSource();
    else if (stage == EnvelopeStage.Release)
      timer = timerSource();
  }

  const compute = (): [EnvelopeStage, number] => {
    if (stage == EnvelopeStage.Stopped) return [0, 0];
    if (timer == null) throw Error('Bug: timer is null');

    if (stage == EnvelopeStage.Sustain) return [stage, 1];

    let elapsed = timer.elapsed();

    if (stage == EnvelopeStage.Release) {
      let relative = elapsed / releaseDuration;
      if (relative > 1) {
        if (looping) {
          // Trigger, even if originally held
          trigger();
        } else {
          setStage(EnvelopeStage.Stopped);
        }
        return [stage, 0];
      }
      return [stage, relative];
    }


    if (elapsed <= attackDuration) {
      // Within attack
      return [stage, elapsed / attackDuration];
    } else if (elapsed <= decayDuration + attackDuration) {
      // Within decay
      if (stage == EnvelopeStage.Attack) setStage(EnvelopeStage.Decay);
      return [stage, (elapsed - attackDuration) / decayDuration];
    } else {
      // Within sustain
      if (stage == EnvelopeStage.Decay) setStage(EnvelopeStage.Sustain);
      if (!isHeld) {
        setStage(EnvelopeStage.Release);
      }
      return [stage, 0];
    }
  }

  const trigger = () => {
    isHeld = false;
    setStage(EnvelopeStage.Attack);
  }

  const hold = () => {
    isHeld = true;
    if (stage == EnvelopeStage.Stopped) {
      setStage(EnvelopeStage.Attack);
    } else {
      setStage(EnvelopeStage.Sustain);
    }
  }

  const release = () => {
    if (!isHeld) throw Error('Not being held');

    setStage(EnvelopeStage.Release);
  }

  const reset = () => {
    setStage(EnvelopeStage.Stopped);
  }

  reset();

  return Object.freeze({
    trigger: trigger,
    reset: reset,
    release: release,
    hold: hold,
    compute: compute
  });
}