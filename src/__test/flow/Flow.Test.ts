/* eslint-disable */
import test from 'ava';
import { continuously } from '../../flow/Continuously.js';
import { JSDOM } from 'jsdom';
import { sleep } from '../../flow/Sleep.js';

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

  const c = continuously(fn, 200);
  t.is(c.startCount, 0);
  t.is(c.runState, `idle`);
  c.start();
  t.is(c.runState, `scheduled`);

  //return new Promise(async (resolve, reject) => {
  await sleep(expectedElapsed + 50);
  t.true(c.startCount > 0);
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
