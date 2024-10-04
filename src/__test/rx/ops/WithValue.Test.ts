import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';

test(`with-value-lazy-never`, async t => {
  const r1 = Rx.From.func(() => {
    return Math.random();
  }, { interval: 50 });

  const r1dv = Rx.withValue(r1, { initial: 10, lazy: `never` });
  t.is(r1dv.last(), 10);

  await Flow.sleep(500);
  t.true(r1dv.last() < 1);
  r1.dispose(`test end`);
});

test(`with-value-lazy-very`, async t => {
  const r1 = Rx.From.func(() => {
    return Math.random();
  }, { interval: 50 });

  const r1dv = Rx.withValue(r1, { initial: 10, lazy: `very` });
  r1dv.onValue(v => {

  })
  t.is(r1dv.last(), 10);

  await Flow.sleep(500);
  t.true(r1dv.last() < 1);
  r1.dispose(`test end`);
});