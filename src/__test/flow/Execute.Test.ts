import test from 'ava';
import { run, runSingle } from '../../flow/Execute.js';
import { comparerInverse, defaultComparer } from '../../util/index.js';

test('multiple', async (t) => {
  // Return numbers, use default sorting
  const r1Exp = [ () => 0.5, () => 10, () => 2, () => 3, () => 1, () => 0 ];

  t.deepEqual(await run<any, number>(r1Exp), [ 0, 0.5, 1, 2, 3, 10 ]);

  // Test stopping when we get a desired value
  t.deepEqual(
    await run(r1Exp, {
      stop: (latest) => {
        if (latest === 0.5) return true;
        return false;
      },
    }),
    [ 0.5 ]
  );

  // Inverted order
  t.deepEqual(
    await run(r1Exp, { rank: comparerInverse<number>(defaultComparer) }),
    [ 10, 3, 2, 1, 0.5, 0 ]
  );
});

test('object', async (t) => {
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
  t.is(result[ 0 ].colour, 'blue');
});

test('single', async (t) => {
  // Return numbers, use default sorting
  const r1Exp = [ () => 0.5, () => 10, () => 2, () => 3, () => 1, () => 0 ];

  t.is(await runSingle<any, number>(r1Exp), 10);

  // Shouldn't matter if shuffled
  t.is(await runSingle<any, number>(r1Exp, { shuffle: true }), 10);

  // Test stopping when we get a desired value
  t.is(
    await runSingle(r1Exp, {
      stop: (latest) => {
        if (latest === 0.5) return true;
        return false;
      },
    }),
    0.5
  );

  // Test inverted sort
  t.is(await runSingle(r1Exp, { rank: comparerInverse(defaultComparer) }), 0);

  // Return numbers with some undefined
  const r2 = await runSingle<any, number>([
    () => undefined,
    () => undefined,
    () => 3,
  ]);
  t.is(r2, 3);

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
  t.is(r3a, 100);
  const r3b = await runSingle<any, number>(r3Exp, {}, '');
  t.is(r3b, 2);
});
