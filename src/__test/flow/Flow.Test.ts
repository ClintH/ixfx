import expect from 'expect';
/* eslint-disable */
import { continuously } from '../../flow/Continuously.js';
import { JSDOM } from 'jsdom';
import { sleep } from '../../flow/Sleep.js';
import { SyncWait } from '../../flow/SyncWait.js';

test(`syncWait`, async done => {
  const sw = new SyncWait();
  let signalled = false;
  setTimeout(() => {
    signalled = true;
    sw.signal();
  }, 100);

  await sw.forSignal();
  expect(signalled).toBe(true);

  signalled = false;
  setTimeout(() => {
    signalled = true;
    sw.signal();
  }, 100);

  await sw.forSignal();
  expect(signalled).toBe(true);

  // Test signal before wait
  const sw2 = new SyncWait();
  sw2.signal();
  await sw2.forSignal();

  // Test elapsed
  const sw3 = new SyncWait();
  try {
    await sw3.forSignal(100);
    done.fail(`Exception not thrown`)
  } catch (error) {}
});

test(`sleep`, async () => {
  const ac = new AbortController();

  setTimeout(() => {
    ac.abort(`test abort`);
  }, 200);
  await t.throwsAsync(async () => {
    await sleep({ secs: 60, signal: ac.signal });
  });
});

test('continuously', async () => {
  const dom = new JSDOM();
  // @ts-ignore
  global.window = dom.window;
  const loopCount = 5;
  const duration = 200;
  const expectedElapsed = loopCount * duration;
  expect.assertions(loopCount + 5); // +5 for additional asserts 

  let loops = loopCount;
  let startedAt = Date.now();
  const fn = () => {
    t.assert(true);
    loops--;
    return loops > 0;
  };

  const c = continuously(fn, 50);
  expect(c.startCount).toBe(0);
  expect(c.runState).toBe(`idle`);
  c.start();
  expect(c.runState).toBe(`scheduled`);

  //return new Promise(async (resolve, reject) => {
  await sleep(expectedElapsed + 50);
  expect(c.startCountTotal > 0).toBe(true);
  const elapsed = Date.now() - startedAt;
  expect(Math.abs(elapsed - expectedElapsed) < 100).toBe(true);

  //  resolve();
  //});
});

// test('', t=> {
//   const dom = new JSDOM();
//   // @ts-ignore
//   global.window = dom.window;
//   continuously(
// });
