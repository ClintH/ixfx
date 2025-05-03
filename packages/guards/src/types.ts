export type NumberGuardRange =
  /**
   * No range checking
   */
  | ``
  | `finite`
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

// export type GuardResultOk = Readonly<readonly [ true: boolean ]>;
// export type GuardResultFail = Readonly<readonly [ false: boolean, reason: string ]>;
// export type GuardResult = GuardResultFail | GuardResultOk;

export type ResultOk<TValue> = {
  success: true
  value: TValue
}

export type ResultError<TError> = {
  success: false
  error: TError
}
export type ResultOrFunction = Result<any, any> | (() => undefined | Result<any, any>)

export type Result<TValue, TError> = ResultOk<TValue> | ResultError<TError>;
