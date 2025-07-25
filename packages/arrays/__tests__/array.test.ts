/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect, assert } from 'vitest';
import * as Arrays from '../src/index.js';
import { mergeByKey } from '../src/merge-by-key.js';

test(`at-wrap`, () => {
  const array = [ 1, 2, 3 ];
  expect(Arrays.atWrap(array, 0)).toBe(1);
  expect(Arrays.atWrap(array, 1)).toBe(2);
  expect(Arrays.atWrap(array, 2)).toBe(3);
  expect(Arrays.atWrap(array, 3)).toBe(1);
  expect(Arrays.atWrap(array, 4)).toBe(2);
  expect(Arrays.atWrap(array, 5)).toBe(3);
  expect(Arrays.atWrap(array, 6)).toBe(1);
  expect(Arrays.atWrap(array, 7)).toBe(2);

  expect(Arrays.atWrap(array, -1)).toBe(3);
  expect(Arrays.atWrap(array, -2)).toBe(2);
  expect(Arrays.atWrap(array, -3)).toBe(1);
  expect(Arrays.atWrap(array, -4)).toBe(3);

});

test(`insert`, () => {
  const v1 = [ 1, 2, 3 ]
  expect(Arrays.insertAt(v1, 1, 20, 30, 40)).toEqual([
    1, 20, 30, 40, 2, 3
  ]);
  expect(Arrays.insertAt(v1, 0, 20, 30, 40)).toEqual([
    20, 30, 40, 1, 2, 3
  ]);
  expect(Arrays.insertAt(v1, 2, 20, 30, 40)).toEqual([
    1, 2, 3, 20, 30, 40
  ]);

  // Verify immutability
  expect(v1).toStrictEqual([ 1, 2, 3 ]);

  // @ts-expect-error
  expect(() => Arrays.insertAt({ blah: true }, 0, 1, 2, 3)).toThrow();
  expect(() => Arrays.insertAt(v1, -1, 1, 2, 3)).toThrow();
  expect(() => Arrays.insertAt(v1, 3, 1, 2, 3)).toThrow();
});

test(`intersection`, () => {
  expect(Arrays.intersection([ 1, 2, 3 ], [ 2, 4, 6 ])).toEqual([ 2 ]);
  expect(Arrays.intersection([ 1, 2, 3 ], [ 5 ])).toEqual([]);
  expect(Arrays.intersection([ 1, 2, 3 ], [ 3, 2, 1 ])).toEqual([ 1, 2, 3 ]);


});

test(`interleave`, () => {
  const a = [ `a`, `b`, `c` ];
  const b = [ `1`, `2`, `3` ];
  expect(Arrays.interleave(a, b)).toEqual([ `a`, `1`, `b`, `2`, `c`, `3` ]);
});

test('pairwise', () => {
  const r1 = [ ...Arrays.pairwise([ 1, 2, 3, 4 ]) ];
  expect(r1).toEqual([
    [ 1, 2 ], [ 2, 3 ], [ 3, 4 ]
  ]);
  const r2 = [ ...Arrays.pairwise([ 1, 2, 3, 4, 5 ]) ];
  expect(r2).toEqual([
    [ 1, 2 ], [ 2, 3 ], [ 3, 4 ], [ 4, 5 ]
  ]);

  expect(() => [ ...Arrays.pairwise([]) ]).toThrow();
  expect(() => [ ...Arrays.pairwise([ 1 ]) ]).toThrow();
  expect(() => [ ...Arrays.pairwise('hello' as any as []) ]).toThrow();


});

test('without', () => {

  expect(Arrays.without([ `a`, `b`, `c` ], `b`)).toEqual([ `a`, `c` ]);
  expect(Arrays.without([ `a`, `b`, `c` ], [ `b`, `c` ])).toEqual([ `a` ]);
  expect(Arrays.without([ `a`, `b`, `c` ], [ `a`, `b`, `c` ])).toEqual([]);
  expect(Arrays.without([ `a`, `b`, `c` ], `d`)).toEqual([ `a`, `b`, `c` ]);

});

test('flatten', () => {
  expect(Arrays.flatten([ 1, [ 2, 3 ], [ [ 4 ] ] ])).toEqual([ 1, 2, 3, [ 4 ] ]);
  expect(Arrays.flatten([ 1, 2, 3, 4 ])).toEqual([ 1, 2, 3, 4 ]);

});

test('filterBetween', () => {
  const numbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

  const r1 = [ ...Arrays.filterBetween(numbers, () => true, 5, 7) ];
  expect(r1).toEqual(numbers.slice(5, 7));

  const r2 = [ ...Arrays.filterBetween(numbers, () => true, 5) ];
  expect(r2).toEqual(numbers.slice(5));

  const r3 = [ ...Arrays.filterBetween<number>(
    numbers,
    (d) => typeof d === `number` && !Number.isNaN(d),
    5,
    7
  ) ];
  expect(r3).toEqual(numbers.slice(5, 7));
});

