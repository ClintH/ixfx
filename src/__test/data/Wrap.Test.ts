import test from 'ava';
import { wrap, wrapInteger } from '../../data/Wrap.js';

test(`wrap`, (t) => {
  t.is(wrap(10.5, 5, 10), 5.5);
  t.is(wrap(4, 5, 9), 8);
  t.is(wrap(5, 5, 9), 5);
  t.is(wrap(9, 5, 9), 5);
  t.is(wrap(4.5, 5, 9), 8.5);
});

test(`wrapInteger`, (t) => {
  // Test for non-integers
  t.throws(() => wrapInteger(0.5, 0, 360));
  t.throws(() => wrapInteger(10, 0.5, 360));
  t.throws(() => wrapInteger(10, 0, 20.5));

  t.is(wrapInteger(361, 0, 360), 1);
  t.is(wrapInteger(360, 0, 360), 0);
  t.is(wrapInteger(0, 0, 360), 0);
  t.is(wrapInteger(150, 0, 360), 150);
  t.is(wrapInteger(-20, 0, 360), 340);
  t.is(wrapInteger(360 * 3, 0, 360), 0);
  t.is(wrapInteger(150 - 360, 0, 360), 150);
  t.is(wrapInteger(150 - 360 * 2, 0, 360), 150);

  // Test default 0-360 range
  t.is(wrapInteger(361), 1);
  t.is(wrapInteger(360), 0);
  t.is(wrapInteger(0), 0);
  t.is(wrapInteger(150), 150);
  t.is(wrapInteger(-20), 340);
  t.is(wrapInteger(360 * 3), 0);
  t.is(wrapInteger(150 - 360), 150);
  t.is(wrapInteger(150 - 360 * 2), 150);

  // Non-zero min
  t.is(wrapInteger(20, 20, 70), 20);
  t.is(wrapInteger(70, 20, 70), 20);
  t.is(wrapInteger(80, 20, 70), 30);
  t.is(wrapInteger(-20, 20, 70), 50);

  t.is(wrapInteger(20, 20, 30), 20);
  t.is(wrapInteger(22, 20, 30), 22);
  t.is(wrapInteger(5, 20, 30), 25);
  t.is(wrapInteger(30, 20, 30), 20);
  t.is(wrapInteger(31, 20, 30), 21);
  t.is(wrapInteger(40, 20, 30), 20);
});
