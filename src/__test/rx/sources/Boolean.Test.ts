import test from 'ava';
import * as Rx from '../../../rx/index.js';
test(`rx-boolean`, t => {
  const nonInit = Rx.From.boolean();
  t.falsy(nonInit.last(), "Undefined initial value");
  t.false(Rx.hasLast(nonInit), "No last value");
  t.plan(10);
  let count = 0;
  nonInit.on(v => {
    count++;
    if (count === 1) {
      t.is(v.value, true);
    } else if (count === 2) {
      t.is(v.value, false);
    } else t.fail(`Unexpectedly called three times`);

  });
  nonInit.set(true);
  t.is(nonInit.last(), true);
  t.true(Rx.hasLast(nonInit));

  nonInit.set(false);
  t.is(nonInit.last(), false);
  t.true(Rx.hasLast(nonInit));

  const x = Rx.From.boolean(false);
  t.is(x.last(), false);
  t.true(Rx.hasLast(x));
});