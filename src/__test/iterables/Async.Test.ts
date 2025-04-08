import expect from 'expect';
import * as IterableAsync from '../../iterables/IterableAsync.js';
import { count } from '../../numbers/Count.js';
import * as Flow from '../../flow/index.js';
test(`repeat`, async () => {
  const r1 = await IterableAsync.toArray(IterableAsync.repeat(() => count(3), 3));
  expect(r1).toEqual([ 0, 1, 2, 0, 1, 2, 0, 1, 2 ]);
});

test(`max`, async () => {
  const d1 = [ 1, 2, 3, 4, 5 ];
  const r1 = IterableAsync.max(IterableAsync.fromArray(d1));
  const r1Array = await IterableAsync.toArray(r1);
  expect(r1Array).toEqual(d1);

  const r2 = IterableAsync.max(IterableAsync.fromArray([ 5, 4, 3, 2, 1 ]));
  const r2Array = await IterableAsync.toArray(r2);
  expect(r2Array).toEqual([ 5 ]);

  const r3 = IterableAsync.max(IterableAsync.fromArray([ 0, 2, 1, 0, 3 ]));
  const r3Array = await IterableAsync.toArray(r3);
  expect(r3Array).toEqual([ 0, 2, 3 ]);
});

test(`min`, async () => {
  const d1 = [ 1, 2, 3, 4, 5 ];
  const r1 = IterableAsync.min(IterableAsync.fromArray(d1));
  const r1Array = await IterableAsync.toArray(r1);
  expect(r1Array).toEqual([ 1 ]);

  const r2 = IterableAsync.min(IterableAsync.fromArray([ 5, 4, 3, 2, 1 ]));
  const r2Array = await IterableAsync.toArray(r2);
  expect(r2Array).toEqual([ 5, 4, 3, 2, 1 ]);

  const r3 = IterableAsync.min(IterableAsync.fromArray([ 0, 2, 1, 0, -3 ]));
  const r3Array = await IterableAsync.toArray(r3);
  expect(r3Array).toEqual([ 0, -3 ]);
});



test(`dropWhile`, async () => {
  const r1 = IterableAsync.dropWhile(IterableAsync.fromArray([ 1, 2, 3, 4 ]), e => e < 3);
  const r1Result = await IterableAsync.toArray(r1);
  expect(r1Result).toEqual([ 3, 4 ]);
});

test(`nextWithTimeout`, async done => {
  // Iterate through array 1min at a time
  const slow = () => IterableAsync.withDelay([ 1, 2, 3, 4 ], { secs: 1 });
  await t.throwsAsync(async () => {
    const v = await IterableAsync.nextWithTimeout(slow(), 200);
    done.fail(`Did not throw`);
  });
  await Flow.sleep(300);

  // Iterate through array 1min at a time
  const lessSlow = IterableAsync.withDelay([ 1, 2, 3, 4 ], 50);
  const v1 = await IterableAsync.nextWithTimeout(lessSlow, 200);
  const v2 = await IterableAsync.nextWithTimeout(lessSlow, 200);
  const v3 = await IterableAsync.nextWithTimeout(lessSlow, 200);
  const v4 = await IterableAsync.nextWithTimeout(lessSlow, 200);
  const v5 = await IterableAsync.nextWithTimeout(lessSlow, 200);
  expect(v1.value).toBe(1);
  expect(v2.value).toBe(2);
  expect(v3.value).toBe(3);
  expect(v4.value).toBe(4);
  expect(v5.done).toBe(true);
});

test(`until`, async () => {
  let triggered = 0;
  await IterableAsync.until(count(5), () => {
    triggered++;
  });
  expect(triggered).toBe(5);
});

test(`chunks`, async () => {
  //chunks([1,2,3,4,5,6,7,8,9,10], 3);
  // Yields [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
  const r1 = IterableAsync.chunks(IterableAsync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]), 3);
  const r1Data = await IterableAsync.toArray(r1);
  expect(r1Data).toEqual([ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ], [ 10 ] ]);
});

