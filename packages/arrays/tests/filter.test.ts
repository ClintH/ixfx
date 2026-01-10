import { test, expect } from 'vitest';
import * as Arrays from '../src/index.js';

test(`filter`, () => {
  const numbers = `1 2 3 4 5 6 7 8 9 10`.split(` `).map(v => Number.parseInt(v));

  const [ a, b ] = Arrays.filterAB(numbers, v => v % 2 === 0);

  expect(a.join(` `)).toEqual(`2 4 6 8 10`);
  expect(b.join(` `)).toEqual(`1 3 5 7 9`);
})