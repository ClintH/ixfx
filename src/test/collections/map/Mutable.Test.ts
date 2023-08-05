import test from 'ava';
import { mutable } from '../../../collections/map/index.js';

test(`mutableMap`, (t) => {
  const m = mutable();
  t.true(m.isEmpty());
  m.add([`apples`, 10], [`oranges`, 9]);
  t.false(m.isEmpty());
  t.true(m.has(`apples`));
  t.true(m.has(`oranges`));
  t.false(m.has(`notthere`));

  m.add({ key: `grapes`, value: 10 });
  m.set(`mangoes`, 100);
  m.delete(`oranges`);
  t.false(m.has(`oranges`));
  t.true(m.has(`apples`));
  t.true(m.has(`grapes`));
  t.true(m.has(`mangoes`));

  t.is(m.get(`apples`), 10);
  t.falsy(m.get(`notthere`));
});
