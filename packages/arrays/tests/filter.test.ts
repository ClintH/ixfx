import { expect, it } from 'vitest';
import * as Arrays from '../src/index.js';

it(`filter`, () => {
  const numbers = `1 2 3 4 5 6 7 8 9 10`.split(` `).map(v => Number.parseInt(v));

  const [a, b] = Arrays.filterAB(numbers, v => v % 2 === 0);

  expect(a.join(` `)).toEqual(`2 4 6 8 10`);
  expect(b.join(` `)).toEqual(`1 3 5 7 9`);
});

it(`find-index`, () => {
  //              0      1       2      3      4
  const data = [`red`, `blue`, `red`, `blue`, `red`];
  expect(Arrays.findIndex(data, v => v === `red`)).toBe(0);
  expect(Arrays.findIndex(data, v => v === `red`, 1)).toBe(2);
  expect(Arrays.findIndex(data, v => v === `red`, 2)).toBe(2);
  expect(Arrays.findIndex(data, v => v === `red`, 3)).toBe(4);
  expect(Arrays.findIndex(data, v => v === `red`, 4)).toBe(4);
  expect(() => Arrays.findIndex(data, v => v === `red`, 5)).toThrow();
  expect(() => Arrays.findIndex(data, v => v === `red`, 5, 2)).toThrow();

  //              0    1    2    3    4
  const data2 = [`a`, `b`, `c`, `d`, `e`];
  expect(Arrays.findIndex(data2, v => v === `e`, 1, 1)).toBe(-1);
  expect(Arrays.findIndex(data2, v => v === `e`, 1, 2)).toBe(-1);
  expect(Arrays.findIndex(data2, v => v === `e`, 1, 5)).toBe(4);
});

it(`find-index-reverse`, () => {
  //              0      1       2      3      4
  const data = [`red`, `blue`, `red`, `blue`, `red`];
  expect(Arrays.findIndexReverse(data, v => v === `red`)).toBe(4);
  expect(Arrays.findIndexReverse(data, v => v === `red`, 1)).toBe(0);
  expect(Arrays.findIndexReverse(data, v => v === `red`, 2)).toBe(2);
  expect(Arrays.findIndexReverse(data, v => v === `red`, 3)).toBe(2);
  expect(Arrays.findIndexReverse(data, v => v === `red`, 4)).toBe(4);

  //              0    1    2    3    4
  const data2 = [`a`, `b`, `c`, `d`, `e`];
  expect(Arrays.findIndexReverse(data2, v => v === `a`)).toBe(0);
  expect(Arrays.findIndexReverse(data2, v => v === `a`, data2.length - 1)).toBe(0);

  expect(Arrays.findIndexReverse(data2, v => v === `a`, data2.length - 1, 1)).toBe(-1);
  expect(Arrays.findIndexReverse(data2, v => v === `a`, data2.length - 1, 0)).toBe(0);
});