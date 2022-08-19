/**
 * Return `it` broken up into chunks of `size`
 * 
 * ```js
 * chunks([1,2,3,4,5,6,7,8,9,10], 3);
 * // Yields: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 * @param it 
 * @param size 
 * @returns 
 */

import {IsEqual} from "./Util";

/**
 * Breaks an iterable into array chunks
 * ```js
 * chunks([1,2,3,4,5,6,7,8,9,10], 3);
 * // Yields [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 * @param it 
 * @param size 
 */
//eslint-disable-next-line func-style
export function* chunks<V>(it:Iterable<V>, size:number) {
  //eslint-disable-next-line functional/no-let
  let buffer = [];
  
  for (const v of it) {
    //eslint-disable-next-line functional/immutable-data
    buffer.push(v);
    if (buffer.length === size) {
      yield buffer;
      buffer = [];
    }
  }
  if (buffer.length > 0) yield buffer;
}

/**
 * Return concatenation of iterators
 * @param its 
 */
//eslint-disable-next-line func-style
export function* concat<V>(...its:readonly Iterable<V>[]) {
  
  for (const it of its) yield* it;
}

/**
 * Drops elements that do not meet the predicate `f`.
 * ```js
 * dropWhile([1, 2, 3, 4], e => e < 3);
 * returns [3, 4]
 * ```
 * @param it 
 * @param f 
 */
//eslint-disable-next-line func-style
export function* dropWhile<V>(it:Iterable<V>, f:(v:V) => boolean) {
  
  for (const v of it) { 
    if (!f(v)) {
      yield v;
      break;
    }
  }
  yield* it;
}

/**
 * Returns true if items in two iterables are equal, as
 * determined by the `equality` function.
 * @param it1 
 * @param it2 
 * @param equality 
 * @returns 
 */
//eslint-disable-next-line func-style
export function equals<V>(it1:IterableIterator<V>, it2:IterableIterator<V>, equality?:IsEqual<V>) {
  //it1 = it1[Symbol.iterator]();
  //it2 = it2[Symbol.iterator]();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const i1 = it1.next(), i2 = it2.next();
    if (equality !== undefined) {
      if (!equality(i1.value, i2.value)) return false;
    } else if (i1.value !== i2.value) return false;
    if (i1.done || i2.done) return i1.done && i2.done;
  }
}

/**
 * Returns true if `f` returns true for 
 * every item in iterable
 * @param it 
 * @param f 
 * @returns 
 */
//eslint-disable-next-line func-style
export function every<V>(it:Iterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  //eslint-disable-next-line functional/no-let
  let ok = true;
  
  for (const v of it) ok = ok && f(v);
  return ok;
}

/**
 * Yields `v` for each item within `it`.
 * 
 * ```js
 * fill([1, 2, 3], 0);
 * // Yields: [0, 0, 0]
 * ```
 * @param it 
 * @param v 
 */
//eslint-disable-next-line func-style
export function* fill<V>(it:Iterable<V>, v:V) {
  // https://surma.github.io/underdash/
  
  for (const _ of it) yield v;
}

/**
 * Execute function `f` for each item in iterable
 * @param it 
 * @param f 
 */
//eslint-disable-next-line func-style
export function forEach<V>(it:Iterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  
  for (const v of it) f(v);
}

/**
 * ```js
 * filter([1, 2, 3, 4], e => e % 2 == 0);
 * returns [2, 4]
 * ```
 * @param it 
 * @param f 
 */
//eslint-disable-next-line func-style
export function* filter<V>(it:Iterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  
  for (const v of it) {
    if (!f(v)) continue;
    yield v;
  }
}

/**
 * Returns first item from iterable `it` that matches predicate `f`
 * ```js
 * find([1, 2, 3, 4], e => e > 2);
 * // Yields: 3
 * ```
 * @param it 
 * @param f 
 * @returns 
 */
//eslint-disable-next-line func-style
export  function find<V>(it:Iterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  
  for (const v of it) { 
    if (f(v)) return v;
  } 
}

/**
 * Returns a 'flattened' copy of array, un-nesting arrays one level
 * ```js
 * flatten([1, [2, 3], [[4]]]);
 * // Yields: [1, 2, 3, [4]];
 * ```
 * @param it 
 */
//eslint-disable-next-line func-style
export function* flatten<V>(it:Iterable<V>) {
  // https://surma.github.io/underdash/
  
  for (const v of it) {
    if (Symbol.iterator in v) { 
      // @ts-ignore
      yield* v;
    } else {
      yield v;
    }
  }
}

/**
 * Maps an iterable of type `V` to type `X`.
 * ```js
 * map([1, 2, 3], e => e*e)
 * returns [1, 4, 9]
 * ```
 * @param it 
 * @param f 
 */
//eslint-disable-next-line func-style
export function* map<V, X>(it:Iterable<V>, f:(v:V) => X) {
  // https://surma.github.io/underdash/
  
  for (const v of it) { 
    yield f(v);
  }
}

