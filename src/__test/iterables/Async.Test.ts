import * as IterableAsync from '../../iterables/IterableAsync.js';
import test from 'ava';
import { count } from '../../numbers/Count.js';
import * as Flow from '../../flow/index.js';
test(`repeat`, async t => {
  const r1 = await IterableAsync.toArray(IterableAsync.repeat(() => count(3), 3));
  t.deepEqual(r1, [ 0, 1, 2, 0, 1, 2, 0, 1, 2 ]);
});

test(`max`, async t => {
  const d1 = [ 1, 2, 3, 4, 5 ];
  const r1 = IterableAsync.max(IterableAsync.fromArray(d1));
  const r1Array = await IterableAsync.toArray(r1);
  t.deepEqual(r1Array, d1);

  const r2 = IterableAsync.max(IterableAsync.fromArray([ 5, 4, 3, 2, 1 ]));
  const r2Array = await IterableAsync.toArray(r2);
  t.deepEqual(r2Array, [ 5 ]);

  const r3 = IterableAsync.max(IterableAsync.fromArray([ 0, 2, 1, 0, 3 ]));
  const r3Array = await IterableAsync.toArray(r3);
  t.deepEqual(r3Array, [ 0, 2, 3 ]);
});

test(`min`, async t => {
  const d1 = [ 1, 2, 3, 4, 5 ];
  const r1 = IterableAsync.min(IterableAsync.fromArray(d1));
  const r1Array = await IterableAsync.toArray(r1);
  t.deepEqual(r1Array, [ 1 ]);

  const r2 = IterableAsync.min(IterableAsync.fromArray([ 5, 4, 3, 2, 1 ]));
  const r2Array = await IterableAsync.toArray(r2);
  t.deepEqual(r2Array, [ 5, 4, 3, 2, 1 ]);

  const r3 = IterableAsync.min(IterableAsync.fromArray([ 0, 2, 1, 0, -3 ]));
  const r3Array = await IterableAsync.toArray(r3);
  t.deepEqual(r3Array, [ 0, -3 ]);
});



test(`dropWhile`, async t => {
  const r1 = IterableAsync.dropWhile(IterableAsync.fromArray([ 1, 2, 3, 4 ]), e => e < 3);
  const r1Result = await IterableAsync.toArray(r1);
  t.deepEqual(r1Result, [ 3, 4 ]);
});

test(`nextWithTimeout`, async t => {
  // Iterate through array 1min at a time
  const slow = () => IterableAsync.withDelay([ 1, 2, 3, 4 ], { secs: 1 });
  await t.throwsAsync(async () => {
    const v = await IterableAsync.nextWithTimeout(slow(), 200);
    t.fail(`Did not throw`);
  });
  await Flow.sleep(300);

  // Iterate through array 1min at a time
  const lessSlow = IterableAsync.withDelay([ 1, 2, 3, 4 ], 50);
  const v1 = await IterableAsync.nextWithTimeout(lessSlow, 200);
  const v2 = await IterableAsync.nextWithTimeout(lessSlow, 200);
  const v3 = await IterableAsync.nextWithTimeout(lessSlow, 200);
  const v4 = await IterableAsync.nextWithTimeout(lessSlow, 200);
  const v5 = await IterableAsync.nextWithTimeout(lessSlow, 200);
  t.is(v1.value, 1);
  t.is(v2.value, 2);
  t.is(v3.value, 3);
  t.is(v4.value, 4);
  t.is(v5.done, true);
});

test(`until`, async t => {
  let triggered = 0;
  await IterableAsync.until(count(5), () => {
    triggered++;
  });
  t.is(triggered, 5);
});

test(`chunks`, async t => {
  //chunks([1,2,3,4,5,6,7,8,9,10], 3);
  // Yields [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
  const r1 = IterableAsync.chunks(IterableAsync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]), 3);
  const r1Data = await IterableAsync.toArray(r1);
  t.deepEqual(r1Data, [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ], [ 10 ] ]);
});

