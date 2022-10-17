/* eslint-disable */
import { expect, test } from '@jest/globals';
import {sortByNumericProperty,reducePairwise,mergeByKey,zip,areValuesIdentical,ensureLength,remove} from '../../collections/Arrays.js';

test(`array-sort`, () => {
  const data = [ { size: 10, colour: `red` }, { size: 20, colour: `blue` }, { size: 5, colour: `pink` }, { size: 10, colour: `orange`}];

  const t1 = sortByNumericProperty(data, `size`);
console.log(t1);
  expect(t1).toEqual([
    { size: 5, colour: `pink` },
     { size: 10, colour: `red` },
     { size: 10, colour: `orange`},
      { size: 20, colour: `blue` }])

});

test(`array-reducePairwise`, () => {

  const reducer = (acc:string, a:string, b:string) => {
    return acc + `[${a}-${b}]`;
  };

  const t1 = reducePairwise(`a b c d e f g`.split(` `), reducer, `!`);
  expect(t1).toEqual(`![a-b][b-c][c-d][d-e][e-f][f-g]`);

  const t2 = reducePairwise(`a b c d e f`.split(` `), reducer, `!`);
  expect(t2).toEqual(`![a-b][b-c][c-d][d-e][e-f]`);
  
  const t3 = reducePairwise([], reducer, `!`);
  expect(t3).toEqual(`!`);
  
  const t4 = reducePairwise([`a`], reducer, `!`);
  expect(t4).toEqual(`!`);
  
  // @ts-ignore
  expect(() => reducePairwise(`hello`, reducer, ``)).toThrow();

});

test(`array-mergeByKey`, () => {
  const a1 = [`1-1`,`1-2`,`1-3`,`1-4`];
  const a2 = [`2-1`,`2-2`,`2-3`,`2-5`];

  const keyFn = (v:string) => v.substr(-1,1);
  const reconcileFn = (a:string, b:string) => {
    return b.replace(`-`, `!`);
  };

  const t1 = mergeByKey(keyFn,reconcileFn, a1, a2);

  expect(t1.length).toEqual(5);
  expect(t1).toContainEqual(`2!1`);
  expect(t1).toContainEqual(`2!2`);
  expect(t1).toContainEqual(`2!3`);
  expect(t1).toContainEqual(`1-4`);
  expect(t1).toContainEqual(`2-5`);

  // Test with empty second param
  const a4:string[] = [];
  const t2 = mergeByKey(keyFn, reconcileFn, a1, a4);
  expect(t2.length).toEqual(4);
  expect(t2).toContainEqual(`1-1`);
  expect(t2).toContainEqual(`1-2`);
  expect(t2).toContainEqual(`1-3`);
  expect(t2).toContainEqual(`1-4`);

  // Test with empty first param
  const t3 = mergeByKey(keyFn, reconcileFn, a4, a1);
  expect(t3.length).toEqual(4);
  expect(t3).toContainEqual(`1-1`);
  expect(t3).toContainEqual(`1-2`);
  expect(t3).toContainEqual(`1-3`);
  expect(t3).toContainEqual(`1-4`);
});

test(`remove`, () => {
  expect(remove([1,2,3], 2)).toEqual([1,2]);
  expect(remove([1,2,3], 0)).toEqual([2,3]);
  expect(remove([1,2,3], 1)).toEqual([1,3]);

  // Index past length
  expect(() => remove([1,2,3], 3)).toThrow();
  // Not an array
  // @ts-ignore
  expect(() => remove(10, 3)).toThrow();

});

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