import test from 'ava';
import { retry } from '../../flow/Retry.js';
import { Elapsed } from '../../flow/index.js';
import { isApproximately } from '../../Numbers.js';

test('basic', async (t) => {
  const expectedCount = 3;
  let timesInvoked = 0;
  const fn = async () => {
    timesInvoked++;
    if (timesInvoked === expectedCount) return { name: 'Sue' };
  };

  const result = await retry(fn, { count: expectedCount * 2, startMs: 100 });
  t.is(timesInvoked, expectedCount);
  t.is(result.attempts, expectedCount);
  t.true(result.success);

  t.like(result.value, { name: 'Sue' });
});

test('count', async (t) => {
  t.timeout(4 * 1000);
  const expectedCount = 3;
  //eslint-disable-next-line functional/no-let
  let timesInvoked = 0;
  const fn = async () => {
    timesInvoked++;
  };
  const result = await retry(fn, { count: expectedCount, startMs: 100 });
  t.is(timesInvoked, expectedCount);
  t.is(result.attempts, expectedCount);
  t.false(result.success);
  t.true(result.elapsed < 3500);
  t.true(result.value === undefined);

  // Test parameter sanitising
  await t.throwsAsync(retry(fn, { count: 0 }));
  await t.throwsAsync(retry(fn, { count: -1 }));
  await t.throwsAsync(retry(fn, { count: Number.NaN }));
});

test('abort', async (t) => {
  const abortController = new AbortController();
  //eslint-disable-next-line functional/no-let
  let timesInvoked = 0;
  const abortAfter = 10;
  const fn = async () => {
    timesInvoked++;
    if (timesInvoked === abortAfter) {
      abortController.abort('Test abort');
    }
  };
  const result = await retry(fn, {
    count: 15,
    abort: abortController.signal,
    startMs: 1,
  });

  t.is(result.attempts, abortAfter);
  t.false(result.success);
  t.is(result.value, undefined);
  t.is(result.message, 'Test abort');
});

test('predelay', async (t) => {
  //eslint-disable-next-line functional/no-let
  let firstInvoke = true;
  const elapsed = Elapsed.since();
  const predelayMs = 1000;
  const fn = async () => {
    if (firstInvoke) {
      t.true(isApproximately(predelayMs, 0.02, elapsed()));
      firstInvoke = true;
    }
  };
  await retry(fn, { count: 3, startMs: 1, predelayMs });
});
