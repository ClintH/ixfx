/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect, describe } from 'vitest';
import * as Arrays from '../src/index.js';

describe(`sample`, () => {
  test(`percentage`, () => {
    const list = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    const sub = Arrays.sample(list, 0.5);
    expect(sub).toEqual([ 2, 4, 6, 8, 10 ]);
  });

  test(`nth`, () => {
    const list = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    const sub = Arrays.sample(list, 3);
    expect(sub).toEqual([ 3, 6, 9 ]);
  });

  test(`params`, () => {
    // Throw if non-array
    // @ts-expect-error
    expect(() => Arrays.sample(null, 2)).toThrow();
    // Throw if steps exceeds size of array
    expect(() => Arrays.sample([ 1, 2, 3 ], 4)).toThrow();
    // Throw if floating point
    expect(() => Arrays.sample([ 1, 2, 3 ], 2.5)).toThrow();
    // Throw if amount is NaN
    // @ts-expect-error
    expect(() => Arrays.sample([ 1, 2, 3 ], undefined)).toThrow();
    expect(() => Arrays.sample([ 1, 2, 3 ], Number.NaN)).toThrow();


  });

})