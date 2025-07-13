import type { LinksWithSource, Gen, GenOrData, GenFactoryNoInput, Link } from "./types.js";
import { resolveToGen } from "./utility.js";

/**
 * Chain functions together. First argument is the source.
 * `runN` takes any number of chain functions. Use {@link run} if
 * possible, because it has improved type hinting.
 * 
 * @example Process an array of strings. Transforming into
 * integers, and then filtering only even numbers.
 * ```js
 * const ch = Chains.runN(
 *  [ `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10` ],
 *  Chains.transform<string, number>(v => Number.parseInt(v)),
 *  Chains.filter(v => v % 2 === 0)
 *);
 * const output = await Async.toArray(ch2);
 * // [ 2, 4, 6, 8, 10 ]
 * ```
 * 
 * @example Grab the x/y coordinate from pointermove
 * ```js
 * const c1 = Chains.run(
 *  Chains.fromEvent(window, `pointermove`),
 *  Chains.Links.transform(event => ({ x: event.x, y: event.y }))
 * );
 * 
 * // Eg: print out data as it comes in
 * Iterables.forEach(c1, coord => {
 *   console.log(coord);
 * });
 * // Execution continues immediately
 * ```
 * @param functions 
 * @returns 
 */
export async function* runN<In, Out>(...functions: LinksWithSource<In, Out>): AsyncGenerator<Out> {
  let input: Gen<In> | undefined;
  for (const fnOrData of functions) {
    input = typeof fnOrData === `function` ? fnOrData(input ?? []) : resolveToGen(fnOrData);
  }
  if (input === undefined) return;
  for await (const v of input) {
    yield v as Out;
  }
}

export function run<T1>(gen: GenOrData<T1> | GenFactoryNoInput<T1>): AsyncGenerator<T1>;
export function run<T1, T2>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>): AsyncGenerator<T2>;
export function run<T1, T2, T3>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>): AsyncGenerator<T3>;
export function run<T1, T2, T3, T4>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>): AsyncGenerator<T4>;
export function run<T1, T2, T3, T4, T5>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>, l3: Link<T4, T5>): AsyncGenerator<T5>;
export function run<T1, T2, T3, T4, T5, T6>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>, l3: Link<T4, T5>, l4: Link<T5, T6>): AsyncGenerator<T6>;
export function run<T1, T2, T3, T4, T5, T6, T7>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>, l3: Link<T4, T5>, l4: Link<T5, T6>, l5: Link<T6, T7>): AsyncGenerator<T7>;

/**
 * Chain functions together. First argument is the source.
 * Use {@link runN} if you want to chain more links than is possible here,
 * at the cost of poorer type hinting.
 * 
 * @example Process an array of strings. Transforming into
 * integers, and then filtering only even numbers.
 * ```js
 * const ch = Chains.run(
 *  [ `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10` ],
 *  Chains.transform(v => Number.parseInt(v)),
 *  Chains.filter(v => v % 2 === 0)
 *);
 * const output = await Async.toArray(ch2);
 * // [ 2, 4, 6, 8, 10 ]
 * ```
 * 
 * @example Grab the x/y coordinate from pointermove
 * ```js
 * const c1 = Chains.run(
 *  Chains.fromEvent(window, `pointermove`),
 *  Chains.Links.transform(event => ({ x: event.x, y: event.y }))
 * );
 * 
 * // Eg: print out data as it comes in
 * Iterables.forEach(c1, coord => {
 *   console.log(coord);
 * });
 * // Execution continues immediately
 * ```
 * @param gen 
 * @param l0 
 * @param l1 
 * @param l2 
 * @param l3 
 * @returns 
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function* run<T1, T2, T3, T4, T5, T6, T7>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0?: Link<T1, T2>, l1?: Link<T2, T3>, l2?: Link<T3, T4>, l3?: Link<T4, T5>, l4?: Link<T5, T6>, l5?: Link<T6, T7>): AsyncGenerator<T1> {
  let input: Gen<any> | undefined;
  // eslint-disable-next-line prefer-rest-params
  const functions = arguments;
  for (const fnOrData of functions) {

    if (typeof fnOrData === `function`) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      input = fnOrData(input ?? []);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      input = resolveToGen(fnOrData);
    }
  }
  if (input === undefined) return;
  for await (const v of input) {
    yield v;
  }
}
