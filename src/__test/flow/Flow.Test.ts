/* eslint-disable */
import test from 'ava';
import { continuously } from '../../flow/Continuously.js';
import { JSDOM } from 'jsdom';
import { sleep } from '../../flow/Sleep.js';
import { SyncWait } from '../../flow/SyncWait.js';

test(`syncWait`, async t => {
  const sw = new SyncWait();
  let signalled = false;
  setTimeout(() => {
    signalled = true;
    sw.signal();
  }, 100);

  await sw.forSignal();
  t.true(signalled);

  signalled = false;
  setTimeout(() => {
    signalled = true;
    sw.signal();
  }, 100);

  await sw.forSignal();
  t.true(signalled);

  // Test signal before wait
  const sw2 = new SyncWait();
  sw2.signal();
  await sw2.forSignal();

  // Test elapsed
  const sw3 = new SyncWait();
  try {
    await sw3.forSignal(100);
    t.fail(`Exception not thrown`)
  } catch (error) {
    t.pass(`Exception thrown`);
  }
});

test(`sleep`, async t => {
  const ac = new AbortController();

  setTimeout(() => {
    ac.abort(`test abort`);
  }, 200);
  await t.throwsAsync(async () => {
    await sleep({ secs: 60, signal: ac.signal });
  });
});

test('continuously', async (t) => {
  const dom = new JSDOM();
  // @ts-ignore
  global.window = dom.window;
  const loopCount = 5;
  const duration = 200;
  const expectedElapsed = loopCount * duration;
  t.plan(loopCount + 5); // +5 for additional asserts 

  let loops = loopCount;
  let startedAt = Date.now();
  const fn = () => {
    t.assert(true);
    loops--;
    return loops > 0;
  };

  const c = continuously(fn, 50);
  t.is(c.startCount, 0);
  t.is(c.runState, `idle`);
  c.start();
  t.is(c.runState, `scheduled`);

  //return new Promise(async (resolve, reject) => {
  await sleep(expectedElapsed + 50);
  t.true(c.startCountTotal > 0, `startCount: ${ c.startCountTotal }`);
  const elapsed = Date.now() - startedAt;
  t.true(Math.abs(elapsed - expectedElapsed) < 100, `Elapsed time too long: ${ elapsed }, expected: ${ expectedElapsed }`);

  //  resolve();
  //});
});

// test('', t=> {
//   const dom = new JSDOM();
//   // @ts-ignore
//   global.window = dom.window;
//   continuously(
// });
