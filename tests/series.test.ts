/* eslint-disable */
import * as Series from '../src/Series.js';
import {IntervalTracker} from '../src/Tracker.js';

/// TODO: Test atInterval
// console.log(`Start`);
// const s = atInterval(500, () => Math.random());
// setTimeout(() => {
//   console.log(`Killing`);
//   s.cancel();
// }, 5000);


it(`timed iterable`, () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const testCancel = false;
  const delay = 500;
  const interval = 100;
  let received = 0;
  const debug = false;

  const p = new Promise<void>((resolve, reject) => {
    const intervalTracker = new IntervalTracker();
    const series = Series.fromTimedIterable<number>(numbers, delay, interval);
    series.addEventListener(`data`, (ev: number) => {
      intervalTracker.mark();
      received++;
      if (debug) console.log(`received data ${received}/${numbers.length}`);
    });
    series.addEventListener(`cancel`, (reason: string) => {
      if (debug) console.log(`series cancelled ${reason}`);
      reject(`series cancelled ${reason}`);
    });

    series.addEventListener(`done`, (wasCancelled: boolean) => {
      if (debug) console.log(`done fired. wasCancelled: ${wasCancelled}`);
      const actualInterval = intervalTracker.avg;
      expect(actualInterval).toBeGreaterThanOrEqual(interval);
      expect(actualInterval).toBeLessThanOrEqual(interval + 100);
      expect(wasCancelled).toBeFalsy();
      expect(received).toEqual(numbers.length);
      resolve();
    });

    // if (testCancel) {
    //   setTimeout(() => {
    //     series.cancel();
    //   }, delay + 500);
    // }
  });
  return p;
});


it(`timed iterable cancel`, () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const delay = 500;
  const interval = 100;
  const debug = false;
  let cancelEvent = false;

  const p = new Promise<void>((resolve, reject) => {
    const series = Series.fromTimedIterable<number>(numbers, delay, interval);
    series.addEventListener(`cancel`, (reason: string) => {
      cancelEvent = true;
      if (debug) console.log(`series cancelled ${reason}`);
    });

    series.addEventListener(`done`, (wasCancelled: boolean) => {
      if (debug) console.log(`done fired. wasCancelled: ${wasCancelled}`);
      expect(wasCancelled).toBeTruthy();
      expect(cancelEvent).toBeTruthy();
      resolve();
    });

    setTimeout(() => {
      series.cancel();
    }, delay + 500);
  });
  return p;
});
