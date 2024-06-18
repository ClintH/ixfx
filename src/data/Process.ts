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

export function processChain<T1, T2>(...processors: [ Process<T1, T2> ]): (value: T1) => T2;
export function processChain<T1, T2, T3>(...processors: [ Process<T1, T2>, Process<T2, T3> ]): (value: T1) => T3;
export function processChain<T1, T2, T3, T4>(...processors: [ Process<T1, T2>, Process<T2, T3>, Process<T3, T4> ]): (value: T1) => T4;
export function processChain<T1, T2, T3, T4, T5>(...processors: [ Process<T1, T2>, Process<T2, T3>, Process<T3, T4>, Process<T4, T5> ]): (value: T1) => T5;
export function processChain<T1, T2, T3, T4, T5, T6>(...processors: [ Process<T1, T2>, Process<T2, T3>, Process<T3, T4>, Process<T4, T5>, Process<T5, T6> ]): (value: T1) => T6;

/**
 * Creates a chain of data processors (up to 5 are supported).
 * The chain is encapsulated in a function that accepts an input value an returns an output.
 * 
 * ```js
 * const p = processChain(
 *  (value:string) => value.tUpperCase(), // Convert to uppercase
 *  (value:string) => value.at(0) === 'A) // If first letter is an A, return true
 * );
 * p('apple'); // True
 * ```
 * 
 * Each processing function is expected to take in one input value and return one value.
 * @param processors 
 * @returns 
 */
export function processChain<T1, T2, T3, T4, T5, T6>(...processors: Processors<T1, T2, T3, T4, T5, T6>): (value: T1) => T2 | T3 | T4 | T5 | T6 {
  return (value: T1) => {
    let v = value;
    for (const p of processors) {
      // @ts-expect-error
      v = p(v);
    }
    return v as T2 | T3 | T4 | T5 | T6;
  }
}

// const test = processors(
//   (value: string) => { return 1 },
//   (value: number) => value > 1
// )
// const testResult = test(`hello`);


