import { test, expect } from 'vitest';
import { immutable } from '../../src/queue/queue-immutable.js';

test(`basic`, () => {
  const q = immutable<string>();

  // Initial
  expect(q.isEmpty).toBe(true);
  expect(q.length === 0).toBe(true);
  expect(q.isFull).toBe(false);
  expect(q.peek).toBeFalsy();

  const q1 = q.enqueue('a');

  // Immutability
  expect(q.isEmpty).toBe(true);
  expect(q.length === 0).toBe(true);
  expect(q.isFull).toBe(false);
  expect(q.peek).toBeFalsy();

  // Test added item
  expect(q1.isEmpty).toBe(false);
  expect(q1.peek === `a`).toBe(true);
  expect(q1.isFull).toBe(false);

  // Add more items
  const q2 = q1.enqueue('b', 'c', 'd');
  expect(q2.isEmpty).toBe(false);
  expect(q2.isFull).toBe(false);
  expect(q2.peek === `a`).toBe(true);
  expect(q2.length === 4).toBe(true);

  // Dequeue
  const q3 = q2.dequeue();
  expect(q3.length === 3).toBe(true);
  expect(q3.peek === `b`).toBe(true);
});

test(`bounded`, () => {
  // Front of queue is index 0, end of queue (newer items) are end of array
  // Bounded queue. Default is that new additions are ignored
  const a = immutable<string>({ capacity: 5 });
  expect(a.isEmpty).toBe(true);
  const b = a.enqueue(`test`);
  let c = b;

  for (let i = 0; i < 15; i++) {
    c = c.enqueue(`test` + i);

    // Queue peek always returns oldest item, not the latest
    expect(c.peek === `test`).toBe(true);

    if (i < 3) expect(c.isFull).toBe(false);
    else expect(c.isFull).toBe(true);
    expect(c.isEmpty).toBe(false);
  }

  // Test immutability and enqueing
  const d = c.dequeue().dequeue().enqueue(`new1`).enqueue(`new2`);
  expect(a.length === 0).toBe(true);
  expect(b.toArray()).toEqual([ `test` ]);
  expect(c.toArray()).toEqual([ `test`, `test0`, `test1`, `test2`, `test3` ]);
  expect(d.toArray()).toEqual([ `test1`, `test2`, `test3`, `new1`, `new2` ]);

  // Unbounded queue
  let a1 = immutable<string>();
  for (let i = 0; i < 15; i++) {
    a1 = a1.enqueue(`test` + i);
  }
  expect(a1.toArray()).toEqual([
    `test0`,
    `test1`,
    `test2`,
    `test3`,
    `test4`,
    `test5`,
    `test6`,
    `test7`,
    `test8`,
    `test9`,
    `test10`,
    `test11`,
    `test12`,
    `test13`,
    `test14`,
  ]);

  // Test different overflow logic

  // Discard additions: let something in
  let e = immutable<string>(
    { capacity: 4, discardPolicy: `additions` },
    `test0`,
    `test1`,
    `test2`
  );
  e = e.enqueue(`test3`, `test4`, `test5`); // Only test3 should make it in
  expect(e.toArray()).toEqual([ `test0`, `test1`, `test2`, `test3` ]);

  // Discard additions: already full
  e = immutable<string>(
    { capacity: 3, discardPolicy: `additions` },
    `test0`,
    `test1`,
    `test2`
  );
  e = e.enqueue(`test3`, `test4`, `test5`);
  expect(e.toArray()).toEqual([ `test0`, `test1`, `test2` ]);

  // Discard additions: let everything in
  e = immutable<string>(
    { capacity: 6, discardPolicy: `additions` },
    `test0`,
    `test1`,
    `test2`
  );
  e = e.enqueue(`test3`, `test4`, `test5`);
  expect(e.toArray()).toEqual([ `test0`, `test1`, `test2`, `test3`, `test4`, `test5` ]);

  // Older items are discarded (ie test0, test1) - partial flush
  let f = immutable<string>(
    { capacity: 4, discardPolicy: `older` },
    `test0`,
    `test1`,
    `test2`
  );
  f = f.enqueue(`test3`, `test4`, `test5`);
  expect(f.toArray()).toEqual([ `test2`, `test3`, `test4`, `test5` ]);

  // Older items are discarded (ie test0, test1) - complete flush
  f = immutable<string>(
    { capacity: 4, discardPolicy: `older` },
    `test0`,
    `test1`,
    `test2`
  );
  f = f.enqueue(`test3`, `test4`, `test5`, `test6`, `test7`);
  expect(f.toArray()).toEqual([ `test4`, `test5`, `test6`, `test7` ]);

  // Older items are discarded (ie test0, test1) - exact flush
  f = immutable<string>(
    { capacity: 3, discardPolicy: `older` },
    `test0`,
    `test1`,
    `test2`
  );
  f = f.enqueue(`test3`, `test4`, `test5`);
  expect(f.toArray()).toEqual([ `test3`, `test4`, `test5` ]);

  // Newer items are discarded (ie test1, test2) - partial flush
  let g = immutable<string>(
    { capacity: 4, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`, `test4`, `test5`);
  expect(g.toArray()).toEqual([ `test0`, `test1`, `test2`, `test5` ]);

  // Newer items are discarded (ie test1, test2) - complete flush
  g = immutable<string>(
    { capacity: 4, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`, `test4`, `test5`, `test6`, `test7`);
  expect(g.toArray()).toEqual([ `test4`, `test5`, `test6`, `test7` ]);

  // Newer items are discarded (ie test1, test2) - exact flush
  g = immutable<string>(
    { capacity: 3, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`, `test4`, `test5`);
  expect(g.toArray()).toEqual([ `test3`, `test4`, `test5` ]);

  // One item past capacity with newer
  g = immutable<string>(
    { capacity: 3, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`);
  expect(g.toArray()).toEqual([ `test0`, `test1`, `test3` ]);
});

test(`bounded-2`, () => {
  const capacity = 5;
  let q = immutable({ capacity });
  let xCount = 1;
  let yCount = 1;
  const gen = () => ({ x: xCount++, y: yCount++ });

  q = q.enqueue(gen());
  q = q.enqueue(gen());
  q = q.enqueue(gen());
  q = q.enqueue(gen());
  q = q.enqueue(gen());
  q = q.enqueue(gen());
  expect(q.length).toBe(capacity);
  expect(q.isFull).toBe(true);
  expect(q.toArray()).toEqual([
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 4 },
    { x: 5, y: 5 }
  ]);
});