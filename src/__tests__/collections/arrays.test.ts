/* eslint-disable */
import {zip,areValuesIdentical,ensureLength} from '../../collections/Arrays.js';

test(`ensureLength`, () => {
  expect(ensureLength([1,2,3], 2)).toEqual([1,2]);
  expect(ensureLength([1,2,3], 3)).toEqual([1,2,3]);
  expect(ensureLength([1,2,3], 5, `undefined`)).toEqual([1,2,3,undefined,undefined]);
  expect(ensureLength([1,2,3], 5, `repeat`)).toEqual([1,2,3,1,2]);
  expect(ensureLength([1,2,3], 7, `repeat`)).toEqual([1,2,3,1,2,3,1]);

  expect(ensureLength([1,2,3], 5, `first`)).toEqual([1,2,3,1,1]);
  expect(ensureLength([1,2,3], 5, `last`)).toEqual([1,2,3,3,3]);
});

test(`areValuesIdentical`, () => {
  const a = [10,10,10];
  const b = [`hello`, `hello`, `hello`];
  const c = [true, true, true];
  const d = [100];

  expect(areValuesIdentical(a)).toBeTruthy();
  expect(areValuesIdentical(b)).toBeTruthy();
  expect(areValuesIdentical(c)).toBeTruthy();
  expect(areValuesIdentical(d)).toBeTruthy();

  const a1 = [10,10,11];
  const b1 = [`Hello`, `hello`];
  const c1 = [true, false];
  expect(areValuesIdentical(a1)).toBeFalsy();
  expect(areValuesIdentical(b1)).toBeFalsy();
  expect(areValuesIdentical(c1)).toBeFalsy();

});

// test(``, () => {
//   const a1 = [10, 11, 12, 13];
//   const a2 = [10, 11, 12, 13];
//   const b1 = [`apples`, `oranges`, `pears`, `grapes`];
//   const b2 = [`apples`, `oranges`, `pears`, `grapes`];
//   const c1 = [true, false, true, false];
//   const c2 = [true, false, true, false];

// });


test(`zip`, () => {
  const a = [10, 11, 12, 13];
  const b = [`apples`, `oranges`, `pears`, `grapes`];
  const c = [true, false, true, false];

  expect(zip(a)).toEqual([
    [10], [11], [12], [13]
  ]);
  expect(zip(a, b, c)).toEqual([
    [10, `apples`, true],
    [11, `oranges`, false],
    [12, `pears`, true],
    [13, `grapes`, false]
  ]);

  // Throw if sizes are different
  const d = [100, 200, 300];
  expect(() => zip(a, d)).toThrow();

  // Throw if not array
  expect(() => zip(a, `potato`)).toThrow();
  expect( () => zip(undefined)).toThrow();
  expect( () => zip(`hello`)).toThrow();

});