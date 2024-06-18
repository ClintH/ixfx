export type NumberGuardRange =
  /**
   * No range checking
   */
  | ``
  /**
   * Can be any number, except zero
   */
  | `nonZero`
  | `positive`
  | `negative`
  /**
   * Must be above zero
   */
  | `aboveZero`
  | `belowZero`
  | `percentage`
  | `bipolar`;

export type GuardResultOk = Readonly<readonly [ true: boolean ]>;
export type GuardResultFail = Readonly<readonly [ false: boolean, reason: string ]>;
export type GuardResult = GuardResultFail | GuardResultOk;
