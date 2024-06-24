import test from 'ava';
import { float } from '../random/index.js';
import { equalUnordered, rangeCheck, rangeCheckInteger } from './Include.js';
import { weightedInteger } from '../random/WeightedInteger.js';
import { integer, integerUniqueGen } from '../random/Integer.js';

const repeat = <V>(count: number, fn: () => V): V[] => {
  let ret = [];
  while (count-- > 0) {
    ret.push(fn());
  }
  return ret;
}

test(`integerUniqueGen`, async t => {
  const d = [ ...integerUniqueGen(10) ];
  equalUnordered(t, d, [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
  t.pass();
});

test(`integer`, t => {
  const runs = 10 * 1000;
  // Max-0 range
  rangeCheckInteger(t, repeat(runs, () => integer(5)), {
    lowerIncl: 0,
    upperExcl: 5
  });
  rangeCheckInteger(t, repeat(runs, () => integer(-5)), {
    lowerIncl: -5,
    upperExcl: 0
  });

  // Max-min
  rangeCheckInteger(t, repeat(runs, () => integer({ max: 10, min: 5 })), {
    lowerIncl: 5,
    upperExcl: 10
  });

  rangeCheckInteger(t, repeat(runs, () => integer({ max: -5, min: -10 })), {
    lowerIncl: -10,
    upperExcl: -5
  });

  rangeCheckInteger(t, repeat(runs, () => integer({ max: 5, min: -5 })), {
    lowerIncl: -5,
    upperExcl: 5
  });

  // Dodgy input
  t.throws(() => integer({ max: 5, min: 10 }));
  t.throws(() => integer(0));
  t.throws(() => integer(Number.NaN));
  // @ts-ignore
  t.throws(() => integer('hello'));
  t.pass();

});

test('float', async t => {
  const runs = 10 * 1000;

  rangeCheck(t, repeat(runs, () => float(10)), {
    lowerExcl: 0,
    upperExcl: 10
  });

  rangeCheck(t, repeat(runs, () => float(-10)), {
    lowerExcl: -10,
    upperExcl: 0
  })

  rangeCheck(t, repeat(runs, () => float({ min: -10, max: 10 })), {
    lowerExcl: -10,
    upperExcl: 10
  });
  t.pass();
});

test(`weightedInteger`, t => {
  const test1 = repeat(1000, () => weightedInteger(10));
  rangeCheck(t, test1, { lowerIncl: 0, upperExcl: 10 });

  const test2 = repeat(1000, () => weightedInteger({ min: 10, max: 20 }));
  rangeCheck(t, test2, { lowerIncl: 10, upperExcl: 20 });

  const test3 = repeat(1000, () => weightedInteger({ max: 20, easing: `backIn` }));

  rangeCheck(t, test3, { lowerIncl: 0, upperExcl: 20 });

  // Error: max is greater than min
  t.throws(() => weightedInteger({ min: 10, max: 5 }));

  // Error: easing not found
  // @ts-ignore
  t.throws(() => weightedInteger({ max: 10, easing: `madeUpEasing` }));

  // Error: wrong param for second types
  // @ts-ignore
  t.throws(() => weightedInteger({ max: 0, easing: false }));

  // Error: no params
  // @ts-ignore
  t.throws(() => weightedInteger());

  // Error: string param
  // @ts-ignore
  t.throws(() => weightedInteger(`blah`));

  // Error: NaN
  t.throws(() => weightedInteger(Number.NaN));

});