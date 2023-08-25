/* eslint-disable */
import test from 'ava';
import {count} from '../Generators.js';

test(`count`, (t) => {
  t.throws(() => [...count(0.5)]);
  t.throws(() => [...count(Number.NaN)]);

  t.like([...count(5)], [0, 1, 2, 3, 4]);
  t.like([...count(5, 5)], [5, 6, 7, 8, 9]);
  t.like([...count(5, -5)], [-5, -4, -3, -2, -1]);

  t.like([...count(1)], [0]);
  t.is([...count(0)].length, 0);
  t.like([...count(-5)], [0, -1, -2, -3, -4]);
  t.like([...count(-5, 5)], [5, 4, 3, 2, 1]);
  t.like([...count(-5, -5)], [-5, -6, -7, -8, -9]);
});
