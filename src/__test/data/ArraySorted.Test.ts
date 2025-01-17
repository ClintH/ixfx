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

test(`merge`, t => {
  const a = [ 4, 7, 10 ]
  const b = [ 1, 2, 9, 11 ]
  t.deepEqual(Sorted.merge(a, b), [ 1, 2, 4, 7, 9, 10, 11 ]);

  t.deepEqual(Sorted.merge([ 1, 2, 3 ], [ 4, 5, 6 ]), [ 1, 2, 3, 4, 5, 6 ]);
  t.deepEqual(Sorted.merge([ 4, 5, 6 ], [ 1, 2, 3 ]), [ 1, 2, 3, 4, 5, 6 ]);
  t.deepEqual(Sorted.merge([ 1, 2, 3 ], [ 1, 2, 3 ]), [ 1, 1, 2, 2, 3, 3 ]);
});

test(`sort-merge`, t => {
  t.deepEqual(Sorted.sort([ 10, 2, 5, 9 ]), [ 2, 5, 9, 10 ]);
  t.deepEqual(Sorted.sort([ 10, 2, 5, 9 ], `merge`), [ 2, 5, 9, 10 ]);

  const rev = (a: number, b: number): number => {
    if (a === b) return 0;
    if (a > b) return -1;
    return 1;
  }
  t.deepEqual(Sorted.sort([ 10, 2, 5, 9 ], `default`, rev), [ 10, 9, 5, 2 ]);
  t.deepEqual(Sorted.sort([ 10, 2, 5, 9 ], `merge`, rev), [ 10, 9, 5, 2 ]);


});