test('containsDuplicateValues', () => {
  expect(Arrays.containsDuplicateValues([ 1, 2, 3, 1 ])).toBe(true);
  expect(Arrays.containsDuplicateValues([ 1, 2, 3, 4 ])).toBe(false);
  expect(Arrays.containsDuplicateValues([ 'a', 'b', 'c', 'a' ])).toBe(true);
  expect(Arrays.containsDuplicateValues([ 'a', 'b', 'c', 'd' ])).toBe(false);
  expect(Arrays.containsDuplicateValues([
    { name: 'Bob' },
    { name: 'Sally' },
    { name: 'Bob' },
  ])).toBe(true);
  expect(Arrays.containsDuplicateValues([
    { name: 'Bob' },
    { name: 'Sally' },
    { name: 'Jane' },
  ])).toBe(false);
  expect(Arrays.containsDuplicateValues(
    [
      { name: 'Bob', colour: 'red' },
      { name: 'Sally', colour: 'blue' },
      { name: 'Jane', colour: 'red' },
    ],
    (v) => v.colour
  )).toBe(true);
  expect(Arrays.containsDuplicateValues(
    [
      { name: 'Bob', colour: 'red' },
      { name: 'Sally', colour: 'blue' },
      { name: 'Jane', colour: 'red' },
    ],
    (v) => v.name
  )).toBe(false);
  expect(Arrays.containsDuplicateValues([])).toBe(false);

  expect(() => Arrays.containsDuplicateValues(undefined as any as [])).toThrow();
  expect(() => Arrays.containsDuplicateValues(null as any as [])).toThrow();
  expect(() => Arrays.containsDuplicateValues('hello' as any as [])).toThrow();
});

type Person = {
  name: string;
  v: number;
};
test('unique', () => {
  const a = [ 1, 2, 3, 1, 2, 3, 4 ];
  assert.sameDeepMembers(Arrays.unique(a), [ 1, 2, 3, 4 ]);

  const b = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
  assert.sameDeepMembers(Arrays.unique<number>([ a, b ]), [ 1, 2, 3, 4, 5, 6, 7, 8 ]);

  const c = [
    { name: 'Bob', v: 1 },
    { name: 'Sally', v: 2 },
    { name: 'Bob', v: 3 },
  ];

});

test('unique-deep', () => {
  const c = [
    { name: 'Bob', v: 1 },
    { name: 'Sally', v: 2 },
    { name: 'Bob', v: 3 },
  ];
  assert.sameDeepMembers<Person>(
    Arrays.uniqueDeep<Person>(c, (a, b) => a.name === b.name),
    [
      { name: 'Bob', v: 1 },
      { name: 'Sally', v: 2 },
    ]
  );
});

test('contains', () => {
  const a = [ 'apples', 'oranges', 'pears', 'mandarins' ];
  const b = [ 'pears', 'apples' ];
  expect(Arrays.contains(a, [ ...a ])).toBeTruthy();
  expect(Arrays.contains(a, b)).toBeTruthy();
  expect(Arrays.contains(a, [])).toBeTruthy();


  const c = [ 'pears', 'bananas' ];
  expect(Arrays.contains(a, c)).toBe(false);

  const d = [ `mangoes`, `kiwis`, undefined, `grapes` ];
  expect(Arrays.contains(d, [ `mangoes` ])).toBeTruthy();


  // @ts-expect-error not an array
  expect(() => Arrays.contains(null, b)).toThrow();
  // @ts-expect-error not an array
  expect(() => Arrays.contains({}, b)).toThrow();
  // @ts-expect-error not an array
  expect(() => Arrays.contains(undefined, b)).toThrow();

});



test(`pairwise-reduce`, () => {
  const reducer = (accumulator: string, a: string, b: string) => {
    return accumulator + `[${ a }-${ b }]`;
  };

  const t1 = Arrays.pairwiseReduce(`a b c d e f g`.split(` `), reducer, `!`);
  expect(t1).toBe(`![a-b][b-c][c-d][d-e][e-f][f-g]`);

  const t2 = Arrays.pairwiseReduce(`a b c d e f`.split(` `), reducer, `!`);
  expect(t2).toBe(`![a-b][b-c][c-d][d-e][e-f]`);

  const t3 = Arrays.pairwiseReduce([], reducer, `!`);
  expect(t3).toBe(`!`);

  const t4 = Arrays.pairwiseReduce([ `a` ], reducer, `!`);
  expect(t4).toBe(`!`);

  expect(() => Arrays.pairwiseReduce(`hello` as any as [], reducer, ``)).toThrow();
});

