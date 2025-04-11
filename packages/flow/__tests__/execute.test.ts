import { test, expect } from 'vitest';
import { run, runSingle } from '../src/execute.js';
import { comparerInverse, defaultComparer } from '@ixfxfun/core';
//import { comparerInverse, defaultComparer } from '../../util/index.js';
test('multiple', async () => {
  // Return numbers, use default sorting
  const r1Exp = [ () => 0.5, () => 10, () => 2, () => 3, () => 1, () => 0 ];

  expect(await run<any, number>(r1Exp)).toEqual([ 0, 0.5, 1, 2, 3, 10 ]);

  // Test stopping when we get a desired value
  expect(await run(r1Exp, {
    stop: (latest) => {
      if (latest === 0.5) return true;
      return false;
    },
  })).toEqual([ 0.5 ]);

  // Inverted order
  expect(await run(r1Exp, { rank: comparerInverse<number>(defaultComparer) })).toEqual([ 10, 3, 2, 1, 0.5, 0 ]);
});

test('object', async () => {
  const expr = [
    () => ({ colour: 'red' }),
    () => ({ colour: 'blue' }),
    () => ({ colour: 'green' }),
  ];
  const opts = {
    rank: (a: { colour: string }, b: { colour: string }) => {
      return defaultComparer(a.colour, b.colour);
    },
  };
  const result = await run(expr, opts);
  expect(result[ 0 ].colour).toBe('blue');
});

test('single', async () => {
  // Return numbers, use default sorting
  const r1Exp = [ () => 0.5, () => 10, () => 2, () => 3, () => 1, () => 0 ];

  expect(await runSingle<any, number>(r1Exp)).toBe(10);

  // Shouldn't matter if shuffled
  expect(await runSingle<any, number>(r1Exp, { shuffle: true })).toBe(10);

  // Test stopping when we get a desired value
  expect(await runSingle(r1Exp, {
    stop: (latest) => {
      if (latest === 0.5) return true;
      return false;
    },
  })).toBe(0.5);

  // Test inverted sort
  expect(await runSingle(r1Exp, { rank: comparerInverse(defaultComparer) })).toBe(0);

  // Return numbers with some undefined
  const r2 = await runSingle<any, number>([
    () => undefined,
    () => undefined,
    () => 3,
  ]);
  expect(r2).toBe(3);

  // Return different result depending on args
  const r3Exp = [
    (args: string) => {
      if (args === `apple`) {
        return 100;
      } else return 2;
    },
    () => 1.5,
  ];
  const r3a = await runSingle<any, number>(r3Exp, {}, 'apple');
  expect(r3a).toBe(100);
  const r3b = await runSingle<any, number>(r3Exp, {}, '');
  expect(r3b).toBe(2);
});
