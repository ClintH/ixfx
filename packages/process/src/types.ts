export type Process<TIn, TOut> = (value: TIn) => TOut;
export type ProcessFactory<TIn, TOut> = () => Process<TIn, TOut>;

export type Processors1<T1, T2> = [
  Process<T1, T2>
]

export type Processors2<T1, T2, T3> = [
  Process<T1, T2>,
  Process<T2, T3>
]

export type Processors3<T1, T2, T3, T4> = [
  Process<T1, T2>,
  Process<T2, T3>,
  Process<T3, T4>
]

export type Processors4<T1, T2, T3, T4, T5> = [
  Process<T1, T2>,
  Process<T2, T3>,
  Process<T3, T4>,
  Process<T4, T5>
]

export type Processors5<T1, T2, T3, T4, T5, T6> = [
  Process<T1, T2>,
  Process<T2, T3>,
  Process<T3, T4>,
  Process<T4, T5>,
  Process<T5, T6>
]
export type Processors<T1, T2, T3, T4, T5, T6> = Processors1<T1, T2> | Processors2<T1, T2, T3> | Processors3<T1, T2, T3, T4> | Processors4<T1, T2, T3, T4, T5> | Processors5<T1, T2, T3, T4, T5, T6>;


/**
 * A rank function that compares A and B.
 * Returns the highest value, 'a' or 'b'. 
 * Returns 'eq' if values are equal
 */
export type RankFunction<T> = (a: T, b: T) => `a` | `b` | `eq`

export type RankOptions = {
  /**
   * If set, only values with this JS type are included
   */
  includeType?: `string` | `number` | `object` | `boolean`
  /**
   * If _true_, also emits values when they rank equal with current highest.
   * _false_ by default
   */
  emitEqualRanked?: boolean
  /**
   * If _true_, emits the current highest value even if it hasn't changed.
   * This means it will match the tempo of the incoming stream.
   */
  emitRepeatHighest?: boolean
}