import expect from 'expect';
import { arrayValuesEqual } from '../Include.js';
import { pairwise, pairwiseReduce } from '../../data/arrays/Pairwise.js';
import { filterBetween, without } from '../../data/arrays/Filter.js';
import { flatten } from '../../data/arrays/Flatten.js';
import { contains, containsDuplicateValues } from '../../data/arrays/Contains.js';
import { unique } from '../../data/arrays/Unique.js';
import { compareValuesShallow, hasEqualValuesShallow } from '../../iterables/CompareValues.js';
import { sortByNumericProperty } from '../../data/arrays/Sort.js';
import { mergeByKey } from '../../data/arrays/MergeByKey.js';
import { remove } from '../../data/arrays/Remove.js';
import { ensureLength } from '../../data/arrays/EnsureLength.js';
import { zip } from '../../data/arrays/Zip.js';
import { isContentsTheSame } from '../../data/arrays/Equality.js';
import { atWrap } from '../../data/arrays/AtWrap.js';


test(`atWrap`, () => {
  const array = [ 1, 2, 3 ];
  expect(atWrap(array, 0)).toBe(1);
  expect(atWrap(array, 1)).toBe(2);
  expect(atWrap(array, 2)).toBe(3);
  expect(atWrap(array, 3)).toBe(1);
  expect(atWrap(array, 4)).toBe(2);
  expect(atWrap(array, 5)).toBe(3);
  expect(atWrap(array, 6)).toBe(1);
  expect(atWrap(array, 7)).toBe(2);

  expect(atWrap(array, -1)).toBe(3);
  expect(atWrap(array, -2)).toBe(2);
  expect(atWrap(array, -3)).toBe(1);
  expect(atWrap(array, -4)).toBe(3);

});

test('pairwise', () => {
  const r1 = [ ...pairwise([ 1, 2, 3, 4 ]) ];
  expect(r1).toEqual([
    [ 1, 2 ], [ 2, 3 ], [ 3, 4 ]
  ]);
  const r2 = [ ...pairwise([ 1, 2, 3, 4, 5 ]) ];
  expect(r2).toEqual([
    [ 1, 2 ], [ 2, 3 ], [ 3, 4 ], [ 4, 5 ]
  ]);

  expect(() => [ ...pairwise([]) ]).toThrow();
  expect(() => [ ...pairwise([ 1 ]) ]).toThrow();
  // @ts-expect-error
  expect(() => [ ...pairwise('hello') ]).toThrow();

});

test('without', () => {

  expect(without([ `a`, `b`, `c` ], `b`)).toEqual([ `a`, `c` ]);
  expect(without([ `a`, `b`, `c` ], [ `b`, `c` ])).toEqual([ `a` ]);
  expect(without([ `a`, `b`, `c` ], [ `a`, `b`, `c` ])).toEqual([]);
  expect(without([ `a`, `b`, `c` ], `d`)).toEqual([ `a`, `b`, `c` ]);

});

test('flatten', () => {
  expect(flatten([ 1, [ 2, 3 ], [ [ 4 ] ] ])).toEqual([ 1, 2, 3, [ 4 ] ]);
  expect(flatten([ 1, 2, 3, 4 ])).toEqual([ 1, 2, 3, 4 ]);

});

test('filterBetween', () => {
  const numbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

  const r1 = [ ...filterBetween(numbers, () => true, 5, 7) ];
  t.like(r1, numbers.slice(5, 7));

  const r2 = [ ...filterBetween(numbers, () => true, 5) ];
  t.like(r2, numbers.slice(5));

  const r3 = [ ...filterBetween<number>(
    numbers,
    (d) => typeof d === `number` && !Number.isNaN(d),
    5,
    7
  ) ];
  t.like(r3, numbers.slice(5, 7));
});

