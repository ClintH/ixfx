// /* eslint-disable */
import * as IterableSync from '../IterableSync.js';
import test from 'ava';

test(`chunksOverlapping`, (t) => {
  const a = [1, 2, 3, 4, 5];

  const t1 = Array.from(IterableSync.chunksOverlapping(a, 2));
  t.deepEqual(t1, [[1, 2], [2, 3], [3, 4], [4, 5]]);

  t.throws(() => Array.from(IterableSync.chunksOverlapping(a, 1)));

  const t3 = Array.from(IterableSync.chunksOverlapping(a, 3));
  t.deepEqual(t3, [[1, 2, 3], [3, 4, 5]]);

  const b: number[] = [];
  const t4 = Array.from(IterableSync.chunksOverlapping(b, 2));
  t.is(t4.length, 0);

});
