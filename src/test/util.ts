/* eslint-disable */
import test, { type ExecutionContext } from 'ava';
import { minMaxAvg } from '../collections/NumericArrays.js';

//test.todo('sf');

export const areIntegers = (t: ExecutionContext, a: Array<number>) => {
  for (let i = 0; i < a.length; i++) {
    t.is(Math.abs(a[i]) % 1, 0, `Integer ${a[i]}`);
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

export const eventPromise = (opts: EventPromiseOpts) => {
  let fires = opts.fires ?? 1;
  let done = false;
  return new Promise((resolve, reject) => {
    // Event handler
    const handler = (data: any) => {
      fires--;
      if (fires < 0) {
        done = true;
        return reject(`Fired too many times: ${opts.fires}`);
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
        reject(`Timeout ${opts.timeoutMs}`);
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

  const aa = [...a].sort();
  const bb = [...b].sort();
  for (let i = 0; i < aa.length; i++) {
    // if (aa[i] !== bb[i]) {
    //   t.fail(`Index ${i} ${aa[i]}, expected ${bb[i]}`);

    //   return;
    // }
    t.is(aa[i], bb[i], `Contents at ${i}`);
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

export const someNearness = (
  t: ExecutionContext,
  v: Array<number> | readonly number[],
  range: number,
  target: number
) => {
  if (v.length === 0) {
    t.fail('Values empty');
    return;
  }

  let closestDistance = Number.NaN;
  let closestValue = Number.NaN;
  for (const vv of v) {
    const dist = Math.abs(vv - target);
    if (dist < range) return true;
    if (dist < closestDistance || Number.isNaN(closestDistance)) {
      closestDistance = dist;
      closestValue = vv;
    }
  }
  t.fail(
    `Target value (${target}) too far. Closest was ${closestValue} with dist ${closestDistance}. Min distance: ${range}`
  );
  return false;
};

export const someNearnessMany = (
  t: ExecutionContext,
  v: Array<number> | readonly number[],
  range: number,
  targets: number[]
) => {
  for (const target of targets) {
    if (!someNearness(t, v, range, target)) return;
  }
};

export const rangeCheck = (
  t: ExecutionContext,
  v: Array<number> | readonly number[],
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
