import expect from 'expect';
import { number as numberTracker } from '../../trackers/NumberTracker.js';

test(`numberTracker`, () => {
  const a = numberTracker({ id: `test` });
  expect(a.id === `test`).toBe(true);
  expect(a.total === 0).toBe(true);

  a.seen(10);
  a.seen(10);
  a.seen(10);

  expect(a.avg === 10).toBe(true);
  expect(a.min === 10).toBe(true);
  expect(a.max === 10).toBe(true);
  expect(a.total === 30).toBe(true);
  expect(a.last === 10).toBe(true);
  expect(a.seenCount === 3).toBe(true);

  a.seen(100);
  expect(a.avg === 32.5).toBe(true);
  expect(a.min === 10).toBe(true);
  expect(a.max === 100).toBe(true);
  expect(a.total === 130).toBe(true);
  expect(a.last === 100).toBe(true);
  expect(a.seenCount === 4).toBe(true);
});


test(`multiple`, () => {
  const a = numberTracker();
  const r1 = a.seen(10, 10, 10);
  expect(r1.total).toBe(30);
  expect(r1.max).toBe(10);
  expect(r1.min).toBe(10);
  expect(r1.avg).toBe(10);

  const b = numberTracker();
  const r2 = b.seen(10, 20, 30);
  expect(r2.total).toBe(60);
  expect(r2.min).toBe(10);
  expect(r2.max).toBe(30);
  expect(r2.avg).toBe(20);
});
