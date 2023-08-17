import test from 'ava';
import {
  average,
  isApproximately,
  linearSpace,
  quantiseEvery,
  round,
} from '../Numbers.js';

test('isApproximately', (t) => {
  const closeTo100 = isApproximately(100, 0.1);
  t.true(closeTo100(100));
  t.true(closeTo100(101));
  t.true(closeTo100(90));
  t.false(closeTo100(80));
  t.false(closeTo100(111));
  t.false(closeTo100(Number.NaN));
  t.false(closeTo100(Number.NEGATIVE_INFINITY));
  t.false(closeTo100(Number.POSITIVE_INFINITY));
  t.false(closeTo100(Number.MAX_SAFE_INTEGER));
  t.false(closeTo100(Number.MIN_SAFE_INTEGER));

  t.throws(() => isApproximately(100, Number.NaN));
  // @ts-ignore
  t.throws(() => isApproximately(100, false));

  t.throws(() => isApproximately(Number.NaN, 0.1));
  // @ts-ignore
  t.throws(() => isApproximately({ hello: 'there' }, 0.1));
  // @ts-ignore
  t.throws(() => isApproximately('100', 0.1));
  // @ts-ignore
  t.throws(() => isApproximately(true, 0.1));

  const exact100 = isApproximately(100, 0);
  t.true(exact100(100));
  t.false(exact100(101));
  t.false(exact100(99));

  t.true(isApproximately(1, 0.1, 1.01));
  t.true(isApproximately(1, 0.1, 1.1));

  t.true(isApproximately(1, 0.1, 1));
  t.true(isApproximately(1, 0.1, 0.99));
  t.false(isApproximately(1, 0.1, 0));
});

test(`round`, (t) => {
  t.is(round(2, 10), 10);
  t.is(round(2, 10.1234), 10.12);
  t.is(round(3, 10.1234), 10.123);
  t.is(round(4, 10.1234), 10.1234);
  t.is(round(5, 0.010000000000009), 0.01);

  const r = round(3);
  t.is(r(100), 100);
  t.is(r(100.12345678), 100.123);
  t.is(r(0.00000000001), 0);
});

test(`linearSpace`, (t) => {
  const t1 = [...linearSpace(0, 9, 10)];
  t.like(t1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const t2 = [...linearSpace(5, 10, 11)];

  t.like(t2, [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]);

  const t3 = [...linearSpace(10, 5, 6)];
  t.like(t3, [10, 9, 8, 7, 6, 5]);

  const t4 = [...linearSpace(10, 5, 2)];
  t.like(t4, [10, 5]);

  const t5 = [...linearSpace(10, 5, 3)];
  t.like(t5, [10, 7.5, 5]);
});

test(`quantiseEvery`, (t) => {
  t.is(quantiseEvery(11, 10), 10);
  t.is(quantiseEvery(25, 10), 30);
  t.is(quantiseEvery(0, 10), 0);
  t.is(quantiseEvery(4, 10), 0);
  t.is(quantiseEvery(100, 10), 100);

  t.is(quantiseEvery(15, 10, false), 10);
  t.is(quantiseEvery(15, 10, true), 20);

  // @ts-ignore
  t.throws(() => quantiseEvery(`string`, 10));
  // @ts-ignore
  t.throws(() => quantiseEvery(10, Number.NaN));
});

test(`average`, (t) => {
  const a = [1];
  t.is(average(...a), 1);

  const b = [1, 2, 3, 4, 5];
  t.is(average(...b), 3);

  const c = [-5, 5];
  t.is(average(...c), 0);

  const d = [1, 0, null, undefined, NaN];
  // @ts-ignore
  t.is(average(...d), 0.5);

  const e = [1, 1.4, 0.9, 0.1];
  t.is(average(...e), 0.85);
});
