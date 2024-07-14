import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';

const sleepBetweenMs = 50;

test(`dispose`, async t => {
  const a = Rx.From.number(10);
  const b = Rx.From.string(`test1`);

  // C1 disposes when a source does
  const c1 = Rx.From.derived(v => {
    return `${ v.b }:${ v.a }`;
  }, { a, b });

  // C2 does not dispose when a source does
  const c2 = Rx.From.derived(v => {
    return `${ v.b }:${ v.a }`;
  }, { a, b }, { disposeIfSourceDone: false });

  a.set(11);
  b.set(`test2`);
  await Flow.sleep(sleepBetweenMs);
  a.dispose(`test a dispose`);
  await Flow.sleep(sleepBetweenMs);

  t.false(c2.isDisposed());
  t.true(c1.isDisposed());

});

test(`basic`, async t => {
  const a = Rx.From.number(10);
  const b = Rx.From.string(`test1`);
  let values: any[] = [];
  let count = 0;
  const c = Rx.From.derived(v => {
    count++;
    return `${ v.b }:${ v.a }`;
  }, { a, b });

  // Add initial value
  values.push(c.last());

  c.onValue(v => {
    values.push(v);
  });
  await Flow.sleep(sleepBetweenMs * 2);

  a.set(11);
  await Flow.sleep(sleepBetweenMs);

  b.set('test2')
  await Flow.sleep(sleepBetweenMs);
  t.is(count, 3);

  // If input values don't change, we won't expect them
  // to trigger, and thus no new dervived value
  a.set(11);
  await Flow.sleep(sleepBetweenMs);

  b.set('test2');
  await Flow.sleep(sleepBetweenMs);
  t.is(count, 3);

  t.deepEqual(values, [ 'test1:10', 'test1:11', 'test2:11' ]);
});

test(`allow-identical`, async t => {
  const a = Rx.From.number(10);
  const b = Rx.From.string(`test1`);
  const sleepBetweenMs = 50;
  let values: any[] = [];
  let triggered = false;
  const c = Rx.From.derived(v => {
    if (triggered) return `bloop`;
    return `${ v.b }:${ v.a }`;
  }, { a, b }, { ignoreIdentical: false });

  // Add initial value
  values.push(c.last());

  c.onValue(v => {
    values.push(v);
  });
  await Flow.sleep(sleepBetweenMs * 2);

  a.set(11);
  await Flow.sleep(sleepBetweenMs);

  b.set('test2')
  await Flow.sleep(sleepBetweenMs);

  // From now on, will return a fixed value 'bloop',
  // to test that identical output values are sent
  triggered = true;
  a.set(12);
  await Flow.sleep(sleepBetweenMs);
  b.set('test3');
  await Flow.sleep(sleepBetweenMs);

  t.deepEqual(values, [ 'test1:10', 'test1:11', 'test2:11', 'bloop', 'bloop' ]);
});

test(`disallow-identical`, async t => {
  const a = Rx.From.number(10);
  const b = Rx.From.string(`test1`);
  const sleepBetweenMs = 50;
  let values: any[] = [];
  let triggered = false;
  const c = Rx.From.derived(v => {
    if (triggered) return `bloop`;
    return `${ v.b }:${ v.a }`;
  }, { a, b }, { ignoreIdentical: true });

  // Add initial value
  values.push(c.last());

  c.onValue(v => {
    values.push(v);
  });
  await Flow.sleep(sleepBetweenMs * 2);

  a.set(11);
  await Flow.sleep(sleepBetweenMs);

  b.set('test2')
  await Flow.sleep(sleepBetweenMs);

  // From now on, will return a fixed value 'bloop',
  // to test that identical output values are sent
  triggered = true;
  a.set(12);
  await Flow.sleep(sleepBetweenMs);
  b.set('test3');
  await Flow.sleep(sleepBetweenMs);

  t.deepEqual(values, [ 'test1:10', 'test1:11', 'test2:11', 'bloop' ]);
});




