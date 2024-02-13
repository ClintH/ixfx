import test from 'ava';
import { immutable } from '../../../collections/map/index.js';
import { arrayValuesEqual } from '../../Include.js';
import { isEqualValueDefault } from '../../../IsEqual.js';

test(`immutableMap`, (t) => {
  const m = immutable();
  const m2 = m.add([ `apples`, 10 ]);
  const m3 = m2.add({ key: `oranges`, value: 9 }, { key: `grapes`, value: 10 });

  t.true(m.isEmpty());
  t.false(m2.isEmpty());
  t.false(m3.isEmpty());

  t.false(m.has(`apples`));

  t.true(m2.has(`apples`));
  t.true(m3.has(`apples`));

  t.false(m.has(`oranges`));
  t.false(m2.has(`oranges`));
  t.true(m3.has(`oranges`));

  const m4 = m3.clear();
  t.true(m4.isEmpty());
  t.false(m.has(`oranges`));
  t.false(m2.has(`oranges`));
  t.true(m3.has(`oranges`));

  const m5 = m3.delete(`apples`);
  t.false(m.has(`apples`));
  t.true(m2.has(`apples`));
  t.true(m3.has(`apples`));
  t.false(m5.has(`apples`));

  t.is(m3.get(`grapes`), 10);
  t.falsy(m3.get(`notthere`));

  // test starting with data
  const m6 = immutable<string, number>([
    [ `apples`, 10 ],
    [ `oranges`, 9 ],
    [ `grapes`, 10 ],
  ]);
  const m6Entries = Array.from(m6.entries());
  const m3Entries = Array.from(m3.entries());
  arrayValuesEqual(t, m6Entries, m3Entries, isEqualValueDefault);
});