test('containsDuplicateValues', () => {
  expect(containsDuplicateValues([ 1, 2, 3, 1 ])).toBe(true);
  expect(containsDuplicateValues([ 1, 2, 3, 4 ])).toBe(false);
  expect(containsDuplicateValues([ 'a', 'b', 'c', 'a' ])).toBe(true);
  expect(containsDuplicateValues([ 'a', 'b', 'c', 'd' ])).toBe(false);
  expect(containsDuplicateValues([
    { name: 'Bob' },
    { name: 'Sally' },
    { name: 'Bob' },
  ])).toBe(true);
  expect(containsDuplicateValues([
    { name: 'Bob' },
    { name: 'Sally' },
    { name: 'Jane' },
  ])).toBe(false);
  expect(containsDuplicateValues(
    [
      { name: 'Bob', colour: 'red' },
      { name: 'Sally', colour: 'blue' },
      { name: 'Jane', colour: 'red' },
    ],
    (v) => v.colour
  )).toBe(true);
  expect(containsDuplicateValues(
    [
      { name: 'Bob', colour: 'red' },
      { name: 'Sally', colour: 'blue' },
      { name: 'Jane', colour: 'red' },
    ],
    (v) => v.name
  )).toBe(false);
  expect(containsDuplicateValues([])).toBe(false);

  //@ts-ignore
  expect(() => containsDuplicateValues(undefined)).toThrow();
  //@ts-ignore
  expect(() => containsDuplicateValues(null)).toThrow();
  //@ts-ignore
  expect(() => containsDuplicateValues('hello')).toThrow();
});

test('unique', () => {
  const a = [ 1, 2, 3, 1, 2, 3, 4 ];
  arrayValuesEqual(t, unique(a), [ 1, 2, 3, 4 ]);

  const b = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
  arrayValuesEqual(t, unique<number>([ a, b ]), [ 1, 2, 3, 4, 5, 6, 7, 8 ]);

  const c = [
    { name: 'Bob', v: 1 },
    { name: 'Sally', v: 2 },
    { name: 'Bob', v: 3 },
  ];
  type Person = {
    name: string;
    v: number;
  };
  arrayValuesEqual<Person>(
    t,
    unique<Person>(c, (a, b) => a.name === b.name),
    [
      { name: 'Bob', v: 1 },
      { name: 'Sally', v: 2 },
    ],
    (a, b) => a.name === b.name
  );
});

test('contains', () => {
  const a = [ 'apples', 'oranges', 'pears', 'mandarins' ];
  const b = [ 'pears', 'apples' ];
  expect(contains(a, b)).toBe(true);
  expect(contains(a, [])).toBe(true);

  const c = [ 'pears', 'bananas' ];
  expect(contains(a, c)).toBe(false);
});

test(`compare-values`, () => {
  const a = [ 'apples', 'oranges', 'pears' ];
  const b = [ 'pears', 'kiwis', 'bananas' ];
  const r = compareValuesShallow(a, b);
  t.like(r.shared, [ 'pears' ]);
  t.like(r.a, [ 'apples', 'oranges' ]);
  t.like(r.b, [ 'kiwis', 'bananas' ]);
  expect(hasEqualValuesShallow(a, b)).toBe(false);

  const a1 = [ 'apples', 'oranges' ];
  const b1 = [ 'oranges', 'apples' ];
  expect(hasEqualValuesShallow(a1, b1)).toBe(true);

  const aa = [ { name: 'John' }, { name: 'Mary' }, { name: 'Sue' } ];
  const bb = [ { name: 'John' }, { name: 'Mary' }, { name: 'Jane' } ];
  // @ts-ignore
  const rr = compareValuesShallow(aa, bb, (a, b) => a.name === b.name);
  t.like(rr.shared, [ { name: 'John' }, { name: 'Mary' } ]);
  t.like(rr.a, [ { name: 'Sue' } ]);
  t.like(rr.b, [ { name: 'Jane' } ]);
  expect(hasEqualValuesShallow(aa, bb, (a, b) => a.name === b.name)).toBe(false);

  const aa1 = [ { name: 'John' }, { name: 'Mary' } ];
  const bb1 = [ { name: 'Mary' }, { name: 'John' } ];
  expect(hasEqualValuesShallow(aa1, bb1, (a, b) => a.name === b.name)).toBe(true);
});

test(`sort`, () => {
  const data = [
    { size: 10, colour: `red` },
    { size: 20, colour: `blue` },
    { size: 5, colour: `pink` },
    { size: 10, colour: `orange` },
  ];

  const t1 = sortByNumericProperty(data, `size`);

  t.like(t1, [
    { size: 5, colour: `pink` },
    { size: 10, colour: `red` },
    { size: 10, colour: `orange` },
    { size: 20, colour: `blue` },
  ]);
});

