// /* eslint-disable */
import * as IterableSync from '../IterableSync.js';
import { expect, test } from '@jest/globals';

test(`chunksOverlapping`, () => {
  const a = [1, 2, 3, 4, 5];
  
  const t1 = Array.from(IterableSync.chunksOverlapping(a, 2));
  expect(t1).toEqual([[1, 2], [2, 3], [3, 4], [4, 5]]);
  
  expect(() => Array.from(IterableSync.chunksOverlapping(a, 1))).toThrowError();
  
  const t3 = Array.from(IterableSync.chunksOverlapping(a, 3));
  expect(t3).toEqual([[1, 2, 3], [3, 4, 5]]);
  

  const b:number[] = [];
  const t4 = Array.from(IterableSync.chunksOverlapping(b, 2));
  expect(t4).toEqual([]);
  
});
