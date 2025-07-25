import { test, expect } from 'vitest';
import * as Arrays from '../src/index.js';

test(`group-by`, () => {
  const numbers = `1 2 3 4 5 6 7 8 9 10`.split(` `).map(v => Number.parseInt(v));

  const oddEven = [ ...Arrays.groupBy(numbers, v => v % 2 === 0).entries() ];
  expect(oddEven).toStrictEqual([
    [ false, [ 1, 3, 5, 7, 9 ] ],
    [ true, [ 2, 4, 6, 8, 10 ] ],
  ]
  )
})