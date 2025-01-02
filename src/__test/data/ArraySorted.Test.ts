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

test(`removeionIndex`, t => {
  const array1 = [ 1, 2, 3, 4, 5 ];
  t.is(Sorted.insertionIndex(array1, 0), 0);
  t.is(Sorted.insertionIndex(array1, -10), 0);

  t.is(Sorted.insertionIndex(array1, 1), 1);
  t.is(Sorted.insertionIndex(array1, 3.5), 3);
  t.is(Sorted.insertionIndex(array1, 4), 4);

  t.is(Sorted.insertionIndex(array1, 10), 5);
});

test(`insert`, t => {
  const array1 = [ 1, 2, 3, 4, 5 ];
  t.deepEqual(Sorted.insert(array1, 0), [ 0, 1, 2, 3, 4, 5 ]);
  t.deepEqual(Sorted.insert(array1, 1.5), [ 1, 1.5, 2, 3, 4, 5 ]);
  t.deepEqual(Sorted.insert(array1, 3), [ 1, 2, 3, 3, 4, 5 ]);
  t.deepEqual(Sorted.insert(array1, -10), [ -10, 1, 2, 3, 4, 5 ]);
  t.deepEqual(Sorted.insert(array1, 6), [ 1, 2, 3, 4, 5, 6 ]);
  t.deepEqual(Sorted.insert(array1, 50), [ 1, 2, 3, 4, 5, 50 ]);
});

test(`remove`, t => {
  const array1 = [ 1, 2, 3, 4, 5 ];
  t.deepEqual(Sorted.remove(array1, 3), [ 1, 2, 4, 5 ]);
  t.deepEqual(Sorted.remove(array1, 0), [ 1, 2, 3, 4, 5 ]);
  t.deepEqual(Sorted.remove(array1, 1), [ 2, 3, 4, 5 ]);
  t.deepEqual(Sorted.remove(array1, 5), [ 1, 2, 3, 4 ]);
  t.deepEqual(Sorted.remove(array1, 3.5), [ 1, 2, 3, 4, 5 ]);
  t.deepEqual(Sorted.remove(array1, 50), [ 1, 2, 3, 4, 5 ]);

  const array2 = [ 3 ];
  t.deepEqual(Sorted.remove(array2, 0), [ 3 ]);
  t.deepEqual(Sorted.remove(array2, 3), []);

});