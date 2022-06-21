/**
 * 
 * ```js
 * chunks([1,2,3,4,5,6,7,8,9,10], 3);
 * // Yields [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 * @param it 
 * @param size 
 */
async function* chunks(it, size) {
  // Source: https://surma.github.io/underdash/
  let buffer = [];
  for await (let v of it) {
    buffer.push(v);
    if (buffer.length === size) {
      yield buffer;
      buffer = [];
    }
  }
  if (buffer.length > 0) yield buffer;
}

async function* concat(...its) {
  // Source: https://surma.github.io/underdash/

  for await (let it of its) yield* it;
}

async function* dropWhile(it, f) {
  // https://surma.github.io/underdash/
  it = it[Symbol.iterator]();
  for await (let v of it)
    if (!f(v)) {
      yield v;
      break;
    }
  yield* it;
}

async function equals(it1, it2) {
  // https://surma.github.io/underdash/
  it1 = it1[Symbol.iterator]();
  it2 = it2[Symbol.iterator]();
  while (true) {
    let i1 = await it1.next(), i2 = await it2.next();
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
async function every(it, f) {
  // https://surma.github.io/underdash/
  let ok = true;
  for await (let v of it) ok = ok && f(v);
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
async function* fill(it, v) {
  // https://surma.github.io/underdash/
  for await (let _ of it) yield v;
}

/**
 * ```js
 * filter([1, 2, 3, 4], e => e % 2 == 0);
 * returns [2, 4]
 * ```
 * @param it 
 * @param f 
 */
async function* filter(it, f) {
  // https://surma.github.io/underdash/
  for await (let v of it) {
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
async function find(it, f) {
  // https://surma.github.io/underdash/
  for await (let v of it)
    if (f(v)) return v; 
}

/**
 * ```js
 * flatten([1, [2, 3], [[4]]]);
 * // Yields: [1, 2, 3, [4]];
 * ```
 * @param it 
 */
async function* flatten(it) {
  // https://surma.github.io/underdash/
  for await (let v of it) {
    if (v[Symbol.iterator])
      yield* v;
    else
      yield v;
  }
}

/**
 * 
 * @param it 
 * @param f 
 */
async function forEach(it, f) {
  // https://surma.github.io/underdash/
  for await (let v of it) f(v);
}

async function* map(it, f) {
  // https://surma.github.io/underdash/
  for await (let v of it) 
    yield f(v);
}

async function max(it, gt = (a,b) => a > b) {
  // https://surma.github.io/underdash/
  let max = undefined;
  for await (let v of it) {
    if(!max) {
      max = v;
      continue;
    }
    max = gt(max, v)?max:v;
  }
  return max;
}

async function min(it, gt = (a, b) => a > b) {
  // https://surma.github.io/underdash/
  let min = undefined;
  for await (let v of it) {
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
async function* range(start, len) {
  // https://surma.github.io/underdash/
  for await (;len > 0; len--) yield start++;
}

async function reduce(it, f, v0) {
  // https://surma.github.io/underdash/
  for await (let v of it) v0 = f(v0, v);
  return v0;
}

function* slice(it, start = 0, end = Number.POSITIVE_INFINITY) {
  // https://surma.github.io/underdash/
  it = it[Symbol.iterator]();
  for(; start > 0; start--, end--) await it.next();
  for await (let v of it) 
    if(end-- > 0)
      yield v;
    else
      break;
}

async function some(it, f) {
  // https://surma.github.io/underdash/
  for await (let v of it) 
    if(f(v)) return true;
  return false;
}

async function* takeWhile(it, f) {
  // https://surma.github.io/underdash/
  for await (let v of it) {
    if (!f(v)) return;
    yield v;
  }
}

async function* unique(it, f = id => id) {
  // https://surma.github.io/underdash/
  const buffer = [];
  for await (let v of it) {
    const fv = f(v);
    if (buffer.indexOf(fv) !== -1) continue;
    buffer.push(fv);
    yield v;
  }
}

async function* zip(...its) {
  // https://surma.github.io/underdash/
  its = its.map(it => it[Symbol.iterator]());
  while(true) {
    const vs = await Promise.all(its.map(it => it.next()));
    if (vs.some(v => v.done)) return;
    yield vs.map(v => v.value);
  }
}