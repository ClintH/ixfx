import { expect, test } from "vitest";
import * as Arrays from '../src/index.js';

test(`until`, () => {
  const data = [ 1, 2, 3, 4, 5 ];
  expect([ ...Arrays.until(data, v => v === 3) ]).toStrictEqual([ 1, 2 ]);

  expect([ ...Arrays.until(data, (v, accumulator) => [ accumulator >= 6, v + accumulator ], 0) ]).toStrictEqual([ 1, 2, 3 ]);
});