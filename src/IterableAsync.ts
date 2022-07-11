/* eslint-disable */
/**
 * 
 * ```js
 * chunks([1,2,3,4,5,6,7,8,9,10], 3);
 * // Yields [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 * @param it 
 * @param size 
 */
export async function* chunks<V>(it:Iterable<V>, size:number) {
  // Source: https://surma.github.io/underdash/
  let buffer = [];
  for await (const v of it) {
    buffer.push(v);
    if (buffer.length === size) {
      yield buffer;
      buffer = [];
    }
  }
  if (buffer.length > 0) yield buffer;
}

export async function* concat<V>(...its:readonly Iterable<V>[]) {
  // Source: https://surma.github.io/underdash/

  for await (const it of its) yield* it;
}

export async function* dropWhile<V>(it:AsyncIterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  //const iit = it[Symbol.asyncIterator]();
  for await (const v of it)
  { if (!f(v)) {
    yield v;
    break;
  } }
  yield* it;
}

export async function equals<V>(it1:Iterable<V>, it2:Iterable<V>) {
  // https://surma.github.io/underdash/
  const iit1 = it1[Symbol.iterator]();
  const iit2 = it2[Symbol.iterator]();
  while (true) {
    const i1 = await iit1.next(), i2 = await iit2.next();
    if (i1.value !== i2.value) return false;
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
 export async function every<V>(it:Iterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  let ok = true;
  for await (const v of it) ok = ok && f(v);
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
 export async function* fill<V>(it:AsyncIterable<V>, v:V) {
  // https://surma.github.io/underdash/
  for await (const _ of it) yield v;
}

/**
 * ```js
 * filter([1, 2, 3, 4], e => e % 2 == 0);
 * returns [2, 4]
 * ```
 * @param it 
 * @param f 
 */
 export async function* filter<V>(it:AsyncIterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  for await (const v of it) {
    if (!f(v)) continue;
    yield v;
  }
}

/**
 * 
 * ```js
 * find([1, 2, 3, 4], e => e > 2);
 * // Yields: 3
 * ```
 * @param it 
 * @param f 
 * @returns 
 */
 export async function find<V>(it:Iterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  for await (const v of it)
  { if (f(v)) return v; } 
}

/**
 * ```js
 * flatten([1, [2, 3], [[4]]]);
 * // Yields: [1, 2, 3, [4]];
 * ```
 * @param it 
 */
 export async function* flatten<V>(it:AsyncIterable<V>) {
  // https://surma.github.io/underdash/
  for await (const v of it) {
    if (Symbol.asyncIterator in v) { 
      // @ts-ignore
      yield* v;
    } else {
      yield v;
    }
  }
}

/**
 * 
 * @param it 
 * @param f 
 */
 export async function forEach<V>(it:AsyncIterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  for await (const v of it) f(v);
}

export async function* map<V>(it:AsyncIterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  for await (const v of it) 
  { yield f(v); }
}

export async function max<V>(it:AsyncIterable<V>, gt = (a:V, b:V) => a > b) {
  // https://surma.github.io/underdash/
  let max;
  for await (const v of it) {
    if(!max) {
      max = v;
      continue;
    }
    max = gt(max, v)?max:v;
  }
  return max;
}

export async function min<V>(it:AsyncIterable<V>, gt = (a:V, b:V) => a > b) {
  // https://surma.github.io/underdash/
  let min;
  for await (const v of it) {
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
 export async function* range(start:number, len:number) {
  // https://surma.github.io/underdash/
  for (let i=0;i<len;i++) {
    yield start++;
  }
  //for (let i=len;len > 0; len--) yield start++;
}

export async function reduce<V>(it:AsyncIterable<V>, f:(acc:V, current:V) => V, start:V) {
  // https://surma.github.io/underdash/
  for await (const v of it) start = f(start, v);
  return start;
}

export async function* slice<V>(it:AsyncIterable<V>, start = 0, end = Number.POSITIVE_INFINITY) {
  // https://surma.github.io/underdash/
  const iit = it[Symbol.asyncIterator]();
  for(; start > 0; start--, end--) await iit.next();
  for await (const v of it) 
  { if(end-- > 0)
  { yield v; }
  else
  { break; } }
}

export async function some<V>(it:AsyncIterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  for await (const v of it) 
  { if(f(v)) return true; }
  return false;
}

export async function* takeWhile<V>(it:AsyncIterable<V>, f:(v:V) => boolean) {
  // https://surma.github.io/underdash/
  for await (const v of it) {
    if (!f(v)) return;
    yield v;
  }
}

/**
 * Returns an array of values from an iterator.
 * 
 * ```js
 * const data = await toArray(adsrSample(opts, 10));
 * ```
 * 
 * Note: If the iterator is infinite, be sure to provide a `count` or the function
 * will never return.
 * 
 * @param it Asynchronous iterable
 * @param count Number of items to return, by default all.
 * @returns 
 */
 export async function toArray<V>(it:AsyncIterable<V>, count = Infinity):Promise<readonly V[]> {
  // https://2ality.com/2016/10/asynchronous-iteration.html
  const result = [];
  const iterator = it[Symbol.asyncIterator]();
  while (result.length < count) {
      const {value,done} = await iterator.next();
      if (done) break;
      result.push(value);
  }
  return result;

}

export async function* unique<V>(it:AsyncIterable<V>, f:((id:V) => V) = id => id) {
  // https://surma.github.io/underdash/
  const buffer = [];
  for await (const v of it) {
    const fv = f(v);
    if (buffer.indexOf(fv) !== -1) continue;
    buffer.push(fv);
    yield v;
  }
}

export async function* zip<V>(...its:AsyncIterable<V>[]) {
  // https://surma.github.io/underdash/
  const iits = its.map(it => it[Symbol.asyncIterator]());
  while(true) {
    const vs = await Promise.all(iits.map(it => it.next()));
    if (vs.some(v => v.done)) return;
    yield vs.map(v => v.value);
  }
}