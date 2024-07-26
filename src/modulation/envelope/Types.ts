export type EnvelopeOpts = AdsrOpts & AdsrTimingOpts;
/**
 * Options for the ADSR envelope.
 */
export type AdsrOpts = Partial<{
  /**
   * Attack bezier 'bend'. Bend from -1 to 1. 0 for a straight line
   */
  readonly attackBend: number;
  /**
   * Decay bezier 'bend'. Bend from -1 to 1. 0 for a straight line
   */
  readonly decayBend: number;
  /**
   * Release bezier 'bend'. Bend from -1 to 1. 0 for a straight line
   */
  readonly releaseBend: number;

  /**
   * Peak level (maximum of attack stage)
   */
  readonly peakLevel: number;

  /**
   * Starting level (usually 0)
   */
  readonly initialLevel: number;
  /**
   * Sustain level. Only valid if trigger and hold happens
   */
  readonly sustainLevel: number;
  /**
   * Release level, when envelope is done (usually 0)
   */
  readonly releaseLevel: number;

  /**
   * When _false_, envelope starts from it's current level when being triggered.
   * _True_ by default.
   */
  readonly retrigger: boolean;
}>;

export type AdsrTimingOpts = Partial<{
  /**
   * If true, envelope indefinately returns to attack stage after release
   *
   * @type {boolean}
   */
  readonly shouldLoop: boolean;

  /**
   * Duration for attack stage
   * Unit depends on timer source
   * @type {number}
   */
  readonly attackDuration: number;
  /**
   * Duration for decay stage
   * Unit depends on timer source
   * @type {number}
   */
  readonly decayDuration: number;
  /**
   * Duration for release stage
   * Unit depends on timer source
   * @type {number}
   */
  readonly releaseDuration: number;
}>;

export type AdsrIterableOpts = {
  readonly signal?: AbortSignal;
  readonly sampleRateMs?: number;
  readonly env: EnvelopeOpts;
};

/**
 * State change event
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface StateChangeEvent {
  readonly newState: string;
  readonly priorState: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface CompleteEvent {
  /* no-op */
}

export type AdsrEvents = {
  readonly change: StateChangeEvent;
  readonly complete: CompleteEvent;
};

export const adsrStateTransitions = Object.freeze({
  attack: [ `decay`, `release` ],
  decay: [ `sustain`, `release` ],
  sustain: [ `release` ],
  release: [ `complete` ],
  complete: null,
});
export type AdsrStateTransitions = Readonly<typeof adsrStateTransitions>;

