import test from 'ava';
import { retryFunction, backoffGenerator } from '../../flow/Retry.js';
import { Elapsed, sleep } from '../../flow/index.js';
import { isApproximately } from '../../Numbers.js';

test('backoffGenerator', async t => {
  // Use 1 as value, 1.1 as power
  const g1 = [ ...backoffGenerator({ limitAttempts: 5 }) ];
  t.deepEqual(g1, [
    1,
    2,
    4.143546925072586,
    8.920043687189214,
    20.02210648475953
  ]);

  // Test count, initialValue
  const g2 = [ ...backoffGenerator({ limitAttempts: 4, startAt: 10 }) ];
  t.deepEqual(g2, [
    10,
    22.589254117941675,
    53.441876248368075,
    132.99731344369667
  ]);

  // Test power
  const g3 = [ ...backoffGenerator({ limitAttempts: 4, startAt: 1, power: 2 }) ];
  t.deepEqual(g3, [ 1, 2, 6, 42 ]);
  t.pass();

  // @ts-expect-error
  t.throws(() => [ ...backoffGenerator({ limitAttempts: `hi` }) ]);
  t.throws(() => [ ...backoffGenerator({ limitAttempts: Number.NaN }) ]);
  t.throws(() => [ ...backoffGenerator({ limitValue: Number.NaN }) ]);
  t.throws(() => [ ...backoffGenerator({ power: Number.NaN }) ]);
});

/**
 * Tests returning an eventual value
 */
test('basic', async (t) => {
  const expectedCount = 3;
  let timesInvoked = 0;
  const fn = async () => {
    timesInvoked++;
    if (timesInvoked === expectedCount) return { name: 'Sue' };
  };

  const result = await retryFunction(fn, { limitAttempts: expectedCount * 2, startAt: 100 });
  t.is(timesInvoked, expectedCount);
  t.is(result.attempts, expectedCount);
  t.true(result.success);

  t.like(result.value, { name: 'Sue' });
});

/**
 * Tests that 'count' opt is honoured
 */
test('count', async (t) => {
  t.timeout(4 * 1000);
  const expectedCount = 3;
  let timesInvoked = 0;
  const fn = async () => {
    timesInvoked++;
  };
  const result = await retryFunction(fn, { limitAttempts: expectedCount, startAt: 100 });
  t.is(timesInvoked, expectedCount);
  t.is(result.attempts, expectedCount);
  t.false(result.success);
  t.true(result.elapsed < 3500);
  t.true(result.value === undefined);

  // Test parameter sanitising
  await t.throwsAsync(retryFunction(fn, { limitAttempts: 0 }));
  await t.throwsAsync(retryFunction(fn, { limitAttempts: -1 }));
  await t.throwsAsync(retryFunction(fn, { limitAttempts: Number.NaN }));
});

/**
 * Tests aborting retry after some iterations
 */
test('abort', async (t) => {
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

  t.is(result.attempts, abortAfter);
  t.false(result.success);
  t.is(result.value, undefined);
  t.is(result.message, 'Test abort');
});

/**
 * Tests that predelay opt is honoured
 */
test('predelay', async (t) => {
  let firstInvoke = true;
  const elapsed = Elapsed.since();
  const predelayMs = 200;
  const fn = async () => {
    if (firstInvoke) {
      // Test that predelayMs has elapsed
      const elapsedValue = elapsed();
      t.true(isApproximately(predelayMs, 0.06, elapsedValue), elapsedValue.toString());
      firstInvoke = true;
    }
  };
  // @ts-expect-error
  const r = await retryFunction(fn, { limitAttempts: 3, startAt: 1, predelayMs, taskValueFallback: 5 });

  // 'fn' above never returns a value, so we'd expect a fail result
  t.false(r.success);
});

/**
 * Tests aborting during predelay and fallback value
 */
test('predelay-abort', async (t) => {
  let firstInvoke = true;
  const predelayMs = 5000;
  const abort = new AbortController();
  const fn = async () => {
    // no-op
    t.fail(`Should not be executed`);
  };

  setTimeout(() => {
    abort.abort(`test`);
  }, 200);
  // @ts-expect-error
  const r = await retryFunction<string>(fn, { count: 3, startAt: 1, taskValueFallback: `hello`, predelayMs, abort: abort.signal });

  await sleep(200);
  t.false(r.success);
  t.is(r.value, `hello`);
});