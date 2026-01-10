/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect, assert } from 'vitest';
import * as Arrays from '../src/index.js';

test(`cycle`, () => {
  const c1 = Arrays.cycle(`apples oranges pears`.split(` `));
  expect(c1.toArray()).toStrictEqual([ `apples`, `oranges`, `pears` ]);
  expect(c1.current).toEqual(`apples`);

  expect(c1.next()).toEqual(`oranges`);
  expect(c1.current).toEqual(`oranges`);

  expect(c1.next()).toEqual(`pears`);
  expect(c1.current).toEqual(`pears`);

  expect(c1.next()).toEqual(`apples`);
  expect(c1.current).toEqual(`apples`);

  expect(c1.prev()).toEqual(`pears`);
  expect(c1.current).toEqual(`pears`);

  c1.select(`oranges`);
  expect(c1.current).toBe(`oranges`);

  c1.select(0);
  expect(c1.current).toBe(`apples`);

  // @ts-expect-error
  expect(() => Arrays.cycle({ hello: `there` })).toThrow();
  // @ts-expect-error
  expect(() => Arrays.cycle(false)).toThrow();


});