import test from 'ava';
import * as Rx from '../../rx/index.js';
import * as Flow from '../../flow/index.js';
import { isApproximately } from '../../numbers/IsApproximately.js';
import { count } from '../../numbers/Count.js';

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
  const r = Rx.fromGenerator(time);

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

  const source = Rx.fromGenerator(valuesOverTime);
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
  //t.true(isApproximately(valueRateMs * valueCount, 0.1)(elapsed));
  t.true(source.isDisposed());
});

test(`generator-sync`, async t => {
  const values = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
  const source = Rx.fromGenerator(values.values(), { lazy: `initial` });
  const readValues: number[] = [];
  source.on(v => {
    if (v.value) {
      readValues.push(v.value);
    }
  });

  await Flow.sleep(1000);
  t.true(readValues.length === values.length);
});