import { describe, expect, it } from 'vitest';
import { FrequencyByGroup } from '../src/frequency.js';

describe(`frequency`, () => {
  const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  it(`value`, () => {
    const groupBy = (v: number) => v.toString();
    const sub = [...FrequencyByGroup.entriesFromArray([1, 2, 3, 1, 2, 3, 0, 1, 1, 1, 4], groupBy)];
    expect(sub).toStrictEqual([[`1`, 5], [`2`, 2], [`3`, 2], [`0`, 1], [`4`, 1]]);
  });

  it(`string-key`, () => {
    const groupBy = (v: number) => v % 2 === 0 ? `even` : `odd`;
    const sub = FrequencyByGroup.fromArray(list, groupBy);

    expect(sub.get(`even`)).toEqual(5);
    expect(sub.get(`odd`)).toEqual(5);
    expect([...sub.keys()].length).toEqual(2);
  });

  it(`number-key`, () => {
    const groupBy = (v: number) => v % 2 === 0 ? 1 : 2;
    const sub = FrequencyByGroup.fromArray(list, groupBy);

    expect(sub.get(1)).toEqual(5);
    expect(sub.get(2)).toEqual(5);
    expect([...sub.keys()].length).toEqual(2);
  });

  it(`params`, () => {
    const groupByString = (v: number) => v % 2 === 0 ? `even` : `odd`;

    const groupByBadVoid = (_v: number) => {};
    const groupByBadNonString = (_v: number) => null;

    // Validity of groupBy
    // @ts-expect-error error checking
    expect(() => FrequencyByGroup.fromArray(null, list)).toThrow();
    // @ts-expect-error error checking
    expect(() => FrequencyByGroup.fromArray(undefined, list)).toThrow();
    // @ts-expect-error error checking
    expect(() => FrequencyByGroup.fromArray(groupByBadVoid, list)).toThrow();
    // @ts-expect-error error checking
    expect(() => FrequencyByGroup.fromArray(groupByBadNonString, list)).toThrow();

    // Validity of data
    // @ts-expect-error error checking
    expect(() => FrequencyByGroup.fromArray(groupByString, undefined)).toThrow();
    // @ts-expect-error error checking
    expect(() => FrequencyByGroup.fromArray(groupByString, `hello`)).toThrow();
  });
});