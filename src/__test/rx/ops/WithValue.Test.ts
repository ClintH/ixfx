import expect from 'expect';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';

test(`with-value-lazy-never`, async () => {
  const r1 = Rx.From.func(() => {
    return Math.random();
  }, { interval: 50 });

  const r1dv = Rx.withValue(r1, { initial: 10, lazy: `never` });
  expect(r1dv.last()).toBe(10);

  await Flow.sleep(500);
  expect(r1dv.last() < 1).toBe(true);
  r1.dispose(`test end`);
});

test(`with-value-lazy-very`, async () => {
  const r1 = Rx.From.func(() => {
    return Math.random();
  }, { interval: 50 });

  const r1dv = Rx.withValue(r1, { initial: 10, lazy: `very` });
  r1dv.onValue(v => {

  })
  expect(r1dv.last()).toBe(10);

  await Flow.sleep(500);
  expect(r1dv.last() < 1).toBe(true);
  r1.dispose(`test end`);
});