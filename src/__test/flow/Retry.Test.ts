import expect from 'expect';
import { retryFunction, backoffGenerator } from '../../flow/Retry.js';
import { Elapsed, sleep } from '../../flow/index.js';
import { isApprox } from '../../numbers/IsApprox.js';

test('backoffGenerator', async () => {
  // Use 1 as value, 1.1 as power
  const g1 = [ ...backoffGenerator({ limitAttempts: 5 }) ];
  expect(g1).toEqual([
    1,
    2,
    4.143546925072586,
    8.920043687189214,
    20.02210648475953
  ]);

  // Test count, initialValue
  const g2 = [ ...backoffGenerator({ limitAttempts: 4, startAt: 10 }) ];
  expect(g2).toEqual([
    10,
    22.589254117941675,
    53.441876248368075,
    132.99731344369667
  ]);

  // Test power
  const g3 = [ ...backoffGenerator({ limitAttempts: 4, startAt: 1, power: 2 }) ];
  expect(g3).toEqual([ 1, 2, 6, 42 ]);

  // @ts-expect-error
  expect(() => [ ...backoffGenerator({ limitAttempts: `hi` }) ]).toThrow();
  expect(() => [ ...backoffGenerator({ limitAttempts: Number.NaN }) ]).toThrow();
  expect(() => [ ...backoffGenerator({ limitValue: Number.NaN }) ]).toThrow();
  expect(() => [ ...backoffGenerator({ power: Number.NaN }) ]).toThrow();
});

/**
 * Tests returning an eventual value
 */
test('basic', async () => {
  const expectedCount = 3;
  let timesInvoked = 0;
  const fn = async () => {
    timesInvoked++;
    if (timesInvoked === expectedCount) return { name: 'Sue' };
  };

  const result = await retryFunction(fn, { limitAttempts: expectedCount * 2, startAt: 100 });
  expect(timesInvoked).toBe(expectedCount);
  expect(result.attempts).toBe(expectedCount);
  expect(result.success).toBe(true);

  t.like(result.value, { name: 'Sue' });
});

/**
 * Tests that 'count' opt is honoured
 */
test('count', async () => {
  t.timeout(4 * 1000);
  const expectedCount = 3;
  let timesInvoked = 0;
  const fn = async () => {
    timesInvoked++;
  };
  const result = await retryFunction(fn, { limitAttempts: expectedCount, startAt: 100 });
  expect(timesInvoked).toBe(expectedCount);
  expect(result.attempts).toBe(expectedCount);
  expect(result.success).toBe(false);
  expect(result.elapsed < 3500).toBe(true);
  expect(result.value === undefined).toBe(true);

  // Test parameter sanitising
  await t.throwsAsync(retryFunction(fn, { limitAttempts: 0 }));
  await t.throwsAsync(retryFunction(fn, { limitAttempts: -1 }));
  await t.throwsAsync(retryFunction(fn, { limitAttempts: Number.NaN }));
});

/**
 * Tests aborting retry after some iterations
 */
test('abort', async () => {
  const abortController = new AbortController();
  let timesInvoked = 0;
  const abortAfter = 5;
  const fn = async () => {
    timesInvoked++;
    if (timesInvoked === abortAfter) {
      abortController.abort('Test abort');
    }
  };
  const result = await retryFunction(fn, {
    limitAttempts: 15,
    abort: abortController.signal,
    startAt: 1,
  });

  expect(result.attempts).toBe(abortAfter);
  expect(result.success).toBe(false);
  expect(result.value).toBe(undefined);
  expect(result.message).toBe('Test abort');
});

/**
 * Tests that predelay opt is honoured
 */
test('predelay', async () => {
  let firstInvoke = true;
  const elapsed = Elapsed.since();
  const predelayMs = 200;
  const fn = async () => {
    if (firstInvoke) {
      // Test that predelayMs has elapsed
      const elapsedValue = elapsed();
      expect(isApprox(0.06, predelayMs, elapsedValue)).toBe(true);
      firstInvoke = true;
    }
  };
  // @ts-expect-error
  const r = await retryFunction(fn, { limitAttempts: 3, startAt: 1, predelayMs, taskValueFallback: 5 });

  // 'fn' above never returns a value, so we'd expect a fail result
  expect(r.success).toBe(false);
});

/**
 * Tests aborting during predelay and fallback value
 */
test('predelay-abort', async done => {
  let firstInvoke = true;
  const predelayMs = 5000;
  const abort = new AbortController();
  const fn = async () => {
    // no-op
    done.fail(`Should not be executed`);
  };

  setTimeout(() => {
    abort.abort(`test`);
  }, 200);
  // @ts-expect-error
  const r = await retryFunction<string>(fn, { count: 3, startAt: 1, taskValueFallback: `hello`, predelayMs, abort: abort.signal });

  await sleep(200);
  expect(r.success).toBe(false);
  expect(r.value).toBe(`hello`);
});