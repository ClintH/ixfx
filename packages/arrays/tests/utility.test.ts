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
  // chance <= 0 returns min, chance > 1 returns max. Neither consumes the
  // random source - asserted by passing a source that throws if called.
  const never = () => {
    throw new Error(`Random source should not be called`);
  };
  expect(R.randomChanceInteger(0, 20, 10, never)).toBe(10);
  expect(R.randomChanceInteger(1.1, 20, 10, never)).toBe(20);

  // Deterministic: inject a cyclic source. First value is the chance check;
  // if it passes, a second value picks the integer: floor(v * 11) + 10.
  const values = [0.05, 0.99, 0.95, 0.5, 0.5, 0.0];
  let pointer = 0;
  const source = () => {
    const v = values[pointer % values.length];
    pointer++;
    return v;
  };
  // 0.05 <= 0.5 → floor(0.99 * 11) + 10 = 20
  expect(R.randomChanceInteger(0.5, 20, 10, source)).toBe(20);
  // 0.95 > 0.5 → min (no second value consumed)
  expect(R.randomChanceInteger(0.5, 20, 10, source)).toBe(10);
  // 0.5 <= 0.5 → floor(0.5 * 11) + 10 = 15
  expect(R.randomChanceInteger(0.5, 20, 10, source)).toBe(15);
  // 0.0 <= 0.5 → floor(0.05 * 11) + 10 = 10 (wraps to first value)
  expect(R.randomChanceInteger(0.5, 20, 10, source)).toBe(10);

  // Statistical checks with default source. Expected relative frequency of
  // `min` is ~0.545 and ~0.909 respectively. Bounds sit ~4-5 standard
  // deviations below expected (n = 1000), loose enough to be deterministic
  // in practice while still catching gross errors.
  const N = 1000;
  const resultsGrouped1 = FrequencyByGroup.fromArray(collect(N, () => R.randomChanceInteger(0.5, 20, 10)));
  expect(resultsGrouped1.getRelative(`10`)).toBeGreaterThanOrEqual(0.47);

  const resultsGrouped2 = FrequencyByGroup.fromArray(collect(N, () => R.randomChanceInteger(0.1, 20, 10)));
  expect(resultsGrouped2.getRelative(`10`)).toBeGreaterThanOrEqual(0.86);
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