/**
 * Returns the maximum seen of an iterable
 * ```js
 * min([
 *  {i:0,v:1},
 *  {i:1,v:9},
 *  {i:2,v:-2}
 * ], (a, b) => a.v > b.v);
 * // Yields: {i:1, v:-9}
 * ```
 * @param it Iterable
 * @param gt Should return _true_ if `a` is greater than `b`.
 * @returns 
 */
//eslint-disable-next-line func-style
export function max<V>(it:Iterable<V>, gt = (a:V, b:V) => a > b) {
  // https://surma.github.io/underdash/
  //eslint-disable-next-line functional/no-let
  let max;
  
  for (const v of it) {
    if(!max) {
      max = v;
      continue;
    }
    max = gt(max, v)?max:v;
  }
  return max;
}

/**
 * Returns the minimum seen of an iterable
 * ```js
 * min([
 *  {i:0,v:1},
 *  {i:1,v:9},
 *  {i:2,v:-2}
 * ], (a, b) => a.v > b.v);
 * // Yields: {i:2, v:-2}
 * ```
 * @param it Iterable
 * @param gt Should return _true_ if `a` is greater than `b`.
 * @returns 
 */
//eslint-disable-next-line func-style
export function min<V>(it:Iterable<V>, gt = (a:V, b:V) => a > b) {
  // https://surma.github.io/underdash/
  //eslint-disable-next-line functional/no-let
  let min;
  
  for (const v of it) {
    if(!min) {
      min = v;
      continue;
    }
    min = gt(min, v)?v:min;
  }
  return min;
}

/**
 * Returns count from `start` for a given length
 * ```js
 * range(-5, 10);
 * // Yields: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4]
 * ```
 * @param start 
 * @param len 
 */
//eslint-disable-next-line func-style
export function* range(start:number, len:number) {
  // https://surma.github.io/underdash/
  //eslint-disable-next-line functional/no-let
  for (let i=0;i<len;i++) {
    yield start++;
  }
  //for (let i=len;len > 0; len--) yield start++;
}

/**
 * Reduce for iterables
 * ```js
 * reduce([1, 2, 3], (acc, cur) => acc + cur, 0);
 * // Yields: 6
 * ```
 * @param it Iterable
 * @param f Function
 * @param start Start value
 * @returns 
 */
//eslint-disable-next-line func-style
export function reduce<V>(it:Iterable<V>, f:(acc:V, current:V) => V, start:V) {
  // https://surma.github.io/underdash/
  
  for (const v of it) start = f(start, v);
  return start;
}

/**
 * Returns a section from an iterable
 * @param it Iterable
 * @param start Start index
 * @param end End index (or until completion)
 */
//eslint-disable-next-line func-style
export function* slice<V>(it:Iterable<V>, start = 0, end = Number.POSITIVE_INFINITY) {
  // https://surma.github.io/underdash/
  const iit = it[Symbol.iterator]();
  
  for(; start > 0; start--, end--) iit.next();
  
  for (const v of it) { 
    if (end-- > 0) { 
      yield v;
    } else { 
      break; 
    } 
  }
}

/**
 * Returns true the first time `f` returns true. Useful for spotting any occurrence of
 * data, and exiting quickly 
 * ```js
 * some([1, 2, 3, 4], e => e % 3 === 0);
 * // Yields: true
 * ```
 * @param it Iterable
 * @param f Filter function
 * @returns 
 */
//eslint-disable-next-line func-style
export function some<V>(it:Iterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  
  for (const v of it) { 
    if (f(v)) return true;
  }
  return false;
}

/**
 * Returns items for which the filter function returns _true_
 * ```js
 * takeWhile([ 1, 2, 3, 4 ], e => e < 3);
 * // Yields: [ 1, 2 ]
 * ```
 * @param it Iterable
 * @param f Filter function
 * @returns 
 */
//eslint-disable-next-line func-style
export function* takeWhile<V>(it:Iterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  
  for (const v of it) {
    if (!f(v)) return;
    yield v;
  }
}

/**
 * Returns unique items from several iterables
 * ```js
 * unique([{i:0,v:2},{i:1,v:3},{i:2,v:2}], e => e.v);
 * Yields: returns [{i:0,v:2},{i:1,v:3}]
 *
 * @param it 
 * @param f 
 */
//eslint-disable-next-line func-style
export function* unique<V>(it:Iterable<V>, f:((id:V) => V) = id => id) {
  // https://surma.github.io/underdash/
  const buffer = [];
  
  for (const v of it) {
    const fv = f(v);
    if (buffer.indexOf(fv) !== -1) continue;
    //eslint-disable-next-line functional/immutable-data
    buffer.push(fv);
    yield v;
  }
}

/**
 * Combine same-positioned items from several iterables
 * ```js
 * zip( [1, 2, 3], [4, 5, 6], [7, 8, 9] );
 * Yields: [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
 * ```
 * @param its 
 * @returns 
 */
//eslint-disable-next-line func-style
export function* zip<V>(...its:readonly Iterable<V>[]) {
  // https://surma.github.io/underdash/
  const iits = its.map(it => it[Symbol.iterator]());

  
  while(true) {
    const vs = iits.map(it => it.next());
    if (vs.some(v => v.done)) return;
    yield vs.map(v => v.value);
  }
}