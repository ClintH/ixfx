import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
import * as Iter from '../../../iterables/index.js';
import { isApprox } from '../../../numbers/IsApprox.js';
import { count } from '../../../numbers/Count.js';
import { interval } from '../../../flow/index.js';

test(`from-array`, async t => {
  const d1 = [ 1, 2, 3, 4, 5 ];
  const r1 = Rx.From.iterator(d1);
  const r1Data = await Rx.toArray(r1);
  t.deepEqual(r1Data, d1);
});

// Lazy: Never, whenStopped: reset
test(`from-array-lazy-never-breaking-reset`, async t => {
  const source = () => [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
  const r1 = Rx.From.iterator(source(), { whenStopped: `reset`, lazy: `never` });
  let count = 0;
  const r1Data: number[] = [];
  const r1Off = r1.onValue(v => {
    count++;
    r1Data.push(v);
    if (count === 5) {
      r1Off();
    }
  });
  await Flow.sleep(100);
  t.is(count, 5);
  t.deepEqual(r1Data, [ 1, 2, 3, 4, 5 ]);
  t.true(r1.isDisposed());
});

// Lazy: Initial, whenStopped: reset
test(`from-array-lazy-initial-breaking-reset`, async t => {
  const source = () => [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
  const r1 = Rx.From.iterator(source(), { whenStopped: `reset`, lazy: `initial` });
  let count = 0;
  const r1Data: number[] = [];
  const r1Off = r1.onValue(v => {
    count++;
    r1Data.push(v);
    if (count === 5) r1Off();
  });
  await Flow.sleep(100);
  t.is(count, 5);
  t.deepEqual(r1Data, [ 1, 2, 3, 4, 5 ]);

  // Expect the reactive to dispose
  // It continues running through source until end, since lazy:initial
  await Flow.sleep(100);
  t.true(r1.isDisposed());
});

// Lazy: Very, whenStopped: continue
test(`from-array-lazy-very-breaking-continue`, async t => {
  const source = () => [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
  const r1 = Rx.From.iterator(source(), { whenStopped: `continue`, lazy: `very` });
  let count = 0;
  const r1Data: number[] = [];
  const r1Off = r1.onValue(v => {
    count++;
    r1Data.push(v);
    if (count === 5) {
      r1Off();
    }
  });
  await Flow.sleep(100);
  t.is(count, 5);
  t.deepEqual(r1Data, [ 1, 2, 3, 4, 5 ]);

  count = 0;
  const r2Data: number[] = [];
  const r2Off = r1.onValue(v => {
    count++;
    r2Data.push(v);
    if (count === 5) {
      r2Off();
    }
  });
  await Flow.sleep(100);
  t.is(count, 5);
  t.deepEqual(r2Data, [ 6, 7, 8, 9, 10 ]);
  r2Off();
});

test(`from-array-breaking-reset`, async t => {
  const source = () => [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
  const r1 = Rx.From.iterator(source(), { whenStopped: `reset`, lazy: `very`, readInterval: 50 });
  let count = 0;
  const r1Data: number[] = [];
  const r1Off = r1.onValue(v => {
    count++;
    r1Data.push(v);
    if (count === 5) {
      r1Off();
    }
  });

  await Flow.sleepWhile(() => count < 5, 50);

  t.is(count, 5);
  t.deepEqual(r1Data, [ 1, 2, 3, 4, 5 ]);

  count = 0;
  const r2Data: number[] = [];
  const r2Off = r1.onValue(v => {
    count++;
    r2Data.push(v);
    if (count === 5) {
      r2Off();
    }
  });
  await Flow.sleepWhile(() => count < 5, 50);

  t.is(count, 5);
  t.deepEqual(r2Data, [ 1, 2, 3, 4, 5 ]);
  r2Off();
});

// Synchronous generator
test(`from-sync-iterator`, async t => {
  const r1 = Rx.From.iterator(count(5));
  const r1Data = await Rx.toArray(r1);
  t.deepEqual(r1Data, [ 0, 1, 2, 3, 4 ]);
});

test(`from-async`, async t => {
  // Asynchronous generator
  const runCount = 5;
  let countProgress = runCount;
  const intervalPeriod = 100;
  const r2 = interval(() => {
    if (countProgress === 0) return;
    return --countProgress;
  }, intervalPeriod);
  let start = performance.now();
  const r2Data = await Rx.toArray(r2);
  let elapsed = performance.now() - start;
  t.is(countProgress, 0);
  t.deepEqual(r2Data, [ 4, 3, 2, 1, 0 ]);
  t.true(isApprox(0.1, (runCount + 1) * intervalPeriod, elapsed), `Elapsed: ${ elapsed }`);
});

test(`generator-lazy`, async t => {
  let produceCount = 0;
  let consumeCount = 0;
  const ac = new AbortController();

  // Keep track of how many times its called.
  // Runs every 100ms
  const time = Flow.interval(() => {
    produceCount++;
    return Math.random();
  }, { fixed: 100, signal: ac.signal });

  // Reactive from a generator
  const r = Rx.From.iterator(time);

  // Wait 2s before subscribing
  setTimeout(() => {
    r.on(v => {
      consumeCount++;
      if (consumeCount === 10) {
        // We should have consumed as many as created
        ac.abort(`hey`);
      }
    })
  }, 1500);

  await Flow.sleep(1000);
  t.is(consumeCount, produceCount);

})

test(`generator-async`, async t => {
  // Produce values every 100ms
  const valueRateMs = 100;
  const valueCount = 10;
  const valuesOverTime = Flow.interval(() => Math.random(), valueRateMs);

  const source = Rx.From.iterator(valuesOverTime);
  const values1: number[] = [];
  const start = Date.now();
  source.on(v => {
    if (v.value === undefined) return;
    values1.push(v.value);
    if (values1.length === valueCount) {
      source.dispose(`test dispose`);
      return;
    }
  });
  t.false(source.isDisposed());
  const sleepFor = valueRateMs * (valueCount + 2);
  await Flow.sleep(sleepFor);
  const elapsed = Date.now() - start;
  //t.true(isApprox(0.1, valueRateMs * valueCount, elapsed));
  t.true(source.isDisposed());
});

test(`generator-sync`, async t => {
  const values = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
  const source = Rx.From.iterator(values.values(), { lazy: `initial` });
  const readValues: number[] = [];
  source.on(v => {
    if (v.value) {
      readValues.push(v.value);
    }
  });

  await Flow.sleep(1000);
  t.true(readValues.length === values.length);
});

// Lazy: Initial, whenStopped: reset
test(`from-iterable-breaking-initial-reset`, async t => {
  const source = () => [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];

  const r1 = Rx.From.iterator(source(), { whenStopped: `reset`, lazy: `initial` });
  let count = 0;
  const r1Data: number[] = [];
  const r1Off = r1.onValue(v => {
    count++;
    r1Data.push(v);
    if (count === 5) r1Off();
  });
  await Flow.sleep(100);
  t.is(count, 5);
  t.deepEqual(r1Data, [ 1, 2, 3, 4, 5 ]);

  // Expect the reactive to dispose
  // It continues running through source until end, since lazy:initial
  await Flow.sleep(100);
  t.true(r1.isDisposed());
});

// Iterator that never ends
test(`from-function`, async t => {
  const random = Iter.Async.fromFunction(Math.random);
  const r1 = Rx.From.iterator(random, { readInterval: 100 });
  let count = 0;
  const off = r1.onValue(v => {
    count++;
    if (count == 5) {
      r1.dispose(`test dispose`);
    } else if (count > 5) {
      t.fail(`Still producing values`);
    }
  });
  await Flow.sleep(500);
  t.is(count, 5);
  off();
});