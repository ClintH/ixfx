import { test, expect } from 'vitest';
import { QueueImmutable, immutable } from '../../src/queue/queue-immutable.js';
//import { arrayValuesEqual } from '../../../../src/__test/Include.js';

test(`basic`, () => {
  // Front of queue is index 0, end of queue (newer items) are end of array

  // Bounded queue. Default is that new additions are ignored
  const a = new QueueImmutable<string>({ capacity: 5 });
  expect(a.isEmpty).toBe(true);
  const b = a.enqueue(`test`);
  let c = b;
  for (let i = 0; i < 15; i++) {
    c = c.enqueue(`test` + i);

    // Queue peek always returns oldest item, not the latest
    expect(c.peek).toBe(`test`);

    if (i < 3) expect(c.isFull).toBeFalsy();
    else expect(c.isFull).toBeTruthy();
    expect(c.isEmpty).toBeFalsy();
  }

  // Test immutability and enqueing
  const d = c.dequeue().dequeue().enqueue(`new1`).enqueue(`new2`);
  expect(a.length).toBe(0);
  expect(b.toArray()).toEqual([ `test` ]);
  expect(c.toArray()).toEqual([ `test`, `test0`, `test1`, `test2`, `test3` ]);
  expect(d.toArray()).toEqual([ `test1`, `test2`, `test3`, `new1`, `new2` ]);
});

test(`unbounded`, () => {
  // Unbounded queue
  let a1 = new QueueImmutable<string>();
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
});

test(`bounded`, () => {
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
});

test(`unbounded-additions`, () => {
  // Discard additions: already full
  let e = immutable<string>(
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
  expect(e.toArray()).toEqual([
    `test0`,
    `test1`,
    `test2`,
    `test3`,
    `test4`,
    `test5`,
  ]);
});

test(`unbounded-older`, () => {
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
});

test(`unbounded-newer`, () => {
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
