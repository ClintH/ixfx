import { numberTracker } from '../../data/NumberTracker.js';
import test from 'ava';
test(`numberTracker`, (t) => {
  const a = numberTracker({ id: `test` });
  t.true(a.id === `test`);
  t.true(a.total === 0);

  a.seen(10);
  a.seen(10);
  a.seen(10);

  t.true(a.avg === 10);
  t.true(a.min === 10);
  t.true(a.max === 10);
  t.true(a.total === 30);
  t.true(a.last === 10);
  t.true(a.seenCount === 3);

  a.seen(100);
  t.true(a.avg === 32.5);
  t.true(a.min === 10);
  t.true(a.max === 100);
  t.true(a.total === 130);
  t.true(a.last === 100);
  t.true(a.seenCount === 4);
});
