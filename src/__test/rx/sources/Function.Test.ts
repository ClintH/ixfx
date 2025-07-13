import expect from 'expect';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
import { isApprox } from '../../../numbers/IsApprox.js';

test(`manual`, async () => {
  // Test 1 - Manual trigger, no subscriber
  let r1Test = createTest();
  const r1 = Rx.From.func(r1Test.callback, { manual: true });
  r1.ping();
  await Flow.sleep(50);
  expect(r1Test.invoked() === 0).toBe(true);
  r1.dispose(`test`);

  // Test 1A - Manual trigger, with subscriber
  let r1TestA = createTest();
  const r1A = Rx.From.func(r1TestA.callback, { manual: true });
  r1A.onValue(value => {

  })
  r1A.ping();
  await Flow.sleep(50);
  expect(r1TestA.invoked() === 1).toBe(true);
  r1A.dispose(`test`);

  // Test 2 
  const r2Test = createTest();
  const r2 = Rx.From.func(r2Test.callback, { manual: true, maximumRepeats: 5 });
  r2.onValue(value => {});
  for (let i = 0; i < 10; i++) {
    r2.ping();
    await Flow.sleep(10);
  }
  await Flow.sleep(50);
  expect(r2Test.invoked() === 5).toBe(true);

});


const createTest = () => {
  let invoked = 0;
  return {
    callback: () => {
      invoked++;
      return invoked;
    },
    invoked: () => { return invoked }
  }
};

test(`loop-errors`, async () => {
  // Test 4 - Loop but stop with error
  let r4Invoked = 0;
  const r4 = Rx.From.func(() => {
    r4Invoked++;
    if (r4Invoked === 3) throw new Error(`Die`);
    return r4Invoked;
  }, { interval: 1, maximumRepeats: 5, closeOnError: true });
  const r4Value = await Rx.toArray(r4);
  expect(r4Value).toEqual([ 1, 2 ]);

  // Test 5 - Loop, ignoring errorss
  let r5Invoked = 0;
  const r5 = Rx.From.func(() => {
    r5Invoked++;
    if (r5Invoked === 3) throw new Error(`Die`);
    return r5Invoked;
  }, { interval: 1, maximumRepeats: 5, closeOnError: false });

  const r5Value = await Rx.toArray(r5);
  // '3' missing due to ignored error
  expect(r5Value).toEqual([ 1, 2, 4, 5, 6 ]);

  expect(r4Invoked).toBe(3);
  expect(r5Invoked).toBe(6);

  r4.dispose(`test`);
  r5.dispose(`test`);

});


test(`lazy-initial`, async () => {
  let produced = 0;
  const r = Rx.From.func(() => {
    produced++;
    return Math.floor(Math.random() * 1000);
  }, { lazy: `initial`, interval: 10 });

  let results1 = 0;
  const r1Off = r.on(msg => {
    results1++;
  });

  // Count number of times we got results and function fired for 500s
  await Flow.sleep(200);
  // Unsubscribe
  r1Off();
  expect(produced).toBe(results1);

  // Wait 500ms before subscribing again
  await Flow.sleep(200);

  let results2 = 0;
  const r2Off = r.on(msg => {
    results2++;
  });
  await Flow.sleep(200);
  r2Off();

  // Expect about the same number of results since we listened for 500ms both times
  expect(isApprox(0.1, results1, results2)).toBe(true);

  // Since producer is lazy, we expect # produced to be at least results1+2
  expect(results1 + results2 <= produced).toBe(true);
  r.dispose(`Test`);
});

test(`max-repeats`, async () => {
  // Test 1 - No loop limit
  const r1Func = createTest();
  const r1 = Rx.From.func(r1Func.callback, { interval: 1, lazy: `initial` });
  const r1Value = await Rx.toArray(r1, { limit: 5 });
  expect(r1Value.length).toBe(5);
  expect(r1Value).toEqual([ 1, 2, 3, 4, 5 ]);

  // Test 2 - Limit
  const r2Func = createTest();
  const r2 = Rx.From.func(r2Func.callback, { interval: 1, maximumRepeats: 5, lazy: `initial` });
  const r2Value = await Rx.toArray(r2);
  expect(r2Value).toEqual([ 1, 2, 3, 4, 5 ]);

  // Test 3 - Limit with interval between
  let elapsed = Flow.Elapsed.once();
  const r3Func = createTest();
  const r3 = Rx.From.func(r3Func.callback, { interval: 100, maximumRepeats: 5, lazy: `initial` });
  const r3Value = await Rx.toArray(r3, { maximumWait: 6000 });
  expect(isApprox(0.1, 6 * 100, elapsed())).toBe(true);
  expect(r3Value).toEqual([ 1, 2, 3, 4, 5 ]);


  expect(r1Func.invoked() > 5).toBe(true);
  expect(r2Func.invoked()).toBe(5);
  expect(r3Func.invoked()).toBe(5);

  r1.dispose(`test`);
  r2.dispose(`test`);
  r3.dispose(`test`);
});

test(`loop`, async () => {
  // Test 1 - No laziness
  let r1Invoked = 0;
  const r1 = Rx.From.func(() => r1Invoked++, { lazy: `never`, interval: 5 });
  await Flow.sleep(50);
  expect(r1Invoked > 0).toBe(true)
  r1.dispose(`test`);

  //Test 2 - full lazy
  let r2Invoked = 0;
  const r2 = Rx.From.func(() => r2Invoked++, { lazy: `very`, interval: 10 });
  await Flow.sleep(50);
  expect(r2Invoked).toBe(0);
  const r2Off = r2.onValue(v => {
  });
  // Count executions for 50ms before unsub
  await Flow.sleep(50);
  r2Off();

  // Shouldn't execute any more
  const r2InvokedNow = r2Invoked;
  await Flow.sleep(50);
  expect(r2Invoked).toBe(r2InvokedNow);

  r2.dispose(`test`);
});