import { defaultComparer } from '@ixfx/core';
import { expect, it } from 'vitest';
import * as Sorted from '../src/sorted-array.js';

it(`index-of`, () => {
  const a1 = [1, 2, 2.5, 3, 4, 5];
  expect(Sorted.indexOf(a1, 1)).toBe(0);
  expect(Sorted.indexOf(a1, 3)).toBe(3);
  expect(Sorted.indexOf(a1, 5)).toBe(5);
  expect(Sorted.indexOf(a1, 0)).toBe(-1);
  expect(Sorted.indexOf(a1, 3.5)).toBe(-1);
  expect(Sorted.indexOf(a1, 6)).toBe(-1);
  expect(Sorted.indexOf(a1, 4)).toEqual(4);

  const a2 = [1, 2, 3, 3, 4, 5];
  expect(Sorted.indexOf(a2, 3)).toBe(2);
});

it(`wrap`, () => {
  const w = Sorted.wrapSorted([1, 2, 3, 4, 5, 6]);
  expect(w.at(0)).toEqual(1);
  expect(w.at(-1)).toEqual(6);
  expect(w.data).toEqual([1, 2, 3, 4, 5, 6]);
  expect(w.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  expect(w.indexOf(4)).toEqual(3);
  expect(w.length).toEqual(6);
  expect(w.insertionIndex(2.5)).toEqual(2);

  const w2 = w.insert(2.5);
  expect(w.toArray()).toEqual([1, 2, 3, 4, 5, 6]); // immutability
  expect(w2.toArray()).toEqual([1, 2, 2.5, 3, 4, 5, 6]);

  const w3 = w2.remove(4);
  expect(w.toArray()).toEqual([1, 2, 3, 4, 5, 6]); // immutability
  expect(w2.toArray()).toEqual([1, 2, 2.5, 3, 4, 5, 6]); // immutability
  expect(w3.toArray()).toEqual([1, 2, 2.5, 3, 5, 6]);
});

it(`insertionIndex`, () => {
  const array1 = [1, 2, 3, 4, 5];
  expect(Sorted.insertionIndex(array1, 0)).toBe(0);
  expect(Sorted.insertionIndex(array1, -10)).toBe(0);

  expect(Sorted.insertionIndex(array1, 1)).toBe(1);
  expect(Sorted.insertionIndex(array1, 3.5)).toBe(3);
  expect(Sorted.insertionIndex(array1, 4)).toBe(4);

  expect(Sorted.insertionIndex(array1, 10)).toBe(5);

  const array2 = [1, 2, 3, 4];
  expect(Sorted.insertionIndex(array2, 0)).toBe(0);
  expect(Sorted.insertionIndex(array2, 1)).toBe(1);
  expect(Sorted.insertionIndex(array2, 1.5)).toBe(1);
  expect(Sorted.insertionIndex(array2, 2)).toBe(2);
  expect(Sorted.insertionIndex(array2, 3)).toBe(3);
  expect(Sorted.insertionIndex(array2, 3.5)).toBe(3);
  expect(Sorted.insertionIndex(array2, 4)).toBe(4);
  expect(Sorted.insertionIndex(array2, 4.5)).toBe(4);
  expect(Sorted.insertionIndex(array2, 5)).toBe(4);

  const array3 = [2, 8, 16, 32];
  expect(Sorted.insertionIndex(array3, 0)).toBe(0);
  expect(Sorted.insertionIndex(array3, 1)).toBe(0);
  expect(Sorted.insertionIndex(array3, 2)).toBe(1);
  expect(Sorted.insertionIndex(array3, 3)).toBe(1);
  expect(Sorted.insertionIndex(array3, 8)).toBe(2);
  expect(Sorted.insertionIndex(array3, 9)).toBe(2);
  expect(Sorted.insertionIndex(array3, 32)).toBe(4);
  expect(Sorted.insertionIndex(array3, 320)).toBe(4);
});

it(`lowerBound`, () => {
  const array2 = [2, 8, 16, 32];
  expect(Sorted.lowerBound(array2, 0)).toBe(0);
  expect(Sorted.lowerBound(array2, 1)).toBe(0);
  expect(Sorted.lowerBound(array2, 2)).toBe(0);
  expect(Sorted.lowerBound(array2, 3)).toBe(1);
  expect(Sorted.lowerBound(array2, 8)).toBe(1);
  expect(Sorted.lowerBound(array2, 9)).toBe(2);
  expect(Sorted.lowerBound(array2, 32)).toBe(3);
  expect(Sorted.lowerBound(array2, 320)).toBe(4);
});

it(`upperBound`, () => {
  const array2 = [2, 8, 16, 32];
  expect(Sorted.upperBound(array2, 0)).toBe(0);
  expect(Sorted.upperBound(array2, 1)).toBe(0);
  expect(Sorted.upperBound(array2, 2)).toBe(1);
  expect(Sorted.upperBound(array2, 3)).toBe(1);
  expect(Sorted.upperBound(array2, 8)).toBe(2);
  expect(Sorted.upperBound(array2, 9)).toBe(2);
  expect(Sorted.upperBound(array2, 32)).toBe(4);
  expect(Sorted.upperBound(array2, 320)).toBe(4);
});

it(`matchingRange`, () => {
  const a1 = [2, 8, 16, 32];
  expect(Sorted.matchingRange(a1, 0)).toBeUndefined();
  expect(Sorted.matchingRange(a1, 1)).toBeUndefined();
  expect(Sorted.matchingRange(a1, 2)).toEqual({ startIndex: 0, endIndex: 0 });
  expect(Sorted.matchingRange(a1, 3)).toBeUndefined();
  expect(Sorted.matchingRange(a1, 8)).toEqual({ startIndex: 1, endIndex: 1 });
  expect(Sorted.matchingRange(a1, 9)).toBeUndefined();
  expect(Sorted.matchingRange(a1, 32)).toEqual({ startIndex: 3, endIndex: 3 });
  expect(Sorted.matchingRange(a1, 320)).toBeUndefined();

  const a2 = [2, 8, 8, 8, 16, 32];
  expect(Sorted.matchingRange(a2, 8)).toEqual({ startIndex: 1, endIndex: 3 });

  const a3 = [2, 8, 16, 32, 32, 32];
  expect(Sorted.matchingRange(a3, 32)).toEqual({ startIndex: 3, endIndex: 5 });

  const a4 = [2, 2, 2, 8, 16, 32];
  expect(Sorted.matchingRange(a4, 2)).toEqual({ startIndex: 0, endIndex: 2 });
});

it(`insert`, () => {
  const array1 = [1, 2, 3, 4, 5];
  expect(Sorted.insert(array1, 0)).toEqual([0, 1, 2, 3, 4, 5]);
  expect(Sorted.insert(array1, 1.5)).toEqual([1, 1.5, 2, 3, 4, 5]);
  expect(Sorted.insert(array1, 3)).toEqual([1, 2, 3, 3, 4, 5]);
  expect(Sorted.insert(array1, -10)).toEqual([-10, 1, 2, 3, 4, 5]);
  expect(Sorted.insert(array1, 6)).toEqual([1, 2, 3, 4, 5, 6]);
  expect(Sorted.insert(array1, 50)).toEqual([1, 2, 3, 4, 5, 50]);
});

it(`remove`, () => {
  const array1 = [1, 2, 3, 4, 5];
  expect(Sorted.remove(array1, 3)).toEqual([1, 2, 4, 5]);
  expect(Sorted.remove(array1, 0)).toEqual([1, 2, 3, 4, 5]);
  expect(Sorted.remove(array1, 1)).toEqual([2, 3, 4, 5]);
  expect(Sorted.remove(array1, 5)).toEqual([1, 2, 3, 4]);
  expect(Sorted.remove(array1, 3.5)).toEqual([1, 2, 3, 4, 5]);
  expect(Sorted.remove(array1, 50)).toEqual([1, 2, 3, 4, 5]);

  const array2 = [3];
  expect(Sorted.remove(array2, 0)).toEqual([3]);
  expect(Sorted.remove(array2, 3)).toEqual([]);

  expect(defaultComparer(2.5, 2)).toEqual(1);
  expect(defaultComparer(2, 2)).toEqual(0);
  expect(defaultComparer(2, 2.5)).toEqual(-1);

  expect(Sorted.remove([1, 2, 2.5, 3, 4, 5, 6], 4)).toEqual([1, 2, 2.5, 3, 5, 6]);

  const a3 = [1, 2, 3, 3, 3, 5, 6];
  expect(Sorted.remove(a3, 3)).toEqual([1, 2, 5, 6]);
});

it(`merge`, () => {
  const a = [4, 7, 10];
  const b = [1, 2, 9, 11];
  expect(Sorted.merge(a, b)).toEqual([1, 2, 4, 7, 9, 10, 11]);

  expect(Sorted.merge([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6]);
  expect(Sorted.merge([4, 5, 6], [1, 2, 3])).toEqual([1, 2, 3, 4, 5, 6]);
  expect(Sorted.merge([1, 2, 3], [1, 2, 3])).toEqual([1, 1, 2, 2, 3, 3]);
});

it(`sort-merge`, () => {
  expect(Sorted.sort([10, 2, 5, 9])).toEqual([2, 5, 9, 10]);
  expect(Sorted.sort([10, 2, 5, 9], `merge`)).toEqual([2, 5, 9, 10]);

  const rev = (a: number, b: number): number => {
    if (a === b)
      return 0;
    if (a > b)
      return -1;
    return 1;
  };
  expect(Sorted.sort([10, 2, 5, 9], `default`, rev)).toEqual([10, 9, 5, 2]);
  expect(Sorted.sort([10, 2, 5, 9], `merge`, rev)).toEqual([10, 9, 5, 2]);
});