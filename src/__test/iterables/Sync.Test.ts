import expect from 'expect';
import * as IterableSync from '../../iterables/IterableSync.js';
import { count } from '../../numbers/Count.js';
test(`until`, () => {
  let triggered = 0;
  IterableSync.until(count(5), () => {
    triggered++;
  });
  expect(triggered).toBe(5);
});

test(`chunks`, async () => {
  //chunks([1,2,3,4,5,6,7,8,9,10], 3);
  // Yields [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
  const r1 = IterableSync.chunks(IterableSync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]), 3);
  const r1Data = IterableSync.toArray(r1);
  expect(r1Data).toEqual([ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ], [ 10 ] ]);
});

test(`chunksOverlapping`, () => {
  const a = [ 1, 2, 3, 4, 5 ];

  const t1 = Array.from(IterableSync.chunksOverlapping(a, 2));
  expect(t1).toEqual([ [ 1, 2 ], [ 2, 3 ], [ 3, 4 ], [ 4, 5 ] ]);

  expect(() => Array.from(IterableSync.chunksOverlapping(a, 1))).toThrow();

  const t3 = Array.from(IterableSync.chunksOverlapping(a, 3));
  expect(t3).toEqual([ [ 1, 2, 3 ], [ 3, 4, 5 ] ]);

  const b: number[] = [];
  const t4 = Array.from(IterableSync.chunksOverlapping(b, 2));
  expect(t4.length).toBe(0);

});

test(`max`, () => {
  const d1 = [ 1, 2, 3, 4, 5 ];
  const r1 = IterableSync.max(IterableSync.fromArray(d1));
  const r1Array = IterableSync.toArray(r1);
  expect(r1Array).toEqual(d1);

  const r2 = IterableSync.max(IterableSync.fromArray([ 5, 4, 3, 2, 1 ]));
  const r2Array = IterableSync.toArray(r2);
  expect(r2Array).toEqual([ 5 ]);

  const r3 = IterableSync.max(IterableSync.fromArray([ 0, 2, 1, 0, 3 ]));
  const r3Array = IterableSync.toArray(r3);
  expect(r3Array).toEqual([ 0, 2, 3 ]);
});

test(`min`, () => {
  const d1 = [ 1, 2, 3, 4, 5 ];
  const r1 = IterableSync.min(IterableSync.fromArray(d1));
  const r1Array = IterableSync.toArray(r1);
  expect(r1Array).toEqual([ 1 ]);

  const r2 = IterableSync.min(IterableSync.fromArray([ 5, 4, 3, 2, 1 ]));
  const r2Array = IterableSync.toArray(r2);
  expect(r2Array).toEqual([ 5, 4, 3, 2, 1 ]);

  const r3 = IterableSync.min(IterableSync.fromArray([ 0, 2, 1, 0, -3 ]));
  const r3Array = IterableSync.toArray(r3);
  expect(r3Array).toEqual([ 0, -3 ]);
});

test(`dropWhile`, () => {
  const r1 = IterableSync.dropWhile(IterableSync.fromArray([ 1, 2, 3, 4 ]), e => e < 3);
  const r1Result = IterableSync.toArray(r1);
  expect(r1Result).toEqual([ 3, 4 ]);
});
test(`filter`, () => {
  const r1 = IterableSync.filter(IterableSync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]), v => v % 2 === 0);
  const r1Data = IterableSync.toArray(r1);
  expect(r1Data).toEqual([ 2, 4, 6, 8, 10 ]);
});

test(`fill`, () => {
  const r1 = IterableSync.fill(IterableSync.fromArray([ 1, 2, 3, 4 ]), 10);
  const r1Data = IterableSync.toArray(r1);
  expect(r1Data).toEqual([ 10, 10, 10, 10 ]);
})

test(`concat`, () => {
  const r1 = IterableSync.fromArray([ 1, 2, 3, 4 ]);
  const r2 = IterableSync.fromArray([ 5, 6, 7, 8 ]);

  const r3 = IterableSync.concat(r1, r2);
  const r3Data = IterableSync.toArray(r3);
  expect(r3Data).toEqual([ 1, 2, 3, 4, 5, 6, 7, 8 ]);
});

test(`find`, () => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4 ]);

  const r1a = IterableSync.find(r1(), v => v == 3);
  expect(r1a).toBe(3);
  const r1b = IterableSync.find(r1(), v => v == 5);
  expect(r1b).toBeFalsy();
});

test(`forEach`, () => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4, 5 ]);
  let count = 0;
  IterableSync.forEach(r1(), () => {
    count++;
  });
  expect(count).toBe(5);

  count = 0;
  IterableSync.forEach(r1(), () => {
    count++;
    if (count == 2) return false;
  });
  expect(count).toBe(2);
});

test(`map`, () => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4, 5 ]);
  const r2 = IterableSync.map(r1(), v => `v:${ v }`);
  const r2Data = IterableSync.toArray(r2);
  expect(r2Data).toEqual([ `v:1`, `v:2`, `v:3`, `v:4`, `v:5` ]);
});

test(`flatten`, () => {
  const r1 = () => IterableSync.fromArray([ 1, [ 2, 3 ], [ [ 4 ] ] ]);
  const r2 = IterableSync.flatten(r1());
  const r2Data = IterableSync.toArray(r2);
  expect(r2Data).toEqual([ 1, 2, 3, [ 4 ] ]);
})

test(`some`, () => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4 ]);
  const r2 = IterableSync.some(r1(), v => v === 3);
  expect(r2).toBe(true);

  const r3 = IterableSync.some(r1(), v => v === 10);
  expect(r3).toBe(false);
});

test(`reduce`, () => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3 ]);
  const r2 = IterableSync.reduce(r1(), (acc, cur) => acc + cur, 0);
  expect(r2).toBe(6);
});

test(`slice`, () => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);
  const r2 = IterableSync.slice(r1(), 3, 5);
  const r2Data = IterableSync.toArray(r2);
  expect(r2Data).toEqual([ 4, 5 ]);
});

test(`unique`, () => {
  const r1 = IterableSync.fromArray([ { v: 1 }, { v: 2 }, { v: 3 }, { v: 4 } ]);
  const r2 = IterableSync.toArray(IterableSync.unique(r1));
  expect(r2).toEqual([ { v: 1 }, { v: 2 }, { v: 3 }, { v: 4 } ]);

  const v1 = { v: 5 };
  const r3 = IterableSync.fromArray([ { v: 1 }, v1, { v: 2 }, { v: 3 }, v1, { v: 4 } ]);
  const r4 = IterableSync.toArray(IterableSync.unique(r3));
  expect(r4).toEqual([ { v: 1 }, v1, { v: 2 }, { v: 3 }, { v: 4 } ]);
});

test(`every`, () => {
  const r1 = () => IterableSync.fromArray([ 1, 2, 3, 4, 5 ]);
  expect(IterableSync.every(r1(), v => v < 10)).toBe(true);
  expect(IterableSync.every(r1(), v => v > 10)).toBe(false);
});