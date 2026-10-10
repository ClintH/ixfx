import { elapsedOnce, elapsedSince } from '@ixfx/core';
import { count, isApprox } from '@ixfx/numbers';
import { expect, it } from 'vitest';
import { repeat } from '../src/repeat.js';

it(`function`, async () => {
  const rateMs = 50;
  const maxLoops = 5;
  let startCalled = 0;
  let completeCalled = 0;
  const randomGenerator = await repeat(Math.random, {
    delay: rateMs,
    onStart() {
      startCalled++;
    },
    onComplete() {
      completeCalled++;
    },
  });

  let produced = 0;
  const elapsed = elapsedSince();

  for await (const r of randomGenerator) {
    expect(r).toBeTypeOf(`number`);
    produced++;
    if (produced === maxLoops)
      break;
  }

  expect(produced).toBe(maxLoops);
  expect(isApprox(0.1, maxLoops * rateMs, elapsed())).toBe(true);
  expect(startCalled).toBe(1);
  expect(completeCalled).toBe(1);
});

it(`array`, async () => {
  let startCalled = 0;
  let completeCalled = 0;
  let errors = 0;
  const opts = {
    delay: 50,
    delayWhen: `before`,
    onStart() {
      startCalled++;
    },
    onComplete(withError: boolean) {
      if (withError)
        errors++;
      completeCalled++;
    },
  } as const;
  const list = [`thom`, `jonny`, `colin`, `ed`, `phil`];
  const iterateResult: any[] = [];
  const elapsed = elapsedOnce();
  for await (const index of repeat(list, opts)) {
    expect(index).toBeTypeOf(`string`);
    // if (typeof i !== 'string') done.fail(`Expected string type. Got: ${ typeof i }`);
    iterateResult.push(index);
  }

  expect(list).toEqual(iterateResult);
  expect(isApprox(0.1, (list.length + 1) * opts.delay, elapsed())).toBe(true);

  expect(errors).toBe(0);
  expect(startCalled).toBe(1);
  expect(completeCalled).toBe(1);
});

it(`generator`, async () => {
  // A generator that counts to 5
  const counter = count(5);
  const created: any[] = [];
  // Use interval to loop over counter with delay
  for await (const v of repeat(counter, { delay: 50 })) {
    expect(v).toBeTypeOf(`number`);
    created.push(v);
  }
  expect(created).toEqual([0, 1, 2, 3, 4]);
});

it(`delayWhen, while, delayMinimum options`, async () => {
  let produced = 0;
  let onCompleteError: boolean | undefined;
  const values: number[] = [];
  for await (const v of repeat(() => produced++, {
    delay: 5,
    delayMinimum: 20,
    delayWhen: `both`,
    while: loops => loops < 3,
    onComplete(withError) {
      onCompleteError = withError;
    },
  })) {
    values.push(v as number);
  }
  expect(values).toEqual([0, 1, 2]);
  expect(onCompleteError).toBe(false);
});
