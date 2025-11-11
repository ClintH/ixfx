import { expect, describe, test } from 'vitest';
import * as N from '../src/index.js';

test(`flip`, () => {
  expect(N.flip(1)).toEqual(0);
  expect(N.flip(0.5)).toEqual(0.5);
  expect(N.flip(0.75)).toEqual(0.25);
  expect(N.flip(0)).toEqual(1);
});

test(`iqr`, () => {
  //expect(N.interquartileRange([ 1, 19, 7, 6, 5, 9, 12, 27, 18, 2, 15 ])).toEqual(13);

  //https://www.geeksforgeeks.org/dsa/interquartile-range-iqr/
  const d0 = [ 1, 19, 7, 6, 5, 9, 12, 27, 18, 2, 15 ];
  expect(N.getQuantile(d0, 0.25)).toEqual(5.5);
  expect(N.getQuantile(d0, 0.75)).toEqual(16.5);
  expect(N.interquartileRange(d0)).toEqual(11);

  // https://en.wikipedia.org/wiki/Interquartile_range
  const d1 = [ 7, 7, 31, 31, 47, 75, 87, 115, 116, 119, 119, 155, 177 ];
  const d1Alt = [ 31, 7, 115, 7, 31, 47, 75, 155, 87, 177, 116, 119, 119 ]
  expect(N.getQuantile(d1, 0.25)).toEqual(31);
  expect(N.getQuantile(d1Alt, 0.25)).toEqual(31);

  expect(N.getQuantile(d1, 0.75)).toEqual(119);
  expect(N.getQuantile(d1Alt, 0.75)).toEqual(119);

  expect(N.interquartileRange(d1)).toEqual(88);
  expect(N.interquartileRange(d1Alt)).toEqual(88);

})