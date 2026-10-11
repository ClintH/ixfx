import { expect, it } from 'vitest';
import { zip } from '../src/util/zip.js';

it(`zips same-length arrays into tuples`, () => {
  expect(zip([1, 2, 3], [`a`, `b`, `c`])).toEqual([
    [1, `a`],
    [2, `b`],
    [3, `c`],
  ]);
});

it(`longer arrays are truncated to the first array's length`, () => {
  // Implementation iterates by the first array's length only
  expect(zip([1, 2], [`a`, `b`, `c`, `d`])).toEqual([
    [1, `a`],
    [2, `b`],
  ]);
  expect(zip([1, 2, 3], [`a`])).toEqual([
    [1, `a`],
    [2, undefined],
    [3, undefined],
  ]);
});

it(`non-array parameters throw`, () => {
  expect(() => zip([1] as any, `hello` as any)).toThrow(`All parameters must be an array`);
});

it(`empty arrays yield nothing`, () => {
  expect(zip([], [])).toEqual([]);
});
