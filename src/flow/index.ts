import { number as guardNumber} from "../Guards.js";

export * as StateMachine from './StateMachine.js';
export * from './Timer.js';


export type RepeatPredicate = (repeats:number, valuesProduced:number)=>boolean;
/**
 * Runs `fn` a certain number of times, accumulating result into return array.
 * If `fn` returns undefined, it is skipped.
 * 
 * ```js
 * // Results will be an array with five random numbers
 * const results = repeat(5, () => Math.random());
 * ```
 * 
 * Repeats can be specified as an integer (eg 5 for five repeats), or a function
 * that gives _false_ when repeating should stop.
 * 
 * ```js
 * // Keep running `fn` until we've accumulated 10 values
 * // Useful if `fn` sometimes returns _undefined_
 * const results = repeat((repeats, valuesProduced) => valuesProduced < 10, fn);
 * ```
 * 
 * If you don't need to accumulate return values, consider {@link Generators.count} with {@link Generators.forEach}.
 * 
 * @param countOrPredicate Number of repeats or function returning false when to stop 
 * @param fn Function to run, must return a value to accumulate into array or _undefined_
 * @returns Array of accumulated results
 */
export const repeat = <V>(countOrPredicate:number|RepeatPredicate, fn:()=>V|undefined):readonly V[] => {
  // Unit tested: expected return array length
  //eslint-disable-next-line functional/no-let
  let repeats, valuesProduced;
  repeats = valuesProduced = 0;
  const ret = [];

  if (typeof countOrPredicate === `number`) {
    guardNumber(countOrPredicate, `positive`, `countOrPredicate`);
    //eslint-disable-next-line functional/no-loop-statement
    while (countOrPredicate-- > 0) {
      repeats++;
      const v = fn();
      if (v === undefined) continue;
      //eslint-disable-next-line functional/immutable-data
      ret.push(v);
      valuesProduced++;
    }
  } else {
    //eslint-disable-next-line functional/no-loop-statement
    while (countOrPredicate(repeats, valuesProduced)) {
      repeats++;
      const v = fn();
      if (v === undefined) continue;
      //eslint-disable-next-line functional/immutable-data
      ret.push(v);
      valuesProduced++;
    }
  }
  return ret;
};