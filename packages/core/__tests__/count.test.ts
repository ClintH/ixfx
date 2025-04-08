import { test, expect } from 'vitest';
import { count, } from '../src/count.js';

test(`count`, (t) => {
  expect(() => [ ...count(0.5) ]).throws();
  expect(() => [ ...count(Number.NaN) ]).throws();

  expect([ ...count(5) ]).toEqual([ 0, 1, 2, 3, 4 ]);
  expect([ ...count(5, 5) ]).toEqual([ 5, 6, 7, 8, 9 ]);
  expect([ ...count(5, -5) ]).toEqual([ -5, -4, -3, -2, -1 ]);

  expect([ ...count(1) ]).toEqual([ 0 ]);
  expect([ ...count(0) ].length).toEqual(0);
  expect([ ...count(-5) ]).toEqual([ 0, -1, -2, -3, -4 ]);
  expect([ ...count(-5, 5) ]).toEqual([ 5, 4, 3, 2, 1 ]);
  expect([ ...count(-5, -5) ]).toEqual([ -5, -6, -7, -8, -9 ]);
});