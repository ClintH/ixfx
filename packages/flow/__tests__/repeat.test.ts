import { test, expect } from 'vitest';
import { repeat } from '../src/repeat.js';
import * as Elapsed from '../../core/src/elapsed.js';
import { isApprox } from '@ixfxfun/numbers';
import { count } from '@ixfxfun/core';

test('function', async done => {
  const rateMs = 50;
  const maxLoops = 5;
  let startCalled = 0;
  let completeCalled = 0;
  const randomGenerator = await repeat(Math.random, {
    delay: rateMs,
    onStart() {
      startCalled++;
    },
    onComplete(withError) {
      completeCalled++;
    }
  });

  let produced = 0;
  const elapsed = Elapsed.elapsedSince();

  for await (const r of randomGenerator) {
    expect(r).toBeTypeOf(`number`);
    produced++;
    if (produced === maxLoops) break;
  }

  expect(produced).toBe(maxLoops);
  expect(isApprox(0.1, maxLoops * rateMs, elapsed())).toBe(true);
  expect(startCalled).toBe(1);
  expect(completeCalled).toBe(1);
});

test('array', async done => {
  let startCalled = 0;
  let completeCalled = 0;
  let errors = 0;
  const opts = {
    delay: 50,
    delayWhen: 'before',
    onStart() {
      startCalled++;
    },
    onComplete(withError: boolean) {
      if (withError) errors++;
      completeCalled++;
    }
  } as const;
  const list = [ 'thom', 'jonny', 'colin', 'ed', 'phil' ];
  const iterateResult: any[] = [];
  const elapsed = Elapsed.elapsedOnce();
  for await (const index of repeat(list, opts)) {
    expect(index).toBeTypeOf(`string`);
    //if (typeof i !== 'string') done.fail(`Expected string type. Got: ${ typeof i }`);
    iterateResult.push(index);
  }

  expect(list).toEqual(iterateResult);
  expect(isApprox(0.1, (list.length + 1) * opts.delay, elapsed())).toBe(true);

  expect(errors).toBe(0);
  expect(startCalled).toBe(1);
  expect(completeCalled).toBe(1);
});

test('generator', async done => {
  // A generator that counts to 5
  const counter = count(5);
  const created: any[] = [];
  // Use interval to loop over counter with delay
  for await (const v of repeat(counter, { delay: 50 })) {
    expect(v).toBeTypeOf(`number`);
    created.push(v);
  }
  expect(created).toEqual([ 0, 1, 2, 3, 4 ]);
});


