import expect from 'expect';
import { float, mersenneTwister } from '../random/index.js';
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

test(`mersenne-twister-seed`, () => {
  let tests = 10_000;
  const mt1 = mersenneTwister(100);
  let r1 = [];
  for (let i = 0; i < tests; i++) {
    r1.push(mt1.float());
  }

  const mt2 = mersenneTwister(100);
  let r2 = [];
  for (let i = 0; i < tests; i++) {
    r2.push(mt2.float());
  }

  for (let i = 0; i < tests; i++) {
    expect(r1[ i ]).toBe(r2[ i ]);
  }

})

test(`mersenne-twister-integer`, () => {
  const mt = mersenneTwister();
  let tests = 10_000;
  for (let i = 0; i < tests; i++) {
    let v = mt.integer(10);
    expect(v < 10).toBe(true);

  }

  for (let i = 0; i < tests; i++) {
    let v = mt.integer(10, 5);
    expect(v >= 5).toBe(true);
    expect(v < 10).toBe(true);
  }

})
test(`integerUniqueGen`, async () => {
  const d = [ ...integerUniqueGen(10) ];
  equalUnordered(t, d, [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
});

test(`integer`, () => {
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
  expect(() => integer({ max: 5, min: 10 })).toThrow();
  expect(() => integer(0)).toThrow();
  expect(() => integer(Number.NaN)).toThrow();
  // @ts-ignore
  expect(() => integer('hello')).toThrow();
});

test('float', async () => {
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
});

test(`weightedInteger`, () => {
  const test1 = repeat(1000, () => weightedInteger(10));
  rangeCheck(t, test1, { lowerIncl: 0, upperExcl: 10 });

  const test2 = repeat(1000, () => weightedInteger({ min: 10, max: 20 }));
  rangeCheck(t, test2, { lowerIncl: 10, upperExcl: 20 });

  const test3 = repeat(1000, () => weightedInteger({ max: 20, easing: `backIn` }));

  rangeCheck(t, test3, { lowerIncl: 0, upperExcl: 20 });

  // Error: max is greater than min
  expect(() => weightedInteger({ min: 10, max: 5 })).toThrow();

  // Error: easing not found
  // @ts-ignore
  expect(() => weightedInteger({ max: 10, easing: `madeUpEasing` })).toThrow();

  // Error: wrong param for second types
  // @ts-ignore
  expect(() => weightedInteger({ max: 0, easing: false })).toThrow();

  // Error: no params
  // @ts-ignore
  expect(() => weightedInteger()).toThrow();

  // Error: string param
  // @ts-ignore
  expect(() => weightedInteger(`blah`)).toThrow();

  // Error: NaN
  expect(() => weightedInteger(Number.NaN)).toThrow();

});