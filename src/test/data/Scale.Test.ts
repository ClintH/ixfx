import test from 'ava';
import { scale } from '../../data/Scale.js';

test(`scale`, (t) => {
  t.is(scale(50, 0, 100, 0, 1), 0.5);
  t.is(scale(100, 0, 100, 0, 1), 1);
  t.is(scale(0, 0, 100, 0, 1), 0);
});
