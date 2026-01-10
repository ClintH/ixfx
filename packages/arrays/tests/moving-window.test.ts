
import { test, expect, assert } from 'vitest';
import * as Arrays from '../src/index.js';

test(`basic`, () => {
  const w1 = Arrays.movingWindow(3);
  expect(w1(1)).toEqual([ 1 ]);
  expect(w1(2)).toEqual([ 1, 2 ]);
  expect(w1(3)).toEqual([ 1, 2, 3 ]);
  expect(w1(4)).toEqual([ 2, 3, 4 ]);
  expect(w1(5)).toEqual([ 3, 4, 5 ]);
});

test(`allow`, () => {
  const w1 = Arrays.movingWindow<number>({
    samples: 3,
    allow: (value) => value % 2 === 0,
  });

  expect(w1(1)).toEqual([]);
  expect(w1(2)).toEqual([ 2 ]);
  expect(w1(3)).toEqual([ 2, ]);
  expect(w1(4)).toEqual([ 2, 4 ]);
  expect(w1(5)).toEqual([ 2, 4 ]);
  expect(w1(6)).toEqual([ 2, 4, 6 ]);
});

test(`reject`, () => {
  const w1 = Arrays.movingWindow<number>({
    samples: 3,
    reject: (value) => value % 2 !== 0,
  });

  expect(w1(1)).toEqual([]);
  expect(w1(2)).toEqual([ 2 ]);
  expect(w1(3)).toEqual([ 2, ]);
  expect(w1(4)).toEqual([ 2, 4 ]);
  expect(w1(5)).toEqual([ 2, 4 ]);
  expect(w1(6)).toEqual([ 2, 4, 6 ]);
});

test(`both`, () => {
  const w1 = Arrays.movingWindow<number>({
    samples: 3,
    reject: (value) => Number.isNaN(value),
    allow: (value) => value % 2 === 0,

  });

  expect(w1(1)).toEqual([]);
  expect(w1(2)).toEqual([ 2 ]);
  expect(w1(Number.NaN)).toEqual([ 2, ]);
  expect(w1(3)).toEqual([ 2, ]);
  expect(w1(4)).toEqual([ 2, 4 ]);
  expect(w1(Number.NaN)).toEqual([ 2, 4 ]);
  expect(w1(5)).toEqual([ 2, 4 ]);
  expect(w1(6)).toEqual([ 2, 4, 6 ]);
});