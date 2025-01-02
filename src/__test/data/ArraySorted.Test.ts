import test from 'ava';
import { Sorted } from '../../data/arrays/index.js';

test(`indexOf`, t => {
  const array1 = [ 1, 2, 3, 4, 5 ];
  t.is(Sorted.indexOf(array1, 3), 2);
  t.is(Sorted.indexOf(array1, 5), 4);
  t.is(Sorted.indexOf(array1, 1), 0);
  t.is(Sorted.indexOf(array1, 0), -1);
  t.is(Sorted.indexOf(array1, 3.5), -1);
  t.is(Sorted.indexOf(array1, 6), -1);
});

test(`insertionIndex`, t => {
  const array1 = [ 1, 2, 3, 4, 5 ];
  t.is(Sorted.insertionIndex(array1, 0), 0);
  t.is(Sorted.insertionIndex(array1, -10), 0);

  t.is(Sorted.insertionIndex(array1, 1), 1);
  t.is(Sorted.insertionIndex(array1, 3.5), 3);
  t.is(Sorted.insertionIndex(array1, 4), 4);

  t.is(Sorted.insertionIndex(array1, 10), 5);
});