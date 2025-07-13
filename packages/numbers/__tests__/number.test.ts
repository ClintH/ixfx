import { test, expect } from 'vitest';
import {
  average,
  isApprox,
  linearSpace,
  quantiseEvery,
  round,
  applyToValues,
  averageWeighted,
  weight,
  total
} from '../src/index.js';
//import { gaussian } from '../../modulation/Gaussian.js';


test('apply', () => {
  const o = {
    name: 'john',
    x: 10,
    y: 20
  };
  const o2 = applyToValues(o, (v) => v * 2);
  expect(o2.x).toEqual(20);
  expect(o2.y).toEqual(40);


  const oo = {
    h: 330,
    l: 0.7058823529411764,
    s: 1,
  }
  const oo2 = applyToValues(oo, v => round(3, v));
  expect(oo2).toEqual({ h: 330, l: 0.705, s: 1 });

});

test('is-approx', () => {
  // Check for divide by zero errors
  expect(isApprox(0.1, 0, 0.05)).toBeTruthy();
  expect(isApprox(0.1, 0, -0.05)).toBeTruthy();
  expect(isApprox(0.1, 0, 0)).toBeTruthy();
  expect(isApprox(0, 0, 0)).toBeTruthy();
  // True due to rounding
  expect(isApprox(0, 0, 0.000000001)).toBeTruthy();

  expect(isApprox(0.1, 0, 0.11)).toBeFalsy();
  expect(isApprox(0.1, 0, -0.11)).toBeFalsy();
  expect(isApprox(0, 0, 0.1)).toBeFalsy();

  const closeTo100 = isApprox(0.1, 100);
  expect(closeTo100(100)).toBeTruthy();
  expect(closeTo100(101)).toBeTruthy();
  expect(closeTo100(90)).toBeTruthy();

  expect(closeTo100(80)).toBeFalsy();
  expect(closeTo100(111)).toBeFalsy();
  expect(closeTo100(Number.NaN)).toBeFalsy();
  expect(closeTo100(Number.NEGATIVE_INFINITY)).toBeFalsy();
  expect(closeTo100(Number.POSITIVE_INFINITY)).toBeFalsy();
  expect(closeTo100(Number.MAX_SAFE_INTEGER)).toBeFalsy();
  expect(closeTo100(Number.MIN_SAFE_INTEGER)).toBeFalsy();

  expect(() => isApprox(Number.NaN, 100, 10)).toThrow();
  expect(() => isApprox(0, Number.NaN, 10)).toThrow();
  expect(isApprox(0, 100, Number.NaN)).toBeFalsy();

  expect(() => isApprox(Number.NaN, 100)).toThrow();
  // @ts-ignore
  expect(() => isApprox(false, 100)).toThrow();

  expect(() => isApprox(0.1, Number.NaN)).toThrow();
  // @ts-ignore
  expect(() => isApprox(0.1, { hello: 'there' })).toThrow();
  // @ts-ignore
  expect(() => isApprox(0.1, '100')).toThrow();
  // @ts-ignore
  expect(() => isApprox(0.1, true)).toThrow();

  const exact100 = isApprox(0, 100);
  expect(exact100(100)).toBeTruthy();

  expect(exact100(101)).toBeFalsy();
  expect(exact100(99)).toBeFalsy();

  expect(isApprox(0.1, 1, 1.01)).toBeTruthy();
  expect(isApprox(0.1, 1, 1.1)).toBeTruthy();

  expect(isApprox(0.1, 1, 1)).toBeTruthy();
  expect(isApprox(0.1, 1, 0.99)).toBeTruthy();
  expect(isApprox(0.1, 1, 0)).toBeFalsy();
});

test(`round`, (t) => {
  expect(round(2, 10)).toBe(10);
  expect(round(2, 10.1234)).toBe(10.12);
  expect(round(3, 10.1234)).toBe(10.123);
  expect(round(4, 10.1234)).toBe(10.1234);
  expect(round(5, 0.010000000000009)).toBe(0.01);

  const r = round(3);
  expect(r(100)).toBe(100);
  expect(r(100.12345678)).toBe(100.123);
  expect(r(0.00000000001)).toBe(0);

  const r2 = round(1, true);
  expect(r2(0.9999)).toBe(1);
});

test(`linearSpace`, () => {
  const t1 = [ ...linearSpace(0, 9, 10) ];
  expect(t1).toEqual([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);

  const t2 = [ ...linearSpace(5, 10, 11) ];

  expect(t2).toEqual([ 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10 ]);

  const t3 = [ ...linearSpace(10, 5, 6) ];
  expect(t3).toEqual([ 10, 9, 8, 7, 6, 5 ]);

  const t4 = [ ...linearSpace(10, 5, 2) ];
  expect(t4).toEqual([ 10, 5 ]);

  const t5 = [ ...linearSpace(10, 5, 3) ];
  expect(t5).toEqual([ 10, 7.5, 5 ]);
});

test(`quantiseEvery`, () => {
  expect(quantiseEvery(1.11, 0.10)).toBe(1.10);
  expect(quantiseEvery(1, 0.1)).toBe(1.0);
  expect(quantiseEvery(1.19, 0.1)).toBe(1.2);
  expect(quantiseEvery(1.2, 0.1)).toBe(1.2);


  expect(quantiseEvery(11, 10)).toBe(10);
  expect(quantiseEvery(25, 10)).toBe(30);
  expect(quantiseEvery(0, 10)).toBe(0);
  expect(quantiseEvery(4, 10)).toBe(0);
  expect(quantiseEvery(100, 10)).toBe(100);

  expect(quantiseEvery(15, 10, false)).toBe(10);
  expect(quantiseEvery(15, 10, true)).toBe(20);

  // @ts-ignore
  expect(() => quantiseEvery(`string`, 10)).throws();
  // @ts-ignore
  expect(() => quantiseEvery(10, Number.NaN)).throws();
});


test(`total`, () => {

  expect(total([ 1, 2, 3 ])).toBe(6);
  expect(total([ 1, 2, -3 ])).toBe(0);
  expect(total([ 1, 2, Number.NaN, 3 ])).toBe(6);
  // @ts-expect-error
  expect(total([ 1, 2, null, 3 ])).toBe(6);
  // @ts-expect-error
  expect(total([ 1, 2, {}, 3 ])).toBe(6);
});

test(`average`, () => {
  const a = [ 1 ];
  expect(average(a)).toBe(1);

  const b = [ 1, 2, 3, 4, 5 ];
  expect(average(b)).toBe(3);

  const c = [ -5, 5 ];
  expect(average(c)).toBe(0);

  const d = [ 1, 0, null, undefined, NaN ];
  // @ts-ignore
  expect(average(d)).toBe(0.5);

  const e = [ 1, 1.4, 0.9, 0.1 ];
  expect(average(e)).toBe(0.85);
});
