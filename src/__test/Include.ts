/* eslint-disable */
import test, { type ExecutionContext } from 'ava';
import { minMaxAvg } from '../collections/arrays/NumericArrays.js';
import { compareValuesEqual } from '../collections/arrays/index.js';
import { isEqualDefault } from '../IsEqual.js';
//test.todo('sf');

export const areIntegers = (t: ExecutionContext, a: Array<number>) => {
  for (let i = 0; i < a.length; i++) {
    t.is(Math.abs(a[ i ]) % 1, 0, `Integer ${ a[ i ] }`);
  }
};

export const arrayValuesEqual = <V>(
  t: ExecutionContext,
  a: Iterable<V>,
  b: Iterable<V>,
  eq = isEqualDefault<V>
) => {
  if (compareValuesEqual(a, b, eq)) {
    t.assert(true);
  } else {
    t.fail(`Arrays not equal. A: ${ JSON.stringify(a) } B: ${ JSON.stringify(b) }`);
  }
};

export const closeTo = <V>(
  t: ExecutionContext,
  a: number,
  b: number,
  precision: number = 3
) => {
  const aa = a.toPrecision(precision);
  const bb = b.toPrecision(precision);
  if (aa !== bb) t.fail(`A is not close enough to B. A: ${ a } B: ${ b }`);
  else t.assert(true);
};

export const isCloseTo = (a: number, b: number, precision: number = 3) => {
  const aa = a.toPrecision(precision);
  const bb = b.toPrecision(precision);
  if (aa !== bb) return [ false, `A is not close enough to B. A: ${ a } B: ${ b } Precision: ${ precision }` ];
  else return [ true ];
}

/**
 * True if a contains all of b.
 * @param t
 * @param a
 * @param b
 */
export const arrayValueIncludes = <V>(
  t: ExecutionContext,
  a: ArrayLike<V>,
  b: ArrayLike<V>,
  eq = isEqualDefault<V>
) => {
  for (let i = 0; i < b.length; i++) {
    let found = false;
    for (let x = 0; x < a.length; x++) {
      if (eq(b[ i ], a[ x ])) {
        found = true;
        break;
      }
    }
    if (!found) {
      t.fail(
        `Item not found: ${ JSON.stringify(b[ i ]) }. A: ${ JSON.stringify(a) }`
      );
      break;
    }
  }
};

export type EventPromiseOpts = {
  event: string;
  eventObj: any;
  fires?: number;
  runAfterAdd?: () => void;
  validateEvent?: (data: any) => boolean;
  timeoutMs: number;
};

export const isEmptyArray = (v: any) => {
  if (Array.isArray(v)) {
    return v.length === 0;
  }
  return false;
};

export const eventPromise = (opts: EventPromiseOpts) => {
  let fires = opts.fires ?? 1;
  let done = false;
  return new Promise((resolve, reject) => {
    // Event handler
    const handler = (data: any) => {
      fires--;
      if (fires < 0) {
        done = true;
        return reject(`Fired too many times: ${ opts.fires }`);
      }
      if (opts.validateEvent) {
        if (!opts.validateEvent(data)) {
          opts.eventObj.removeEventListener(handler);
          done = true;
          return reject(`Validation failed`);
        }
      }

      if (fires === 0) {
        done = true;
        opts.eventObj.removeEventListener(handler);
        resolve(data);
      }
    };

    // Add event handler
    opts.eventObj.addEventListener(opts.event, handler);
    if (opts.runAfterAdd) opts.runAfterAdd();

    setTimeout(() => {
      if (!done) {
        done = true;
        reject(`Timeout ${ opts.timeoutMs }`);
      }
    }, opts.timeoutMs);
  });
};

export const equalUnordered = (
  t: ExecutionContext,
  a: Array<any>,
  b: Array<any>
) => {
  // if (a.length !== b.length) {
  //   t.fail(`length ${a.length} expected ${b.length}`);
  //   return;
  // }
  t.is(a.length, b.length, `Array length`);

  const aa = [ ...a ].sort();
  const bb = [ ...b ].sort();
  for (let i = 0; i < aa.length; i++) {
    // if (aa[i] !== bb[i]) {
    //   t.fail(`Index ${i} ${aa[i]}, expected ${bb[i]}`);

    //   return;
    // }
    t.is(aa[ i ], bb[ i ], `Contents at ${ i }`);
  }
};

export type ExpectedOpts = {
  lowerIncl?: number;
  upperIncl?: number;
  lowerExcl?: number;
  upperExcl?: number;
};

export const rangeCheckInteger = (
  t: ExecutionContext,
  v: Array<number>,
  expected: ExpectedOpts
) => {
  rangeCheck(t, v, expected);
  areIntegers(t, v);
};

/**
 * Succeeds if there is a value in `v` with some nearness to the target
 * @param t 
 * @param v 
 * @param range 
 * @param target 
 * @returns 
 */
export const someNearness = (
  t: ExecutionContext,
  v: Iterable<number>,
  range: number,
  target: number
) => {
  let closestDistance = Number.NaN;
  let closestValue = Number.NaN;
  let count = 0;
  for (const vv of v) {
    count++;
    const dist = Math.abs(vv - target);
    if (dist < range) return true;
    if (dist < closestDistance || Number.isNaN(closestDistance)) {
      closestDistance = dist;
      closestValue = vv;
    }
  }
  t.fail(
    `Target value (${ target }) too far. Closest was ${ closestValue } with dist ${ closestDistance }. Min distance: ${ range }. Count: ${ count }`
  );
  return false;
};

/**
 * Fails if none of the values are close to the `targets`.
 * @param t 
 * @param v 
 * @param range 
 * @param targets 
 * @returns 
 */
export const someNearnessMany = (
  t: ExecutionContext,
  v: Iterable<number>,
  range: number,
  targets: number[]
) => {
  for (const target of targets) {
    if (!someNearness(t, v, range, target)) return;
  }
};

export const rangeCheck = (
  t: ExecutionContext,
  v: Iterable<number>,
  expected: ExpectedOpts
) => {
  const { min, max } = minMaxAvg(v);
  if (expected.lowerExcl !== undefined) {
    if (min < expected.lowerExcl) {
      t.is(min, expected.lowerExcl, 'Lower exclusive');
    }
  }
  if (expected.lowerIncl !== undefined) {
    if (min >= expected.lowerIncl) {
      t.is(min, expected.lowerIncl, 'Lower inclusive');
    }
  }
  if (expected.upperExcl !== undefined) {
    if (max > expected.upperExcl) {
      t.is(max, expected.upperExcl, 'Upper exclusive');
    }
  }
  if (expected.upperIncl !== undefined) {
    if (max <= expected.upperIncl) {
      t.is(max, expected.upperIncl, 'Upper inclusive');
    }
  }
};
