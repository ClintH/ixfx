import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
import { isApprox } from '../../../numbers/IsApprox.js';

test(`manual`, async t => {
  // Test 1 - Manual trigger, no subscriber
  let r1Test = createTest();
  const r1 = Rx.From.func(r1Test.callback, { manual: true });
  r1.ping();
  await Flow.sleep(50);
  t.true(r1Test.invoked() === 0, `Function will not run`);
  r1.dispose(`test`);

  // Test 1A - Manual trigger, with subscriber
  let r1TestA = createTest();
  const r1A = Rx.From.func(r1TestA.callback, { manual: true });
  r1A.onValue(value => {

  })
  r1A.ping();
  await Flow.sleep(50);
  t.true(r1TestA.invoked() === 1, `Function will run`);
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
  t.true(r2Test.invoked() === 5, `invoked count should be 5, got: ${ r2Test.invoked() }`);

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

test(`loop-errors`, async t => {
  // Test 4 - Loop but stop with error
  let r4Invoked = 0;
  const r4 = Rx.From.func(() => {
    r4Invoked++;
    if (r4Invoked === 3) throw new Error(`Die`);
    return r4Invoked;
  }, { interval: 1, maximumRepeats: 5, closeOnError: true });
  const r4Value = await Rx.toArray(r4);
  t.deepEqual(r4Value, [ 1, 2 ]);

  // Test 5 - Loop, ignoring errorss
  let r5Invoked = 0;
  const r5 = Rx.From.func(() => {
    r5Invoked++;
    if (r5Invoked === 3) throw new Error(`Die`);
    return r5Invoked;
  }, { interval: 1, maximumRepeats: 5, closeOnError: false });

  const r5Value = await Rx.toArray(r5);
  // '3' missing due to ignored error
  t.deepEqual(r5Value, [ 1, 2, 4, 5, 6 ]);

  t.is(r4Invoked, 3);
  t.is(r5Invoked, 6);

  r4.dispose(`test`);
  r5.dispose(`test`);

});


test(`lazy-initial`, async t => {
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
  t.is(produced, results1);

  // Wait 500ms before subscribing again
  await Flow.sleep(200);

  let results2 = 0;
  const r2Off = r.on(msg => {
    results2++;
  });
  await Flow.sleep(200);
  r2Off();

  // Expect about the same number of results since we listened for 500ms both times
  t.true(isApprox(0.1, results1, results2), `results1: ${ results1 } results2: ${ results2 }`);

  // Since producer is lazy, we expect # produced to be at least results1+2
  t.true(results1 + results2 <= produced);
  r.dispose(`Test`);
});

test(`max-repeats`, async t => {
  // Test 1 - No loop limit
  const r1Func = createTest();
  const r1 = Rx.From.func(r1Func.callback, { interval: 1, lazy: `initial` });
  const r1Value = await Rx.toArray(r1, { limit: 5 });
  t.is(r1Value.length, 5);
  t.deepEqual(r1Value, [ 1, 2, 3, 4, 5 ]);

  // Test 2 - Limit
  const r2Func = createTest();
  const r2 = Rx.From.func(r2Func.callback, { interval: 1, maximumRepeats: 5, lazy: `initial` });
  const r2Value = await Rx.toArray(r2);
  t.deepEqual(r2Value, [ 1, 2, 3, 4, 5 ]);

  // Test 3 - Limit with interval between
  let elapsed = Flow.Elapsed.once();
  const r3Func = createTest();
  const r3 = Rx.From.func(r3Func.callback, { interval: 100, maximumRepeats: 5, lazy: `initial` });
  const r3Value = await Rx.toArray(r3, { maximumWait: 6000 });
  t.true(isApprox(0.1, 6 * 100, elapsed()), `Elapsed ${ elapsed() }`);
  t.deepEqual(r3Value, [ 1, 2, 3, 4, 5 ]);


  t.true(r1Func.invoked() > 5);
  t.is(r2Func.invoked(), 5);
  t.is(r3Func.invoked(), 5);

  r1.dispose(`test`);
  r2.dispose(`test`);
  r3.dispose(`test`);
});

test(`loop`, async t => {
  // Test 1 - No laziness
  let r1Invoked = 0;
  const r1 = Rx.From.func(() => r1Invoked++, { lazy: `never`, interval: 5 });
  await Flow.sleep(50);
  t.true(r1Invoked > 0, `Non lazy function should have been invoked without subscriber`)
  r1.dispose(`test`);

  //Test 2 - full lazy
  let r2Invoked = 0;
  const r2 = Rx.From.func(() => r2Invoked++, { lazy: `very`, interval: 10 });
  await Flow.sleep(50);
  t.is(r2Invoked, 0, `Very lazy function should not run`);
  const r2Off = r2.onValue(v => {
  });
  // Count executions for 50ms before unsub
  await Flow.sleep(50);
  r2Off();

  // Shouldn't execute any more
  const r2InvokedNow = r2Invoked;
  await Flow.sleep(50);
  t.is(r2Invoked, r2InvokedNow, `Very lazy function should stop after removing subscriber`);

  r2.dispose(`test`);
});