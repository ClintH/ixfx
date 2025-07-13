import { resolveSource } from "./ResolveSource.js"
import type { Reactive, ReactiveOp, ReactiveOrSource } from "./Types.js"
import { isWritable } from "./Util.js"

export type OpChain1<T1, T2> = [
  ReactiveOp<T1, T2>
]

export type OpChain2<T1, T2, T3> = [
  ReactiveOp<T1, T2>,
  ReactiveOp<T2, T3>
]

export type OpChain3<T1, T2, T3, T4> = [
  ReactiveOp<T1, T2>,
  ReactiveOp<T2, T3>,
  ReactiveOp<T3, T4>
]

export type OpChain4<T1, T2, T3, T4, T5> = [
  ReactiveOp<T1, T2>,
  ReactiveOp<T2, T3>,
  ReactiveOp<T3, T4>,
  ReactiveOp<T4, T5>
]

export type OpChain5<T1, T2, T3, T4, T5, T6> = [
  ReactiveOp<T1, T2>,
  ReactiveOp<T2, T3>,
  ReactiveOp<T3, T4>,
  ReactiveOp<T4, T5>,
  ReactiveOp<T5, T6>
]
export type OpChain<T1, T2, T3, T4, T5, T6> = OpChain1<T1, T2> | OpChain2<T1, T2, T3> | OpChain3<T1, T2, T3, T4> | OpChain4<T1, T2, T3, T4, T5> | OpChain5<T1, T2, T3, T4, T5, T6>;

export function chainer<T1, T2>(...ops: [ ReactiveOp<T1, T2> ]): (source: ReactiveOrSource<T1>) => Reactive<T2>;
export function chainer<T1, T2, T3>(...ops: OpChain2<T1, T2, T3>): (source: ReactiveOrSource<T1>) => Reactive<T3>;
export function chainer<T1, T2, T3, T4>(...ops: OpChain3<T1, T2, T3, T4>): (source: ReactiveOrSource<T1>) => Reactive<T4>;
export function chainer<T1, T2, T3, T4, T5>(...ops: OpChain4<T1, T2, T3, T4, T5>): (source: ReactiveOrSource<T1>) => Reactive<T5>;
export function chainer<T1, T2, T3, T4, T5, T6>(...ops: OpChain5<T1, T2, T3, T4, T5, T6>): (source: ReactiveOrSource<T1>) => Reactive<T6>;

/**
 * Creates a chainer of data ops (up to 5 are supported).
 * The chainer is encapsulated in a function that accepts an input value an returns an output.
 * 
 * ```js
 * const p = chainer(
 *  (value:string) => value.tUpperCase(), // Convert to uppercase
 *  (value:string) => value.at(0) === 'A) // If first letter is an A, return true
 * );
 * p('apple'); // True
 * ```
 * 
 * Each processing function is expected to take in one input value and return one value.
 * @param ops 
 * @returns 
 */
export function chainer<T1, T2, T3, T4, T5, T6>(...ops: Array<ReactiveOp<any, any>>): (source: ReactiveOrSource<T1>) => Reactive<T2 | T3 | T4 | T5 | T6> {
  // return (value: T1) => {
  //   let v = value;
  //   for (const op of ops) {
  //     // @ts-expect-error
  //     v = p(v);
  //   }
  //   return v as T2 | T3 | T4 | T5 | T6;
  // }
  return (source: ReactiveOrSource<T1>) => {
    for (const op of ops) {
      source = op(source);
    }
    return source as Reactive<T2 | T3 | T4 | T5 | T6>;
  }
}

export function run<T1, T2>(source: ReactiveOrSource<T1>, ...ops: OpChain1<T1, T2>): Reactive<T2>;
export function run<T1, T2, T3>(source: ReactiveOrSource<T1>, ...ops: OpChain2<T1, T2, T3>): Reactive<T3>;
export function run<T1, T2, T3, T4>(source: ReactiveOrSource<T1>, ...ops: OpChain3<T1, T2, T3, T4>): Reactive<T4>;
export function run<T1, T2, T3, T4, T5>(source: ReactiveOrSource<T1>, ...ops: OpChain4<T1, T2, T3, T4, T5>): Reactive<T5>;
export function run<T1, T2, T3, T4, T5, T6>(source: ReactiveOrSource<T1>, ...ops: OpChain5<T1, T2, T3, T4, T5, T6>): Reactive<T6>;


/**
 * Connects `source` to serially-connected set of ops. Values thus
 * flow from `source` to each op in turn.
 * 
 * Returned result is the final reactive.
 * 
 * @param source 
 * @param ops 
 * @returns 
 */
export function run<T1, T2, T3, T4, T5, T6>(source: ReactiveOrSource<T1>, ...ops: OpChain1<T1, T2> | OpChain2<T1, T2, T3> | OpChain3<T1, T2, T3, T4> | OpChain4<T1, T2, T3, T4, T5> | OpChain5<T1, T2, T3, T4, T5, T6>): Reactive<T2 | T3 | T4 | T5 | T6> {
  let s = resolveSource(source);
  for (const op of ops) {
    // @ts-ignore
    s = op(s);
  }
  return s as Reactive<T2 | T3 | T4 | T5 | T6>;
  //const raw = chainer<T1, T2, T3, T4, T5, T6>(...ops);
  //return raw(source);
}

export function runHead<T1, T2>(source: ReactiveOrSource<T1>, ...ops: OpChain1<T1, T2>): Reactive<T2>;
export function runHead<T1, T2, T3>(source: ReactiveOrSource<T1>, ...ops: OpChain2<T1, T2, T3>): Reactive<T3>;
export function runHead<T1, T2, T3, T4>(source: ReactiveOrSource<T1>, ...ops: OpChain3<T1, T2, T3, T4>): Reactive<T4>;
export function runHead<T1, T2, T3, T4, T5>(source: ReactiveOrSource<T1>, ...ops: OpChain4<T1, T2, T3, T4, T5>): Reactive<T5>;
export function runHead<T1, T2, T3, T4, T5, T6>(source: ReactiveOrSource<T1>, ...ops: OpChain5<T1, T2, T3, T4, T5, T6>): Reactive<T6>;


/**
 * Connects `source` to serially-connected set of ops. Values thus
 * flow from `source` to each op in turn.
 * 
 * Returned result is the final reactive.
 * 
 * @param source 
 * @param ops 
 * @returns 
 */
export function runHead<T1, T2, T3, T4, T5, T6>(source: ReactiveOrSource<T1>, ...ops: OpChain1<T1, T2> | OpChain2<T1, T2, T3> | OpChain3<T1, T2, T3, T4> | OpChain4<T1, T2, T3, T4, T5> | OpChain5<T1, T2, T3, T4, T5, T6>): Reactive<T2 | T3 | T4 | T5 | T6> {
  let originalSource = resolveSource(source);
  let s = originalSource;
  for (const op of ops) {
    // @ts-ignore
    s = op(s);
  }
  const rr = s as Reactive<T2 | T3 | T4 | T5 | T6>;
  if (isWritable(originalSource)) {
    return {
      ...rr,
      set(value: T1) {
        originalSource.set(value);
      }
    } as any as Reactive<T2 | T3 | T4 | T5 | T6>
  } else {
    return rr;
  }
  //const raw = chainer<T1, T2, T3, T4, T5, T6>(...ops);
  //return raw(source);
}