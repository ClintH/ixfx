import { test, expect } from 'vitest';
import { timeout } from '../src/timeout.js';
import { isApprox } from '@ixfxfun/numbers';
import { sleep } from '@ixfxfun/core';

/**
 * Tests a single firing
 */
test('basic', async () => {
  const delay = 100;
  let fired = false;
  const a = timeout(() => {
    fired = true;
  }, delay);

  expect(a.startCount).toBe(0);
  expect(a.runState).toBe(`idle`);
  expect(fired).toBe(false);
  a.start();
  expect(a.runState).toBe(`scheduled`);
  expect(a.startCount).toBe(0);

  setTimeout(() => {
    expect(fired).toBe(true);
    expect(a.runState).toBe(`idle`);
    expect(a.startCount).toBe(1);
  }, delay + 20)
});

test(`args`, async () => {
  const delay = 100;
  //expect.assertions(2);
  let triggered = false;
  const a = timeout((elapsed, args) => {
    triggered = true;
    expect(args).toEqual(`hello`);
    expect(isApprox(0.02, delay)(elapsed!)).toBe(true);
  }, delay);
  a.start(undefined, [ `hello` ]);
  await sleep(delay + 20);
  expect(triggered).toBeTruthy();
});

test(`start`, async () => {
  const delay = 10;
  const delayChange = 200;
  let aFired = 0;
  let start = Date.now();
  let stop = 0;
  const a = timeout(() => {
    aFired++;
    stop = Date.now();
  }, delay);
  a.start(delayChange);

  expect(a.runState).toBe(`scheduled`);
  await sleep(delayChange + 10);
  let elapsed = stop - start;
  expect(isApprox(0.02, delayChange)(elapsed)).toBe(true);
  expect(aFired).toBe(1);
  expect(a.runState).toBe(`idle`);

  // Test starting again
  start = Date.now();
  a.start();
  expect(a.runState).toBe(`scheduled`);
  await sleep(delayChange + 10);
  expect(isApprox(0.1, delayChange, elapsed)).toBe(true);
  expect(aFired).toBe(2);
  expect(a.runState).toBe(`idle`);

})
