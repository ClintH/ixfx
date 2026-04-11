import { expect, it } from 'vitest';
import { FrequencyByGroup } from '../src/frequency.js';
import * as IsEqual from '../src/util/is-equal.js';
import * as R from '../src/util/random.js';
import * as ToString from '../src/util/to-string.js';

function collect(count: number, fn: () => number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(fn());
  }
  return results;
}

it(`random`, () => {
  // Return min
  for (let i = 0; i < 100; i++) {
    expect(R.randomChanceInteger(0, 20, 10)).toBe(10);
  }
  // Return max
  for (let i = 0; i < 100; i++) {
    expect(R.randomChanceInteger(1.1, 20, 10)).toBe(20);
  }

  // 50% chance of using a random number
  const resultsGrouped1 = FrequencyByGroup.fromArray(collect(100, () => R.randomChanceInteger(0.5, 20, 10)));
  expect(resultsGrouped1.getRelative(`10`)).toBeGreaterThan(0.45);

  // 10% chance of using a random number
  const resultsGrouped2 = FrequencyByGroup.fromArray(collect(100, () => R.randomChanceInteger(0.1, 20, 10)));
  expect(resultsGrouped2.getRelative(`10`)).toBeGreaterThanOrEqual(0.88);
});

it(`is-equal`, () => {
  const o1 = { hello: `there` };
  const o2 = { hello: `there` };

  expect(IsEqual.isEmptyEntries({})).toBeTruthy();
  expect(IsEqual.isEmptyEntries({ hello: `there` })).toBeFalsy();
  expect(IsEqual.isEqualContextString(o1, o1, ``)).toBeTruthy();
  expect(IsEqual.isEqualContextString(o1, o2, ``)).toBeTruthy();
  expect(IsEqual.isEqualContextString({ hello: `there` }, { hello: `there!` }, ``)).toBeFalsy();

  expect(IsEqual.isEqualDefault(true, true)).toBeTruthy();
  expect(IsEqual.isEqualDefault(o1, o1)).toBeTruthy();
  expect(IsEqual.isEqualDefault(o1, o2)).toBeFalsy();

  expect(IsEqual.isEqualValueDefault(o1, o1)).toBeTruthy();
  expect(IsEqual.isEqualValueDefault(o1, o2)).toBeTruthy();
  expect(IsEqual.isEqualValueDefault({ hello: `there` }, { hello: `there!` })).toBeFalsy();

  expect(IsEqual.isEqualValuePartial(o1, o2)).toBeTruthy();
  expect(IsEqual.isEqualValuePartial({ name: `Apple`, loc: { x: 10, y: 10 } }, { name: `Apple`, loc: { x: 10, y: 10 } })).toBeTruthy();
  expect(IsEqual.isEqualValuePartial({ name: `Apple`, loc: { x: 10, y: 11 } }, { name: `Apple`, loc: { x: 10, y: 10 } })).toBeFalsy();

  expect(IsEqual.isEqualValuePartial({ ...o2, colour: `red` }, o1)).toBeTruthy();
  expect(IsEqual.isEqualValuePartial({ hello: `there!` }, o1)).toBeFalsy();
  expect(IsEqual.isEqualValuePartial({ a: `there` }, o1)).toBeFalsy();

  // @ts-expect-error testing error
  expect(() => IsEqual.isEqualValuePartial(false, {})).toThrow();
  // @ts-expect-error testing error
  expect(() => IsEqual.isEqualValuePartial({}, ``)).toThrow();
});

it(`to-string`, () => {
  expect(ToString.toStringDefault(`hello`)).toEqual(`hello`);
  expect(ToString.toStringDefault(false)).toEqual(`false`);
  expect(ToString.toStringDefault(true)).toEqual(`true`);
  expect(ToString.toStringDefault(undefined)).toBeFalsy();

  expect(ToString.toStringDefault({ size: 10 })).toEqual(`{"size":10}`);
});