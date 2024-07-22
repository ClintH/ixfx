import test from 'ava';
import { clamp, clampIndex } from '../../numbers/Clamp.js';

test(`clamp-inclusivity`, (t) => {
  t.is(clamp(0, 0, 1), 0);
  t.is(clamp(-1, 0, 1), 0);

  t.is(clamp(1, 0, 1), 1);
  t.is(clamp(1.1, 0, 1), 1);
});

test(`clamp-range`, (t) => {
  t.is(clamp(0.5, 0, 1), 0.5);
  t.is(clamp(0.000000005, 0, 1), 0.000000005);

  t.is(clamp(100, -100, 100), 100);
  t.is(clamp(-100, -100, 100), -100);
  t.is(clamp(0, -100, 100), 0);

  // test guards
  t.throws(() => clamp(NaN, 0, 100));
  t.throws(() => clamp(10, NaN, 100));
  t.throws(() => clamp(10, 0, NaN));
});

test(`clamp-zero-bounds`, (t) => {
  t.is(clampIndex(0, 5), 0);
  t.is(clampIndex(4, 5), 4);
  t.is(clampIndex(5, 5), 4);
  t.is(clampIndex(-5, 5), 0);

  // test throwing for non-ints
  t.throws(() => clampIndex(0, 5.5));
  t.throws(() => clampIndex(0.5, 5));
  t.throws(() => clampIndex(NaN, 5));
  t.throws(() => clampIndex(0, NaN));
});
