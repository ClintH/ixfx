/* eslint-disable @typescript-eslint/ban-ts-comment */

import { test, expect, describe } from 'vitest';
import * as Arrays from '../src/index.js';

describe(`frequency`, () => {
  test(`string-key`, () => {
    const list = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    const groupBy = v => v % 2 === 0 ? `even` : `odd`;
    const sub = Arrays.frequencyByGroup(groupBy, list);

    expect(sub.get(`even`)).toEqual(5);
    expect(sub.get(`odd`)).toEqual(5);
    expect([ ...sub.keys() ].length).toEqual(2);
  });

  test(`number-key`, () => {
    const list = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    const groupBy = v => v % 2 === 0 ? 1 : 2;
    const sub = Arrays.frequencyByGroup(groupBy, list);

    expect(sub.get(1)).toEqual(5);
    expect(sub.get(2)).toEqual(5);
    expect([ ...sub.keys() ].length).toEqual(2);
  });

  test(`params`, () => {
    const groupByString = v => v % 2 === 0 ? `even` : `odd`;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const groupByBadVoid = v => {};
    const groupByBadNonString = v => null;

    const data = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

    // Validity of groupBy
    // @ts-expect-error
    expect(() => Arrays.frequencyByGroup(null, data)).toThrow();
    // @ts-expect-error
    expect(() => Arrays.frequencyByGroup(undefined, data)).toThrow();
    // @ts-expect-error
    expect(() => Arrays.frequencyByGroup(groupByBadVoid, data)).toThrow();
    // @ts-expect-error
    expect(() => Arrays.frequencyByGroup(groupByBadNonString, data)).toThrow();

    // Validity of data
    // @ts-expect-error
    expect(() => Arrays.frequencyByGroup(groupByString, undefined)).toThrow();
    // @ts-expect-error
    expect(() => Arrays.frequencyByGroup(groupByString, `hello`)).toThrow();

  });

})