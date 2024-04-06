import * as IterableSync from '../../iterables/IterableSync.js';
import test from 'ava';
import { isApproximately } from '../../numbers/IsApproximately.js';
import { count } from '../../numbers/Count.js';
test(`until`, t => {
  let triggered = 0;
  IterableSync.until(count(5), () => {
    triggered++;
  });
  t.is(triggered, 5);
});

test(`chunks`, async t => {
  //chunks([1,2,3,4,5,6,7,8,9,10], 3);
  // Yields [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
  const r1 = IterableSync.chunks(IterableSync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]), 3);
  const r1Data = IterableSync.toArray(r1);
  t.deepEqual(r1Data, [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ], [ 10 ] ]);
});

test(`chunksOverlapping`, (t) => {
  const a = [ 1, 2, 3, 4, 5 ];

  const t1 = Array.from(IterableSync.chunksOverlapping(a, 2));
  t.deepEqual(t1, [ [ 1, 2 ], [ 2, 3 ], [ 3, 4 ], [ 4, 5 ] ]);

  t.throws(() => Array.from(IterableSync.chunksOverlapping(a, 1)));

  const t3 = Array.from(IterableSync.chunksOverlapping(a, 3));
  t.deepEqual(t3, [ [ 1, 2, 3 ], [ 3, 4, 5 ] ]);

  const b: number[] = [];
  const t4 = Array.from(IterableSync.chunksOverlapping(b, 2));
  t.is(t4.length, 0);

});

test(`max`, t => {
  const d1 = [ 1, 2, 3, 4, 5 ];
  const r1 = IterableSync.max(IterableSync.fromArray(d1));
  const r1Array = IterableSync.toArray(r1);
  t.deepEqual(r1Array, d1);

  const r2 = IterableSync.max(IterableSync.fromArray([ 5, 4, 3, 2, 1 ]));
  const r2Array = IterableSync.toArray(r2);
  t.deepEqual(r2Array, [ 5 ]);

  const r3 = IterableSync.max(IterableSync.fromArray([ 0, 2, 1, 0, 3 ]));
  const r3Array = IterableSync.toArray(r3);
  t.deepEqual(r3Array, [ 0, 2, 3 ]);
});

test(`min`, t => {
  const d1 = [ 1, 2, 3, 4, 5 ];
  const r1 = IterableSync.min(IterableSync.fromArray(d1));
  const r1Array = IterableSync.toArray(r1);
  t.deepEqual(r1Array, [ 1 ]);

  const r2 = IterableSync.min(IterableSync.fromArray([ 5, 4, 3, 2, 1 ]));
  const r2Array = IterableSync.toArray(r2);
  t.deepEqual(r2Array, [ 5, 4, 3, 2, 1 ]);

  const r3 = IterableSync.min(IterableSync.fromArray([ 0, 2, 1, 0, -3 ]));
  const r3Array = IterableSync.toArray(r3);
  t.deepEqual(r3Array, [ 0, -3 ]);
});

test(`dropWhile`, t => {
  const r1 = IterableSync.dropWhile(IterableSync.fromArray([ 1, 2, 3, 4 ]), e => e < 3);
  const r1Result = IterableSync.toArray(r1);
  t.deepEqual(r1Result, [ 3, 4 ]);
});
test(`filter`, t => {
  const r1 = IterableSync.filter(IterableSync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]), v => v % 2 === 0);
  const r1Data = IterableSync.toArray(r1);
  t.deepEqual(r1Data, [ 2, 4, 6, 8, 10 ]);
});

test(`fill`, t => {
  const r1 = IterableSync.fill(IterableSync.fromArray([ 1, 2, 3, 4 ]), 10);
  const r1Data = IterableSync.toArray(r1);
  t.deepEqual(r1Data, [ 10, 10, 10, 10 ]);
})

test(`concat`, t => {
  const r1 = IterableSync.fromArray([ 1, 2, 3, 4 ]);
  const r2 = IterableSync.fromArray([ 5, 6, 7, 8 ]);

  const r3 = IterableSync.concat(r1, r2);
  const r3Data = IterableSync.toArray(r3);
  t.deepEqual(r3Data, [ 1, 2, 3, 4, 5, 6, 7, 8 ]);
});

test(`find`, t => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4 ]);

  const r1a = IterableSync.find(r1(), v => v == 3);
  t.is(r1a, 3);
  const r1b = IterableSync.find(r1(), v => v == 5);
  t.falsy(r1b);
});

test(`forEach`, t => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4, 5 ]);
  let count = 0;
  IterableSync.forEach(r1(), () => {
    count++;
  });
  t.is(count, 5);

  count = 0;
  IterableSync.forEach(r1(), () => {
    count++;
    if (count == 2) return false;
  });
  t.is(count, 2);
});

test(`map`, t => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4, 5 ]);
  const r2 = IterableSync.map(r1(), v => `v:${ v }`);
  const r2Data = IterableSync.toArray(r2);
  t.deepEqual(r2Data, [ `v:1`, `v:2`, `v:3`, `v:4`, `v:5` ]);
});

test(`flatten`, t => {
  const r1 = () => IterableSync.fromArray([ 1, [ 2, 3 ], [ [ 4 ] ] ]);
  const r2 = IterableSync.flatten(r1());
  const r2Data = IterableSync.toArray(r2);
  t.deepEqual(r2Data, [ 1, 2, 3, [ 4 ] ]);
})

test(`some`, t => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4 ]);
  const r2 = IterableSync.some(r1(), v => v === 3);
  t.true(r2);

  const r3 = IterableSync.some(r1(), v => v === 10);
  t.false(r3);
});

test(`reduce`, t => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3 ]);
  const r2 = IterableSync.reduce(r1(), (acc, cur) => acc + cur, 0);
  t.is(r2, 6);
});

test(`slice`, t => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);
  const r2 = IterableSync.slice(r1(), 3, 5);
  const r2Data = IterableSync.toArray(r2);
  t.deepEqual(r2Data, [ 4, 5 ]);
});

test(`unique`, t => {
  const r1 = IterableSync.fromArray([ { v: 1 }, { v: 2 }, { v: 3 }, { v: 4 } ]);
  const r2 = IterableSync.toArray(IterableSync.unique(r1));
  t.deepEqual(r2, [ { v: 1 }, { v: 2 }, { v: 3 }, { v: 4 } ]);

  const v1 = { v: 5 };
  const r3 = IterableSync.fromArray([ { v: 1 }, v1, { v: 2 }, { v: 3 }, v1, { v: 4 } ]);
  const r4 = IterableSync.toArray(IterableSync.unique(r3));
  t.deepEqual(r4, [ { v: 1 }, v1, { v: 2 }, { v: 3 }, { v: 4 } ]);
});

test(`every`, t => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4, 5 ]);
  t.true(IterableSync.every(r1(), v => v < 10));
  t.false(IterableSync.every(r1(), v => v > 10));
});