test(`filter`, async () => {
  const r1 = IterableAsync.filter(IterableAsync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]), v => v % 2 === 0);
  const r1Data = await IterableAsync.toArray(r1);
  expect(r1Data).toEqual([ 2, 4, 6, 8, 10 ]);
});

test(`fill`, async () => {
  const r1 = IterableAsync.fill(IterableAsync.fromArray([ 1, 2, 3, 4 ]), 10);
  const r1Data = await IterableAsync.toArray(r1);
  expect(r1Data).toEqual([ 10, 10, 10, 10 ]);
})


test(`concat`, async () => {
  const r1 = IterableAsync.fromArray([ 1, 2, 3, 4 ]);
  const r2 = IterableAsync.fromArray([ 5, 6, 7, 8 ]);

  const r3 = IterableAsync.concat(r1, r2);
  const r3Data = await IterableAsync.toArray(r3);
  expect(r3Data).toEqual([ 1, 2, 3, 4, 5, 6, 7, 8 ]);
});

test(`find`, async () => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4 ]);

  const r1a = await IterableAsync.find(r1(), v => v == 3);
  expect(r1a).toBe(3);
  const r1b = await IterableAsync.find(r1(), v => v == 5);
  expect(r1b).toBeFalsy();
});

test(`forEach`, async () => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4, 5 ]);
  let count = 0;
  await IterableAsync.forEach(r1(), () => {
    count++;
  });
  expect(count).toBe(5);

  count = 0;
  await IterableAsync.forEach(r1(), () => {
    count++;
    if (count == 2) return false;
  });
  expect(count).toBe(2);
});

test(`map`, async () => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4, 5 ]);
  const r2 = IterableAsync.map(r1(), v => `v:${ v }`);
  const r2Data = await IterableAsync.toArray(r2);
  expect(r2Data).toEqual([ `v:1`, `v:2`, `v:3`, `v:4`, `v:5` ]);
});

test(`flatten`, async () => {
  const r1 = () => IterableAsync.fromArray([ 1, [ 2, 3 ], [ [ 4 ] ] ]);
  const r2 = IterableAsync.flatten(r1());
  const r2Data = await IterableAsync.toArray(r2);
  expect(r2Data).toEqual([ 1, 2, 3, [ 4 ] ]);
})

test(`some`, async () => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4 ]);
  const r2 = await IterableAsync.some(r1(), v => v === 3);
  expect(r2).toBe(true);

  const r3 = await IterableAsync.some(r1(), v => v === 10);
  expect(r3).toBe(false);
});

test(`reduce`, async () => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3 ]);
  const r2 = await IterableAsync.reduce(r1(), (acc, cur) => acc + cur, 0);
  expect(r2).toBe(6);
});

test(`slice`, async () => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);
  const r2 = await IterableAsync.slice(r1(), 3, 5);
  const r2Data = await IterableAsync.toArray(r2);
  expect(r2Data).toEqual([ 4, 5 ]);
});

test(`unique`, async () => {
  const r1 = IterableAsync.fromArray([ { v: 1 }, { v: 2 }, { v: 3 }, { v: 4 } ]);
  const r2 = await IterableAsync.toArray(await IterableAsync.unique(r1));
  expect(r2).toEqual([ { v: 1 }, { v: 2 }, { v: 3 }, { v: 4 } ]);

  const v1 = { v: 5 };
  const r3 = IterableAsync.fromArray([ { v: 1 }, v1, { v: 2 }, { v: 3 }, v1, { v: 4 } ]);
  const r4 = await IterableAsync.toArray(await IterableAsync.unique(r3));
  expect(r4).toEqual([ { v: 1 }, v1, { v: 2 }, { v: 3 }, { v: 4 } ]);
});

test(`every`, async () => {
  const r1 = () => IterableAsync.fromArray([ 1, 2, 3, 4, 5 ]);
  expect(await IterableAsync.every(r1(), v => v < 10)).toBe(true);
  expect(await IterableAsync.every(r1(), v => v > 10)).toBe(false);
});