import { throwNumberTest } from "../util/GuardNumbers.js";
/**
 * Logic for continuing repeats
 */
export type RepeatPredicate = (
  repeats: number,
  valuesProduced: number
) => boolean;


/**
 * Calls and waits for the async function `fn` repeatedly, yielding each result asynchronously.
 * Use {@link repeat} if `fn` does not need to be awaited.
 * 
 * ```js
 * // Eg. iterate
 * const r = Flow.repeat(5, async () => Math.random());
 * for await (const v of r) {
 * 
 * }
 * // Eg read into array
 * const results = await Array.fromAsync(Flow.repeatAwait(5, async () => Math.random()));
 * ```
 * 
 * The number of repeats is determined by the first parameter. If it's a:
 * - number: how many times to repeat
 * - function: it gets called before each repeat, if it returns _false_ repeating stops.
 * 
 * Using a fixed number of repeats:
 * ```js
 * // Calls - and waits - for Flow.sleep(1) 5 times
 * await Flow.repeatAwait(5, async () => {
 *    // some kind of async function where we can use await
 *    // eg. sleep for 1s
 *    await Flow.sleep(1); 
 * });
 * ``` 
 * 
 * Using a function to dynamically determine number of repeats. The function gets
 * passed the number of repeats so far as well as the number of values produced. This
 * is count of non-undefined results from `cb` that is being repeated.
 * 
 * ```js
 * async function task() {
 *  // do something
 * }
 * 
 * await Flow.repeatAwait(
 *  (repeats, valuesProduced) => {
 *    // Logic for deciding whether to repeat or not
 *    if (repeats > 5) return false; // Stop repeating
 *  },
 *  task
 * );
 * ```
 * 
 * In the above cases we're not using the return value from `fn`. This would look like:
 * ```js
 * const g = Flow.repeatAwait(5, async () => Math.random);
 * for await (const v of g) {
 *  // Loops 5 times, v is the return value of calling `fn` (Math.random)
 * }
 * ```
 * @param countOrPredicate Number of times to repeat, or a function that returns _false_ to stop the loop.
 * @param fn Function to execute. Asynchronous functions will be awited
 * @typeParam V - Return type of repeating function
 * @returns Asynchronous generator of `fn` results.
 */
export function repeatAwait<V>(countOrPredicate: number | RepeatPredicate, fn: (repeats: number, valuesProduced: number) => Promise<V | undefined> | V): AsyncIterable<V> {
  return typeof countOrPredicate === `number` ? repeatTimesAwaited(countOrPredicate, fn) : repeatWhileAwaited(countOrPredicate, fn);
}

/**
 * Calls `fn` repeatedly, yielding each result.
 * Use {@link repeatAwait} if `fn` is asynchronous and you want to wait for it. 
 * 
 * The number of repeats is determined by the first parameter. If it's a:
 * - number: how many times to repeat
 * - function: it gets called before each repeat, if it returns _false_ repeating stops.
 * 
 * Example: using a fixed number of repeats
 * ```js
 * // Results will be an array with five random numbers
 * const results = [...repeat(5, () => Math.random())];
 *
 * // Or as an generator (note also the simpler expression form)
 * for (const result of repeat(5, Math.random)) {
 * }
 * ```
 * 
 * Example: Using a function to dynamically determine number of repeats
 * ```js
 * function task() {
 * }
 * 
 * Flow.repeat(
 *  (repeats, valuesProduced) => {
 *    if (repeats > 5) return false; // Stop repeating
 *  },
 *  task
 * );
 * ```
 * 
 * In the above cases we're not using the return value from `fn`. To do so,
 * this would look like:
 * ```js
 * const g = Flow.repeat(5, () => Math.random);
 * for (const v of g) {
 *  // Loops 5 times, v is the return value of calling `fn` (Math.random)
 * }
 * ```
 * 
 * Alternatives:
 * * {@link Flow.forEach | Flow.forEach} - if you don't need return values
 * * {@link Flow.interval} - if you want to repeatedly call something with an interval between
 * @param countOrPredicate Numnber of repeats, or a function that returns _false_ for when to stop.
 * @param fn Function to execute. Asynchronous functions will be awited
 * @typeParam V - Return type of repeating function
 * @returns Asynchronous generator of `fn` results.
 */
export function repeat<V>(countOrPredicate: number | RepeatPredicate, fn: (repeats: number, valuesProduced: number) => V | undefined): Generator<V> {
  return typeof countOrPredicate === `number` ? repeatTimes(countOrPredicate, fn) : repeatWhile(countOrPredicate, fn);
}


