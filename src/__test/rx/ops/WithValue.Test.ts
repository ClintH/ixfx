import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
test(`withValue`, async t => {
  const r1 = Rx.From.func(Math.random, { predelay: 300 });
  const r1dv = Rx.withValue(r1, { initial: 10 });
  t.is(r1dv.last(), 10);
  const value = await Rx.takeNextValue(r1dv);
  t.true(r1dv.last() < 1);
  t.is(value, r1dv.last());

  const r2 = Rx.From.func(Math.random, { predelay: 300 });
  const r2dv = Rx.withValue(r2, { initial: 10, lazy: `never` });
  t.is(r2dv.last(), 10);
  await Flow.sleep(400);
  t.true(r2dv.last() < 1);
});