test(`filter`, async t => {
  const r1 = IterableAsync.filter(IterableAsync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]), v => v % 2 === 0);
  const r1Data = await IterableAsync.toArray(r1);
  t.deepEqual(r1Data, [ 2, 4, 6, 8, 10 ]);
});

test(`fill`, async t => {
  const r1 = IterableAsync.fill(IterableAsync.fromArray([ 1, 2, 3, 4 ]), 10);
  const r1Data = await IterableAsync.toArray(r1);
  t.deepEqual(r1Data, [ 10, 10, 10, 10 ]);
})


test(`concat`, async t => {
  const r1 = IterableAsync.fromArray([ 1, 2, 3, 4 ]);
  const r2 = IterableAsync.fromArray([ 5, 6, 7, 8 ]);

  const r3 = IterableAsync.concat(r1, r2);
  const r3Data = await IterableAsync.toArray(r3);
  t.deepEqual(r3Data, [ 1, 2, 3, 4, 5, 6, 7, 8 ]);
});

test(`find`, async t => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4 ]);

  const r1a = await IterableAsync.find(r1(), v => v == 3);
  t.is(r1a, 3);
  const r1b = await IterableAsync.find(r1(), v => v == 5);
  t.falsy(r1b);
});

test(`forEach`, async t => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4, 5 ]);
  let count = 0;
  await IterableAsync.forEach(r1(), () => {
    count++;
  });
  t.is(count, 5);

  count = 0;
  await IterableAsync.forEach(r1(), () => {
    count++;
    if (count == 2) return false;
  });
  t.is(count, 2);
});

test(`map`, async t => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4, 5 ]);
  const r2 = IterableAsync.map(r1(), v => `v:${ v }`);
  const r2Data = await IterableAsync.toArray(r2);
  t.deepEqual(r2Data, [ `v:1`, `v:2`, `v:3`, `v:4`, `v:5` ]);
});

test(`flatten`, async t => {
  const r1 = () => IterableAsync.fromArray([ 1, [ 2, 3 ], [ [ 4 ] ] ]);
  const r2 = IterableAsync.flatten(r1());
  const r2Data = await IterableAsync.toArray(r2);
  t.deepEqual(r2Data, [ 1, 2, 3, [ 4 ] ]);
})

test(`some`, async t => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4 ]);
  const r2 = await IterableAsync.some(r1(), v => v === 3);
  t.true(r2);

  const r3 = await IterableAsync.some(r1(), v => v === 10);
  t.false(r3);
});

test(`reduce`, async t => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3 ]);
  const r2 = await IterableAsync.reduce(r1(), (acc, cur) => acc + cur, 0);
  t.is(r2, 6);
});

test(`slice`, async t => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);
  const r2 = await IterableAsync.slice(r1(), 3, 5);
  const r2Data = await IterableAsync.toArray(r2);
  t.deepEqual(r2Data, [ 4, 5 ]);
});

test(`unique`, async t => {
  const r1 = IterableAsync.fromArray([ { v: 1 }, { v: 2 }, { v: 3 }, { v: 4 } ]);
  const r2 = await IterableAsync.toArray(await IterableAsync.unique(r1));
  t.deepEqual(r2, [ { v: 1 }, { v: 2 }, { v: 3 }, { v: 4 } ]);

  const v1 = { v: 5 };
  const r3 = IterableAsync.fromArray([ { v: 1 }, v1, { v: 2 }, { v: 3 }, v1, { v: 4 } ]);
  const r4 = await IterableAsync.toArray(await IterableAsync.unique(r3));
  t.deepEqual(r4, [ { v: 1 }, v1, { v: 2 }, { v: 3 }, { v: 4 } ]);
});

test(`every`, async t => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4, 5 ]);
  t.true(await IterableAsync.every(r1(), v => v < 10));
  t.false(await IterableAsync.every(r1(), v => v > 10));
});