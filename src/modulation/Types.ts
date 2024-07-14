export type ModSettableOptions = {
  /**
   * Starting absolute value of source.
   */
  startAt: number
  /**
   * Starting relative value of source (eg 0.5 for 50%)
   */
  startAtRelative: number
  /**
   * If set, determines how many cycles. By default unlimited.
   * Use 1 for example for a one-shot wave.
   */
  cycleLimit: number
}
export type ModSettableFeedback = {
  /**
   * If set, resets absolute position of clock
   */
  resetAt: number
  /**
   * If set, resets relative position of clock
   */
  resetAtRelative: number
}

export type ModSettable = (feedback?: Partial<ModSettableFeedback>) => number

/**
 * A mod source returns numbers on a 0..1 scale.
 * Usually invoked just a function, some sources also support
 * 'feedback' allowing source to be adjusted dynamically.
 * 
 * See Modulation.Sources for more.
 */
export type ModSource = (feedback?: any) => number