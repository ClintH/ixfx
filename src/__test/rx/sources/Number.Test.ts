import test from 'ava';
import * as Rx from '../../../rx/index.js';

test(`rx-number`, t => {
  const nonInit = Rx.From.number();
  t.falsy(nonInit.last(), "Undefined initial value");
  t.false(Rx.hasLast(nonInit), "No last value");
  t.plan(8);
  nonInit.on(v => {
    t.is(v.value, 10);
  });
  nonInit.set(10);
  t.is(nonInit.last(), 10);
  t.true(Rx.hasLast(nonInit));

  const x = Rx.From.number(5);
  t.truthy(x.last());
  t.true(Rx.hasLast(x));
  t.is(x.last(), 5);
});