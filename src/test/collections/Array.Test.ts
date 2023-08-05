import test from 'ava';
import {
  sortByNumericProperty,
  reducePairwise,
  mergeByKey,
  zip,
  valuesEqual,
  ensureLength,
  remove,
  compareValues,
  compareValuesEqual,
  contains,
} from '../../collections/Arrays.js';

test('contains', (t) => {
  const a = ['apples', 'oranges', 'pears', 'mandarins'];
  const b = ['pears', 'apples'];
  t.true(contains(a, b));
  t.true(contains(a, []));

  const c = ['pears', 'bananas'];
  t.false(contains(a, c));
});

test(`compare-values`, (t) => {
  const a = ['apples', 'oranges', 'pears'];
  const b = ['pears', 'kiwis', 'bananas'];
  const r = compareValues(a, b);
  t.like(r.shared, ['pears']);
  t.like(r.a, ['apples', 'oranges']);
  t.like(r.b, ['kiwis', 'bananas']);
  t.false(compareValuesEqual(a, b));

  const a1 = ['apples', 'oranges'];
  const b1 = ['oranges', 'apples'];
  t.true(compareValuesEqual(a1, b1));

  const aa = [{ name: 'John' }, { name: 'Mary' }, { name: 'Sue' }];
  const bb = [{ name: 'John' }, { name: 'Mary' }, { name: 'Jane' }];
  // @ts-ignore
  const rr = compareValues(aa, bb, (a, b) => a.name === b.name);
  t.like(rr.shared, [{ name: 'John' }, { name: 'Mary' }]);
  t.like(rr.a, [{ name: 'Sue' }]);
  t.like(rr.b, [{ name: 'Jane' }]);
  t.false(compareValuesEqual(aa, bb, (a, b) => a.name === b.name));

  const aa1 = [{ name: 'John' }, { name: 'Mary' }];
  const bb1 = [{ name: 'Mary' }, { name: 'John' }];
  t.true(compareValuesEqual(aa1, bb1, (a, b) => a.name === b.name));
});

test(`array-sort`, (t) => {
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

test(`array-reducePairwise`, (t) => {
  const reducer = (acc: string, a: string, b: string) => {
    return acc + `[${a}-${b}]`;
  };

  const t1 = reducePairwise(`a b c d e f g`.split(` `), reducer, `!`);
  t.is(t1, `![a-b][b-c][c-d][d-e][e-f][f-g]`);

  const t2 = reducePairwise(`a b c d e f`.split(` `), reducer, `!`);
  t.is(t2, `![a-b][b-c][c-d][d-e][e-f]`);

  const t3 = reducePairwise([], reducer, `!`);
  t.is(t3, `!`);

  const t4 = reducePairwise([`a`], reducer, `!`);
  t.is(t4, `!`);

  // @ts-ignore
  t.throws(() => reducePairwise(`hello`, reducer, ``));

  t.pass();
});

test(`array-mergeByKey`, (t) => {
  const a1 = [`1-1`, `1-2`, `1-3`, `1-4`];
  const a2 = [`2-1`, `2-2`, `2-3`, `2-5`];

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
  t.like(remove([1, 2, 3], 2), [1, 2]);
  t.like(remove([1, 2, 3], 0), [2, 3]);
  t.like(remove([1, 2, 3], 1), [1, 3]);

  // Index past length
  t.throws(() => remove([1, 2, 3], 3));
  // Not an array
  // @ts-ignore
  t.throws(() => remove(10, 3));
  t.pass();
});

test(`ensureLength`, (t) => {
  t.like(ensureLength([1, 2, 3], 2), [1, 2]);
  t.like(ensureLength([1, 2, 3], 3), [1, 2, 3]);
  t.like(ensureLength([1, 2, 3], 5, `undefined`), [
    1,
    2,
    3,
    undefined,
    undefined,
  ]);
  t.like(ensureLength([1, 2, 3], 5, `repeat`), [1, 2, 3, 1, 2]);
  t.like(ensureLength([1, 2, 3], 7, `repeat`), [1, 2, 3, 1, 2, 3, 1]);

  t.like(ensureLength([1, 2, 3], 5, `first`), [1, 2, 3, 1, 1]);
  t.like(ensureLength([1, 2, 3], 5, `last`), [1, 2, 3, 3, 3]);
});

test(`valuesEqual`, (t) => {
  const a = [10, 10, 10];
  const b = [`hello`, `hello`, `hello`];
  const c = [true, true, true];
  const d = [100];

  t.true(valuesEqual(a));
  t.true(valuesEqual(b));
  t.true(valuesEqual(c));
  t.true(valuesEqual(d));

  const a1 = [10, 10, 11];
  const b1 = [`Hello`, `hello`];
  const c1 = [true, false];
  t.false(valuesEqual(a1));
  t.false(valuesEqual(b1));
  t.false(valuesEqual(c1));
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
  const a = [10, 11, 12, 13];
  const b = [`apples`, `oranges`, `pears`, `grapes`];
  const c = [true, false, true, false];

  t.like(zip(a), [[10], [11], [12], [13]]);
  t.like(zip(a, b, c), [
    [10, `apples`, true],
    [11, `oranges`, false],
    [12, `pears`, true],
    [13, `grapes`, false],
  ]);

  // Throw if sizes are different
  const d = [100, 200, 300];
  t.throws(() => zip(a, d));

  // Throw if not array
  t.throws(() => zip(a, `potato`));
  t.throws(() => zip(undefined));
  t.throws(() => zip(`hello`));
});
