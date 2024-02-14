import test from 'ava';
import { timeout } from '../../flow/Timeout.js';
import { sleep } from '../../flow/Sleep.js';
import { Elapsed } from '../../flow/index.js';
import { isApproximately } from '../../Numbers.js';

/**
 * Tests a single firing
 */
test('basic', async (t) => {
  const delay = 100;
  let fired = false;
  const a = timeout(() => {
    fired = true;
  }, delay);

  t.is(a.startCount, 0);
  t.is(a.runState, `idle`);
  t.false(fired);
  a.start();
  t.is(a.runState, `scheduled`);
  t.is(a.startCount, 0);

  setTimeout(() => {
    t.true(fired);
    t.is(a.runState, `idle`);
    t.is(a.startCount, 1);
  }, delay + 20)
});

test(`args`, async t => {
  const delay = 100;
  t.plan(2);
  const a = timeout((elapsed, args) => {
    t.deepEqual(args, `hello`);
    t.true(isApproximately(delay, 0.02)(elapsed!));
  }, delay);
  a.start(undefined, [ `hello` ]);
  await sleep(delay + 20);
});

test(`start`, async t => {
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

  t.is(a.runState, `scheduled`);
  await sleep(delayChange + 10);
  let elapsed = stop - start;
  t.true(isApproximately(delayChange, 0.02)(elapsed));
  t.is(aFired, 1);
  t.is(a.runState, `idle`);

  // Test starting again
  start = Date.now();
  a.start();
  t.is(a.runState, `scheduled`);
  await sleep(delayChange + 10);
  t.true(isApproximately(delayChange, 0.01)(elapsed));
  t.is(aFired, 2);
  t.is(a.runState, `idle`);

})