test(`pairwise-reduce`, () => {
  const reducer = (accumulator: string, a: string, b: string) => {
    return accumulator + `[${ a }-${ b }]`;
  };

  const t1 = pairwiseReduce(`a b c d e f g`.split(` `), reducer, `!`);
  expect(t1).toBe(`![a-b][b-c][c-d][d-e][e-f][f-g]`);

  const t2 = pairwiseReduce(`a b c d e f`.split(` `), reducer, `!`);
  expect(t2).toBe(`![a-b][b-c][c-d][d-e][e-f]`);

  const t3 = pairwiseReduce([], reducer, `!`);
  expect(t3).toBe(`!`);

  const t4 = pairwiseReduce([ `a` ], reducer, `!`);
  expect(t4).toBe(`!`);

  // @ts-ignore
  expect(() => pairwiseReduce(`hello`, reducer, ``)).toThrow();
});

test(`mergeByKey`, () => {
  const a1 = [ `1-1`, `1-2`, `1-3`, `1-4` ];
  const a2 = [ `2-1`, `2-2`, `2-3`, `2-5` ];

  const keyFunction = (v: string) => v.substr(-1, 1);
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
  const a4: Array<string> = [];
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
  t.like(remove([ 1, 2, 3 ], 2), [ 1, 2 ]);
  t.like(remove([ 1, 2, 3 ], 0), [ 2, 3 ]);
  t.like(remove([ 1, 2, 3 ], 1), [ 1, 3 ]);

  // Index past length
  expect(() => remove([ 1, 2, 3 ], 3)).toThrow();
  // Not an array
  // @ts-ignore
  expect(() => remove(10, 3)).toThrow();
});

test(`ensureLength`, () => {
  t.like(ensureLength([ 1, 2, 3 ], 2), [ 1, 2 ]);
  t.like(ensureLength([ 1, 2, 3 ], 3), [ 1, 2, 3 ]);
  t.like(ensureLength([ 1, 2, 3 ], 5, `undefined`), [
    1,
    2,
    3,
    undefined,
    undefined,
  ]);
  t.like(ensureLength([ 1, 2, 3 ], 5, `repeat`), [ 1, 2, 3, 1, 2 ]);
  t.like(ensureLength([ 1, 2, 3 ], 7, `repeat`), [ 1, 2, 3, 1, 2, 3, 1 ]);

  t.like(ensureLength([ 1, 2, 3 ], 5, `first`), [ 1, 2, 3, 1, 1 ]);
  t.like(ensureLength([ 1, 2, 3 ], 5, `last`), [ 1, 2, 3, 3, 3 ]);
});

test(`isContentsTheSame`, () => {
  const a = [ 10, 10, 10 ];
  const b = [ `hello`, `hello`, `hello` ];
  const c = [ true, true, true ];
  const d = [ 100 ];

  expect(isContentsTheSame(a)).toBe(true);
  expect(isContentsTheSame(b)).toBe(true);
  expect(isContentsTheSame(c)).toBe(true);
  expect(isContentsTheSame(d)).toBe(true);

  const a1 = [ 10, 10, 11 ];
  const b1 = [ `Hello`, `hello` ];
  const c1 = [ true, false ];
  expect(isContentsTheSame(a1)).toBe(false);
  expect(isContentsTheSame(b1)).toBe(false);
  expect(isContentsTheSame(c1)).toBe(false);
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

  t.like(zip(a), [ [ 10 ], [ 11 ], [ 12 ], [ 13 ] ]);
  t.like(zip(a, b, c), [
    [ 10, `apples`, true ],
    [ 11, `oranges`, false ],
    [ 12, `pears`, true ],
    [ 13, `grapes`, false ],
  ]);

  // Throw if sizes are different
  const d = [ 100, 200, 300 ];
  expect(() => zip(a, d)).toThrow();

  // Throw if not array
  // @ts-expect-error
  expect(() => zip(a, `potato`)).toThrow();
  // @ts-expect-error
  expect(() => zip(undefined)).toThrow();
  // @ts-expect-error
  expect(() => zip(`hello`)).toThrow();
});