/**
 * Calls `fn` until `predicate` returns _false_. Awaits result of `fn` each time.
 * Yields result of `fn` asynchronously
 * @param predicate 
 * @param fn 
 * @typeParam V - Return type of repeating function
 */
async function* repeatWhileAwaited<V>(predicate: RepeatPredicate, fn: (repeats: number, valuesProduced: number) => Promise<V | undefined> | V): AsyncGenerator<V> {
  let repeats = 0;
  let valuesProduced = 0;
  while (predicate(repeats, valuesProduced)) {
    repeats++;
    const v = await fn(repeats, valuesProduced);
    if (v === undefined) continue;
    yield v;
    valuesProduced++;
  }
}

/**
 * Calls `fn` until `predicate` returns _false_. Yields result of `fn`.
 * @param predicate Determiner for whether repeating continues
 * @param fn Function to call
 * @typeParam V - Return type of repeating function
 */
function* repeatWhile<V>(predicate: RepeatPredicate, fn: (repeats: number, valuesProduced: number) => V | undefined): Generator<V> {
  let repeats = 0;
  let valuesProduced = 0;
  while (predicate(repeats, valuesProduced)) {
    repeats++;
    const v = fn(repeats, valuesProduced);
    if (v === undefined) continue;
    yield v;
    valuesProduced++;
  }
}

/**
 * Calls `fn`, `count` number of times, waiting for the result of `fn`.
 * Yields result of `fn` asynchronously
 * @param count Number of times to run
 * @param fn Function to run
 * @typeParam V - Return type of repeating function
 */
async function* repeatTimesAwaited<V>(count: number, fn: (repeats: number, valuesProduced: number) => Promise<V | undefined> | V | undefined) {
  throwNumberTest(count, `positive`, `count`);
  let valuesProduced = 0;
  let repeats = 0;
  while (count-- > 0) {
    repeats++;
    const v = await fn(repeats, valuesProduced);
    if (v === undefined) continue;
    yield v;
    valuesProduced++;
  }
}

/**
 * Calls `fn`, `count` times. Assumes a synchronous function. Yields result of `fn`.
 * 
 * Note that if `fn` returns _undefined_ repeats will stop.
 * @typeParam V - Return type of repeating function
 * @param count Number of times to run
 * @param fn Function to run
 */
function* repeatTimes<V>(count: number, fn: (repeats: number, valuesProduced: number) => V | undefined): Generator<V> {
  throwNumberTest(count, `positive`, `count`);
  let valuesProduced = 0;
  let repeats = 0;
  while (count-- > 0) {
    //console.log(`Flow.repeatTimes count: ${ count } repeats: ${ repeats } values: ${ valuesProduced }`);
    repeats++;
    const v = fn(repeats, valuesProduced);
    if (v === undefined) continue;
    yield v;
    valuesProduced++;
  }
}


/**
 * Repeatedly calls `fn`, reducing via `reduce`.
 *
 * ```js
 * repeatReduce(10, () => 1, (acc, v) => acc + v);
 * // Yields: 10
 *
 * // Multiplies random values against each other 10 times
 * repeatReduce(10, Math.random, (acc, v) => acc * v);
 * // Yields a single number
 * ```
 * @param countOrPredicate Number of times to run, or function to keep running
 * @param fn Function to call
 * @param initial Initial value
 * @param reduce Function to reduce value
 * @typeParam V - Return type of repeating function
 * @returns Final result
 */
// export const repeatReduce = <V>(
//   countOrPredicate: number | RepeatPredicate,
//   fn: () => V | undefined,
//   reduce: (accumulator: V, value: V) => V,
//   initial: V
// ): V => {

//   return IterableReduce(repeat(countOrPredicate, fn), reduce, initial);

//   // if (typeof countOrPredicate === `number`) {
//   //   throwNumberTest(countOrPredicate, `positive`, `countOrPredicate`);
//   //   while (countOrPredicate-- > 0) {
//   //     const v = fn();
//   //     if (v === undefined) continue;
//   //     initial = reduce(initial, v);
//   //   }
//   // } else {
//   //   //eslint-disable-next-line functional/no-let
//   //   let repeats, valuesProduced;
//   //   repeats = valuesProduced = 0;
//   //   while (countOrPredicate(repeats, valuesProduced)) {
//   //     repeats++;
//   //     const v = fn();
//   //     if (v === undefined) continue;
//   //     initial = reduce(initial, v);
//   //     valuesProduced++;
//   //   }
//   // }
//   // return initial;
// };