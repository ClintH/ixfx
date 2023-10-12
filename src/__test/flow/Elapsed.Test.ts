import test from 'ava';
import { toString, since } from '../../flow/Elapsed.js';

test('toString', (t) => {
  t.is(toString(100), '100ms');
  t.is(toString(10 * 1000), '10.0secs');

  const fn = () => 100;
  t.is(toString(fn), '100ms');

  const elapsed = () => 0;
  t.is(toString(elapsed, 0), '0ms');
});