test(`mergeByKey`, () => {
  const a1 = [ `1-1`, `1-2`, `1-3`, `1-4` ];
  const a2 = [ `2-1`, `2-2`, `2-3`, `2-5` ];

  const keyFunction = (v: string) => v.substring(v.length - 1, v.length);
  const reconcileFunction = (a: string, b: string) => {
    return b.replace(`-`, `!`);
  };

  const t1 = mergeByKey(keyFunction, reconcileFunction, a1, a2);

  expect(t1.length).toBe(5);
  expect(t1.includes(`2!1`)).toBe(true);
  expect(t1.includes(`2!2`)).toBe(true);
  expect(t1.includes(`2!3`)).toBe(true);
  expect(t1.includes(`1-4`)).toBe(true);
  expect(t1.includes(`2-5`)).toBe(true);

  // Test with empty second param
  const a4: string[] = [];
  const t2 = mergeByKey(keyFunction, reconcileFunction, a1, a4);
  expect(t2.length).toBe(4);
  expect(t2.includes(`1-1`)).toBe(true);
  expect(t2.includes(`1-2`)).toBe(true);
  expect(t2.includes(`1-3`)).toBe(true);
  expect(t2.includes(`1-4`)).toBe(true);

  // Test with empty first param
  const t3 = mergeByKey(keyFunction, reconcileFunction, a4, a1);
  expect(t3.length).toBe(4);
  expect(t3.includes(`1-1`)).toBe(true);
  expect(t3.includes(`1-2`)).toBe(true);
  expect(t3.includes(`1-3`)).toBe(true);
  expect(t3.includes(`1-4`)).toBe(true);
});
test(`remove`, () => {
  expect(Arrays.remove([ 1, 2, 3 ], 2)).toEqual([ 1, 2 ]);
  expect(Arrays.remove([ 1, 2, 3 ], 0)).toEqual([ 2, 3 ]);
  expect(Arrays.remove([ 1, 2, 3 ], 1)).toEqual([ 1, 3 ]);

  // Index past length
  expect(() => Arrays.remove([ 1, 2, 3 ], 3)).toThrow();
  // Not an array
  expect(() => Arrays.remove(10 as any as [], 3)).toThrow();
});

test(`ensureLength`, () => {
  expect(Arrays.ensureLength([ 1, 2, 3 ], 2)).toEqual([ 1, 2 ]);
  expect(Arrays.ensureLength([ 1, 2, 3 ], 3)).toEqual([ 1, 2, 3 ]);
  expect(Arrays.ensureLength([ 1, 2, 3 ], 5, `undefined`)).toEqual([
    1,
    2,
    3,
    undefined,
    undefined,
  ]);
  expect(Arrays.ensureLength([ 1, 2, 3 ], 5, `repeat`)).toEqual([ 1, 2, 3, 1, 2 ]);
  expect(Arrays.ensureLength([ 1, 2, 3 ], 7, `repeat`)).toEqual([ 1, 2, 3, 1, 2, 3, 1 ]);

  expect(Arrays.ensureLength([ 1, 2, 3 ], 5, `first`)).toEqual([ 1, 2, 3, 1, 1 ]);
  expect(Arrays.ensureLength([ 1, 2, 3 ], 5, `last`)).toEqual([ 1, 2, 3, 3, 3 ]);
});

test(`isContentsTheSame`, () => {
  expect(Arrays.containsIdenticalValues([ 10, 10, 10 ])).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ `hello`, `hello`, `hello` ])).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ true, true, true ])).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ 100 ])).toBeTruthy();
  expect(Arrays.containsIdenticalValues([])).toBeTruthy();

  expect(Arrays.containsIdenticalValues([ 10, 10, 11 ])).toBeFalsy();
  expect(Arrays.containsIdenticalValues([ `Hello`, `hello` ])).toBeFalsy();
  expect(Arrays.containsIdenticalValues([ true, false ])).toBeFalsy();

  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 1 } ])).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 2 } ])).toBeFalsy();
  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 1, blah: 2 } ])).toBeFalsy();

  const eq = (a, b) => a.len === b.len;

  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 1 } ], eq)).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 1, blah: 2 } ], eq)).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 2 } ], eq)).toBeFalsy();

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
  const a = [ 10, 11, 12, 13 ];
  const b = [ `apples`, `oranges`, `pears`, `grapes` ];
  const c = [ true, false, true, false ];

  expect(Arrays.zip(a)).toEqual([ [ 10 ], [ 11 ], [ 12 ], [ 13 ] ]);
  expect(Arrays.zip(a, b, c)).toEqual([
    [ 10, `apples`, true ],
    [ 11, `oranges`, false ],
    [ 12, `pears`, true ],
    [ 13, `grapes`, false ],
  ]);

  // Throw if sizes are different
  const d = [ 100, 200, 300 ];
  expect(() => Arrays.zip(a, d)).toThrow();

  // Throw if not array
  expect(() => Arrays.zip(a, `potato` as any as [])).toThrow();
  expect(() => Arrays.zip(undefined as any as [])).toThrow();
  expect(() => Arrays.zip(`hello` as any as [])).toThrow();
});
