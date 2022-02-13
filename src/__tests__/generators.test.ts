/* eslint-disable */

import {count} from '../Generators.js';

test(`count`, () => {
  expect(() => [...count(0.5)]).toThrow();
  expect(() => [...count(Number.NaN)]).toThrow();

  expect([...count(5)]).toEqual([0,1,2,3,4]);
  expect([...count(5, 5)]).toEqual([5,6,7,8,9]);
  expect([...count(5, -5)]).toEqual([-5,-4,-3,-2,-1]);
 
  expect([...count(1)]).toEqual([0]);
  expect([...count(0)]).toEqual([]);
  expect([...count(-5)]).toEqual([0,-1,-2,-3,-4]);
  expect([...count(-5, 5)]).toEqual([5,4,3,2,1]);
  expect([...count(-5, -5)]).toEqual([-5,-6,-7,-8,-9]);



});
