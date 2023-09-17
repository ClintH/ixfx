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


test(`multiple`, t => {
  const a = numberTracker();
  const r1 = a.seen(10, 10, 10);
  t.is(r1.total, 30);
  t.is(r1.max, 10);
  t.is(r1.min, 10);
  t.is(r1.avg, 10);

  const b = numberTracker();
  const r2 = b.seen(10, 20, 30);
  t.is(r2.total, 60);
  t.is(r2.min, 10);
  t.is(r2.max, 30);
  t.is(r2.avg, 20);
});
