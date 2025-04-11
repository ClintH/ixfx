import { test, expect, assert } from 'vitest';
import { continuously } from '../../core/src/continuously.js';
//import { JSDOM } from 'jsdom';

import { sleep } from '@ixfxfun/core';

test('continuously', async () => {
  //const dom = new JSDOM();
  // @ts-ignore
  //global.window = dom.window;
  const loopCount = 5;
  const duration = 200;
  const expectedElapsed = loopCount * duration;
  //expect.assertions(loopCount + 5); // +5 for additional asserts 

  let loops = loopCount;
  const startedAt = Date.now();
  const accumulatedData: any[] = [];
  const fn = () => {
    accumulatedData.push(true);
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
  expect(accumulatedData.length).toBe(loopCount);
  //  resolve();
  //});
});

// test('', t=> {
//   const dom = new JSDOM();
//   // @ts-ignore
//   global.window = dom.window;
//   continuously(
// });
