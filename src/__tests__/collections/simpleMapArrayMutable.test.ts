/// <reference types="jest-extended" />
/* eslint-disable */
// @ts-nocheck
import { expect, test, describe } from '@jest/globals';
import {jest} from '@jest/globals'
import {simpleMapArrayMutable} from '../../collections/SimpleMapArray.js';

test(`simpleMapArrayMutable`, () => {
 
  const m1 = simpleMapArrayMutable<string>();
  expect([...m1.keys()].length === 0);
  expect([...m1.values()].length === 0);
  expect([...m1.entries()].length === 0);
  
  const m2 = simpleMapArrayMutable<string>();
  m2.add(`name`, `jane`, `jill`, `joe`, `jack`);
  m2.add(`colours`, `red`, `blue`, `yellow`);
  
  expect([...m2.keys()].length === 2);
  expect([...m2.get(`name`)]).toEqual([`jane`, `jill`, `joe`, `jack`]);
  expect([...m2.get(`colours`)]).toEqual([`red`, `blue`, `yellow`]);
  expect([...m2.entries()]).toEqual([
    [`name`, `jane`], [`name`, `jill`], [`name`, `joe`], [`name`, `jack`],
    [`colours`, `red`], [`colours`, `blue`], [`colours`, `yellow`]
  ]);

  expect([...m2.get(`notfound`)].length === 0);

});
