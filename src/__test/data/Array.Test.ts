import test from 'ava';
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

test('pairwise', t => {
  const r1 = [ ...pairwise([ 1, 2, 3, 4 ]) ];
  t.deepEqual(r1, [
    [ 1, 2 ], [ 2, 3 ], [ 3, 4 ]
  ]);
  const r2 = [ ...pairwise([ 1, 2, 3, 4, 5 ]) ];
  t.deepEqual(r2, [
    [ 1, 2 ], [ 2, 3 ], [ 3, 4 ], [ 4, 5 ]
  ]);

  t.throws(() => [ ...pairwise([]) ]);
  t.throws(() => [ ...pairwise([ 1 ]) ]);
  // @ts-expect-error
  t.throws(() => [ ...pairwise('hello') ]);

});

test('without', t => {

  t.deepEqual(without([ `a`, `b`, `c` ], `b`), [ `a`, `c` ]);
  t.deepEqual(without([ `a`, `b`, `c` ], [ `b`, `c` ]), [ `a` ]);
  t.deepEqual(without([ `a`, `b`, `c` ], [ `a`, `b`, `c` ]), []);
  t.deepEqual(without([ `a`, `b`, `c` ], `d`), [ `a`, `b`, `c` ]);

});

test('flatten', (t) => {
  t.deepEqual(
    flatten([ 1, [ 2, 3 ], [ [ 4 ] ] ]),
    [ 1, 2, 3, [ 4 ] ]);
  t.deepEqual(
    flatten([ 1, 2, 3, 4 ]),
    [ 1, 2, 3, 4 ]);

});

