import test from 'ava';
import * as Rx from '../../rx/index.js';
import * as Flow from '../../flow/index.js';
import { isApproximately } from '../../numbers/IsApproximately.js';
import * as Iter from '../../iterables/index.js';

test(`from-pinged-function`, async t => {

  const pingSource = Rx.number(0);
  const pingConstant = Rx.number(0);
  // Produce random values every 10ms
  const pingConstantT = setInterval(() => pingConstant.set(Math.random()), 10);

  // Test 1 - Not lazy
  let r1Test = createTest();
  const r1 = Rx.pinged(pingConstant, r1Test.callback, { lazy: `never` });
  await Flow.sleep(50);
  t.true(r1Test.invoked() > 0, `Function will run when not lazy`);
  r1.dispose(`test`);

  // Test 2 - Very lazy
  const r2Test = createTest();
  const r2 = Rx.pinged(pingConstant, r2Test.callback, { lazy: `very` });
  await Flow.sleep(50);
  t.true(r2Test.invoked() === 0, `Function does not run until there is a subscriber`);
  const r2Off = r2.value(v => {

  });
  await Flow.sleep(50);
  t.true(r2Test.invoked() > 0, `Invocations happen`);
  r2Off();
  const r2Invoked = r2Test.invoked();
  await Flow.sleep(50);
  t.true(r2Test.invoked() === r2Invoked, `Invocations stop when unsubscribed`);
  r2.dispose(`test`);

  // Test 3 - Initial lazy
  const r3Test = createTest();
  const r3 = Rx.pinged(pingConstant, r3Test.callback, { lazy: `initial` });
  await Flow.sleep(50);
  t.true(r3Test.invoked() === 0, `Function does not run until subscriber`);
  const r3Off = r3.value(v => {

  });
  await Flow.sleep(50);
  t.true(r3Test.invoked() > 0, `Invocations happen`);
  r3Off();
  const r3Invoked = r3Test.invoked();
  await Flow.sleep(50);
  t.true(r3Invoked < r3Test.invoked(), `Invocations continue after unsubscribing`);
  r3.dispose(`test`);
  clearInterval(pingConstantT);
});

test(`from-function`, async t => {
  // Test 1 - One-time invocation
  let invoked = 0;
  const r1 = Rx.fromFunction(() => {
    invoked++;
    return invoked;
  });
  const r1V = await Rx.takeNextValue(r1, 500);
  t.is(r1V, 1);
  t.is(invoked, 1);

  // Test 2 - Abort if error happens
  invoked = 0;
  const r2 = Rx.fromFunction(() => {
    throw new Error(`Bug`);
  });
  t.throwsAsync(async () => {
    const r2V = await Rx.takeNextValue(r2, 200);
  });
  await Flow.sleep(500);

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

test(`from-function-loop-errors`, async t => {
  // Test 4 - Loop but stop with error
  let r4Invoked = 0;
  const r4 = Rx.fromFunction(() => {
    r4Invoked++;
    if (r4Invoked === 3) throw new Error(`Die`);
    return r4Invoked;
  }, { interval: 1, maximumRepeats: 5 });
  const r4Value = await Rx.toArray(r4);
  t.deepEqual(r4Value, [ 1, 2 ]);

  // Test 5 - Loop, ignoring errorss
  let r5Invoked = 0;
  const r5 = Rx.fromFunction(() => {
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


test(`from-function-limits`, async t => {
  // Test 1 - No loop limit
  const r1Func = createTest();
  const r1 = Rx.fromFunction(r1Func.callback, { interval: 1, lazy: `initial` });
  const r1Value = await Rx.toArray(r1, { limit: 5 });
  t.is(r1Value.length, 5);
  t.deepEqual(r1Value, [ 1, 2, 3, 4, 5 ]);

  // Test 2 - Limit
  const r2Func = createTest();
  const r2 = Rx.fromFunction(r2Func.callback, { interval: 1, maximumRepeats: 5, lazy: `initial` });
  const r2Value = await Rx.toArray(r2);
  t.deepEqual(r2Value, [ 1, 2, 3, 4, 5 ]);

  // Test 3 - Limit with interval
  let elapsed = Flow.Elapsed.once();
  const r3Func = createTest();
  const r3 = Rx.fromFunction(r3Func.callback, { interval: 50, maximumRepeats: 5 });
  const r3Value = await Rx.toArray(r3, { maximumWait: 500 });
  t.true(isApproximately(5 * 50, 0.1, elapsed()), `Elapsed ${ elapsed() }`);
  t.deepEqual(r3Value, [ 1, 2, 3, 4, 5 ]);


  t.true(r1Func.invoked() > 5);
  t.is(r2Func.invoked(), 5);
  t.is(r3Func.invoked(), 5);

  r1.dispose(`test`);
  r2.dispose(`test`);
  r3.dispose(`test`);
});

test(`from-function-loop`, async t => {

  // Test 6 - No laziness
  let r6Invoked = 0;
  const r6 = Rx.fromFunction(() => r6Invoked++, { lazy: `never`, interval: 5 });
  await Flow.sleep(50);
  t.true(r6Invoked > 0, `Non lazy function should have been invoked without subscriber`)
  r6.dispose(`test`);

  //Test 6 - full lazy
  let r7Invoked = 0;
  const r7 = Rx.fromFunction(() => r7Invoked++, { interval: 5, lazy: `very` });
  await Flow.sleep(50);
  t.is(r7Invoked, 0, `Very lazy function should not run`);
  const r7Off = r7.value(v => {

  });
  // Count executions for 50ms before unsub
  await Flow.sleep(50);
  r7Off();
  // Shouldn't execute any more
  const r7InvokedNow = r7Invoked;
  await Flow.sleep(50);
  t.is(r7Invoked, r7InvokedNow, `Very lazy function should stop after removing subscriber`);

  r7.dispose(`test`);
});