import { test, expect } from 'vitest';
import * as Sorted from '../src/sorted-array.js';
import { defaultComparer } from '@ixfx/core';

test(`index-of`, () => {
  const array1 = [ 1, 2, 2.5, 3, 4, 5 ];
  expect(Sorted.indexOf(array1, 1)).toBe(0);
  expect(Sorted.indexOf(array1, 3)).toBe(3);
  expect(Sorted.indexOf(array1, 5)).toBe(5);
  expect(Sorted.indexOf(array1, 0)).toBe(-1);
  expect(Sorted.indexOf(array1, 3.5)).toBe(-1);
  expect(Sorted.indexOf(array1, 6)).toBe(-1);
  expect(Sorted.indexOf(array1, 4)).toEqual(4);

});

test(`wrap`, () => {
  const w = Sorted.wrapSorted([ 1, 2, 3, 4, 5, 6 ]);
  expect(w.at(0)).toEqual(1);
  expect(w.at(-1)).toEqual(6);
  expect(w.data).toEqual([ 1, 2, 3, 4, 5, 6 ]);
  expect(w.toArray()).toEqual([ 1, 2, 3, 4, 5, 6 ]);
  expect(w.indexOf(4)).toEqual(3);
  expect(w.length).toEqual(6);
  expect(w.insertionIndex(2.5)).toEqual(2);

  const w2 = w.insert(2.5);
  expect(w.toArray()).toEqual([ 1, 2, 3, 4, 5, 6 ]); // immutability
  expect(w2.toArray()).toEqual([ 1, 2, 2.5, 3, 4, 5, 6 ]);

  const w3 = w2.remove(4);
  expect(w.toArray()).toEqual([ 1, 2, 3, 4, 5, 6 ]); // immutability
  expect(w2.toArray()).toEqual([ 1, 2, 2.5, 3, 4, 5, 6 ]); // immutability
  expect(w3.toArray()).toEqual([ 1, 2, 2.5, 3, 5, 6 ]);

});

test(`insertionIndex`, () => {
  const array1 = [ 1, 2, 3, 4, 5 ];
  expect(Sorted.insertionIndex(array1, 0)).toBe(0);
  expect(Sorted.insertionIndex(array1, -10)).toBe(0);

  expect(Sorted.insertionIndex(array1, 1)).toBe(1);
  expect(Sorted.insertionIndex(array1, 3.5)).toBe(3);
  expect(Sorted.insertionIndex(array1, 4)).toBe(4);

  expect(Sorted.insertionIndex(array1, 10)).toBe(5);
});

test(`insert`, () => {
  const array1 = [ 1, 2, 3, 4, 5 ];
  expect(Sorted.insert(array1, 0)).toEqual([ 0, 1, 2, 3, 4, 5 ]);
  expect(Sorted.insert(array1, 1.5)).toEqual([ 1, 1.5, 2, 3, 4, 5 ]);
  expect(Sorted.insert(array1, 3)).toEqual([ 1, 2, 3, 3, 4, 5 ]);
  expect(Sorted.insert(array1, -10)).toEqual([ -10, 1, 2, 3, 4, 5 ]);
  expect(Sorted.insert(array1, 6)).toEqual([ 1, 2, 3, 4, 5, 6 ]);
  expect(Sorted.insert(array1, 50)).toEqual([ 1, 2, 3, 4, 5, 50 ]);
});

test(`remove`, () => {
  const array1 = [ 1, 2, 3, 4, 5 ];
  expect(Sorted.remove(array1, 3)).toEqual([ 1, 2, 4, 5 ]);
  expect(Sorted.remove(array1, 0)).toEqual([ 1, 2, 3, 4, 5 ]);
  expect(Sorted.remove(array1, 1)).toEqual([ 2, 3, 4, 5 ]);
  expect(Sorted.remove(array1, 5)).toEqual([ 1, 2, 3, 4 ]);
  expect(Sorted.remove(array1, 3.5)).toEqual([ 1, 2, 3, 4, 5 ]);
  expect(Sorted.remove(array1, 50)).toEqual([ 1, 2, 3, 4, 5 ]);

  const array2 = [ 3 ];
  expect(Sorted.remove(array2, 0)).toEqual([ 3 ]);
  expect(Sorted.remove(array2, 3)).toEqual([]);

  expect(defaultComparer(2.5, 2)).toEqual(1);
  expect(defaultComparer(2, 2)).toEqual(0);
  expect(defaultComparer(2, 2.5)).toEqual(-1);

  expect(Sorted.remove([ 1, 2, 2.5, 3, 4, 5, 6 ], 4)).toEqual([ 1, 2, 2.5, 3, 5, 6 ])

});

test(`merge`, () => {
  const a = [ 4, 7, 10 ]
  const b = [ 1, 2, 9, 11 ]
  expect(Sorted.merge(a, b)).toEqual([ 1, 2, 4, 7, 9, 10, 11 ]);

  expect(Sorted.merge([ 1, 2, 3 ], [ 4, 5, 6 ])).toEqual([ 1, 2, 3, 4, 5, 6 ]);
  expect(Sorted.merge([ 4, 5, 6 ], [ 1, 2, 3 ])).toEqual([ 1, 2, 3, 4, 5, 6 ]);
  expect(Sorted.merge([ 1, 2, 3 ], [ 1, 2, 3 ])).toEqual([ 1, 1, 2, 2, 3, 3 ]);
});

test(`sort-merge`, () => {
  expect(Sorted.sort([ 10, 2, 5, 9 ])).toEqual([ 2, 5, 9, 10 ]);
  expect(Sorted.sort([ 10, 2, 5, 9 ], `merge`)).toEqual([ 2, 5, 9, 10 ]);

  const rev = (a: number, b: number): number => {
    if (a === b) return 0;
    if (a > b) return -1;
    return 1;
  }
  expect(Sorted.sort([ 10, 2, 5, 9 ], `default`, rev)).toEqual([ 10, 9, 5, 2 ]);
  expect(Sorted.sort([ 10, 2, 5, 9 ], `merge`, rev)).toEqual([ 10, 9, 5, 2 ]);


});