test('filterBetween', (t) => {
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

test('containsDuplicateValues', (t) => {
  t.true(containsDuplicateValues([ 1, 2, 3, 1 ]));
  t.false(containsDuplicateValues([ 1, 2, 3, 4 ]));
  t.true(containsDuplicateValues([ 'a', 'b', 'c', 'a' ]));
  t.false(containsDuplicateValues([ 'a', 'b', 'c', 'd' ]));
  t.true(
    containsDuplicateValues([
      { name: 'Bob' },
      { name: 'Sally' },
      { name: 'Bob' },
    ])
  );
  t.false(
    containsDuplicateValues([
      { name: 'Bob' },
      { name: 'Sally' },
      { name: 'Jane' },
    ])
  );
  t.true(
    containsDuplicateValues(
      [
        { name: 'Bob', colour: 'red' },
        { name: 'Sally', colour: 'blue' },
        { name: 'Jane', colour: 'red' },
      ],
      (v) => v.colour
    )
  );
  t.false(
    containsDuplicateValues(
      [
        { name: 'Bob', colour: 'red' },
        { name: 'Sally', colour: 'blue' },
        { name: 'Jane', colour: 'red' },
      ],
      (v) => v.name
    )
  );
  t.false(containsDuplicateValues([]));

  //@ts-ignore
  t.throws(() => containsDuplicateValues(undefined));
  //@ts-ignore
  t.throws(() => containsDuplicateValues(null));
  //@ts-ignore
  t.throws(() => containsDuplicateValues('hello'));
});

test('unique', (t) => {
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

test('contains', (t) => {
  const a = [ 'apples', 'oranges', 'pears', 'mandarins' ];
  const b = [ 'pears', 'apples' ];
  t.true(contains(a, b));
  t.true(contains(a, []));

  const c = [ 'pears', 'bananas' ];
  t.false(contains(a, c));
});

test(`compare-values`, (t) => {
  const a = [ 'apples', 'oranges', 'pears' ];
  const b = [ 'pears', 'kiwis', 'bananas' ];
  const r = compareValuesShallow(a, b);
  t.like(r.shared, [ 'pears' ]);
  t.like(r.a, [ 'apples', 'oranges' ]);
  t.like(r.b, [ 'kiwis', 'bananas' ]);
  t.false(hasEqualValuesShallow(a, b));

  const a1 = [ 'apples', 'oranges' ];
  const b1 = [ 'oranges', 'apples' ];
  t.true(hasEqualValuesShallow(a1, b1));

  const aa = [ { name: 'John' }, { name: 'Mary' }, { name: 'Sue' } ];
  const bb = [ { name: 'John' }, { name: 'Mary' }, { name: 'Jane' } ];
  // @ts-ignore
  const rr = compareValuesShallow(aa, bb, (a, b) => a.name === b.name);
  t.like(rr.shared, [ { name: 'John' }, { name: 'Mary' } ]);
  t.like(rr.a, [ { name: 'Sue' } ]);
  t.like(rr.b, [ { name: 'Jane' } ]);
  t.false(hasEqualValuesShallow(aa, bb, (a, b) => a.name === b.name));

  const aa1 = [ { name: 'John' }, { name: 'Mary' } ];
  const bb1 = [ { name: 'Mary' }, { name: 'John' } ];
  t.true(hasEqualValuesShallow(aa1, bb1, (a, b) => a.name === b.name));
});

test(`sort`, (t) => {
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
  t.pass();
});

test(`pairwise-reduce`, (t) => {
  const reducer = (acc: string, a: string, b: string) => {
    return acc + `[${ a }-${ b }]`;
  };

  const t1 = pairwiseReduce(`a b c d e f g`.split(` `), reducer, `!`);
  t.is(t1, `![a-b][b-c][c-d][d-e][e-f][f-g]`);

  const t2 = pairwiseReduce(`a b c d e f`.split(` `), reducer, `!`);
  t.is(t2, `![a-b][b-c][c-d][d-e][e-f]`);

  const t3 = pairwiseReduce([], reducer, `!`);
  t.is(t3, `!`);

  const t4 = pairwiseReduce([ `a` ], reducer, `!`);
  t.is(t4, `!`);

  // @ts-ignore
  t.throws(() => pairwiseReduce(`hello`, reducer, ``));

  t.pass();
});

test(`mergeByKey`, (t) => {
  const a1 = [ `1-1`, `1-2`, `1-3`, `1-4` ];
  const a2 = [ `2-1`, `2-2`, `2-3`, `2-5` ];

  const keyFn = (v: string) => v.substr(-1, 1);
  const reconcileFn = (a: string, b: string) => {
    return b.replace(`-`, `!`);
  };

  const t1 = mergeByKey(keyFn, reconcileFn, a1, a2);

  t.is(t1.length, 5);
  t.true(t1.includes(`2!1`));
  t.true(t1.includes(`2!2`));
  t.true(t1.includes(`2!3`));
  t.true(t1.includes(`1-4`));
  t.true(t1.includes(`2-5`));

  // Test with empty second param
  const a4: string[] = [];
  const t2 = mergeByKey(keyFn, reconcileFn, a1, a4);
  t.is(t2.length, 4);
  t.true(t2.includes(`1-1`));
  t.true(t2.includes(`1-2`));
  t.true(t2.includes(`1-3`));
  t.true(t2.includes(`1-4`));

  // Test with empty first param
  const t3 = mergeByKey(keyFn, reconcileFn, a4, a1);
  t.is(t3.length, 4);
  t.true(t3.includes(`1-1`));
  t.true(t3.includes(`1-2`));
  t.true(t3.includes(`1-3`));
  t.true(t3.includes(`1-4`));
});

test(`remove`, (t) => {
  t.like(remove([ 1, 2, 3 ], 2), [ 1, 2 ]);
  t.like(remove([ 1, 2, 3 ], 0), [ 2, 3 ]);
  t.like(remove([ 1, 2, 3 ], 1), [ 1, 3 ]);

  // Index past length
  t.throws(() => remove([ 1, 2, 3 ], 3));
  // Not an array
  // @ts-ignore
  t.throws(() => remove(10, 3));
  t.pass();
});

test(`ensureLength`, (t) => {
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

test(`isContentsTheSame`, (t) => {
  const a = [ 10, 10, 10 ];
  const b = [ `hello`, `hello`, `hello` ];
  const c = [ true, true, true ];
  const d = [ 100 ];

  t.true(isContentsTheSame(a));
  t.true(isContentsTheSame(b));
  t.true(isContentsTheSame(c));
  t.true(isContentsTheSame(d));

  const a1 = [ 10, 10, 11 ];
  const b1 = [ `Hello`, `hello` ];
  const c1 = [ true, false ];
  t.false(isContentsTheSame(a1));
  t.false(isContentsTheSame(b1));
  t.false(isContentsTheSame(c1));
});

// test(``, () => {
//   const a1 = [10, 11, 12, 13];
//   const a2 = [10, 11, 12, 13];
//   const b1 = [`apples`, `oranges`, `pears`, `grapes`];
//   const b2 = [`apples`, `oranges`, `pears`, `grapes`];
//   const c1 = [true, false, true, false];
//   const c2 = [true, false, true, false];

// });

test(`zip`, (t) => {
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
  t.throws(() => zip(a, d));

  // Throw if not array
  // @ts-expect-error
  t.throws(() => zip(a, `potato`));
  // @ts-expect-error
  t.throws(() => zip(undefined));
  // @ts-expect-error
  t.throws(() => zip(`hello`));
});
