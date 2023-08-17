/* eslint-disable */
import test from 'ava';
import { continuously } from '../../flow/Continuously.js';
import { JSDOM } from 'jsdom';
import { sleep } from '../../flow/Sleep.js';

test('continuously', async (t) => {
  const dom = new JSDOM();
  // @ts-ignore
  global.window = dom.window;
  const loopCount = 5;
  const duration = 200;
  const expectedElapsed = loopCount * duration;
  t.plan(loopCount + 1); // +1 for additional asserts whend one

  let loops = loopCount;
  let startedAt = Date.now();
  const fn = () => {
    t.assert(true);
    loops--;
    return loops > 0;
  };

  const c = continuously(fn, 200);
  c.start();

  return new Promise(async (resolve, reject) => {
    await sleep(expectedElapsed + 50);
    t.true(c.isDone);
    const elapsed = Date.now() - startedAt;
    if (Math.abs(elapsed - expectedElapsed) > 100) {
      t.fail(`Elapsed time too long: ${elapsed}, expected: ${expectedElapsed}`);
    }
    resolve();
  });
});

// test('', t=> {
//   const dom = new JSDOM();
//   // @ts-ignore
//   global.window = dom.window;
//   continuously(
// });
