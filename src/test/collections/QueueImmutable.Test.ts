/* eslint-disable */
import test from 'ava';
import { immutable } from '../../collections/queue/Queue.js';

test(`basic`, (t) => {
  const q = immutable<string>();

  // Initial
  t.true(q.isEmpty);
  t.true(q.length === 0);
  t.false(q.isFull);
  t.falsy(q.peek);

  const q1 = q.enqueue('a');

  // Immutability
  t.true(q.isEmpty);
  t.true(q.length === 0);
  t.false(q.isFull);
  t.falsy(q.peek);

  // Test added item
  t.false(q1.isEmpty);
  t.true(q1.peek === `a`);
  t.false(q1.isFull);

  // Add more items
  const q2 = q1.enqueue('b', 'c', 'd');
  t.false(q2.isEmpty);
  t.false(q2.isFull);
  t.true(q2.peek === `a`);
  t.true(q2.length === 4);

  // Dequeue
  const q3 = q2.dequeue();
  t.true(q3.length === 3);
  t.true(q3.peek === `b`);
});

test(`bounded`, (t) => {
  // Front of queue is index 0, end of queue (newer items) are end of array
  // Bounded queue. Default is that new additions are ignored
  const a = immutable<string>({ capacity: 5 });
  t.true(a.isEmpty);
  const b = a.enqueue(`test`);
  let c = b;

  for (let i = 0; i < 15; i++) {
    c = c.enqueue(`test` + i);

    // Queue peek always returns oldest item, not the latest
    t.true(c.peek === `test`);

    if (i < 3) t.false(c.isFull);
    else t.true(c.isFull);
    t.false(c.isEmpty);
  }

  // Test immutability and enqueing
  const d = c.dequeue().dequeue().enqueue(`new1`).enqueue(`new2`);
  t.true(a.length === 0);
  t.like(b.data, [`test`]);
  t.like(c.data, [`test`, `test0`, `test1`, `test2`, `test3`]);
  t.like(d.data, [`test1`, `test2`, `test3`, `new1`, `new2`]);

  // Unbounded queue
  let a1 = immutable<string>();
  for (let i = 0; i < 15; i++) {
    a1 = a1.enqueue(`test` + i);
  }
  t.like(a1.data, [
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
  t.like(e.data, [`test0`, `test1`, `test2`, `test3`]);

  // Discard additions: already full
  e = immutable<string>(
    { capacity: 3, discardPolicy: `additions` },
    `test0`,
    `test1`,
    `test2`
  );
  e = e.enqueue(`test3`, `test4`, `test5`);
  t.like(e.data, [`test0`, `test1`, `test2`]);

  // Discard additions: let everything in
  e = immutable<string>(
    { capacity: 6, discardPolicy: `additions` },
    `test0`,
    `test1`,
    `test2`
  );
  e = e.enqueue(`test3`, `test4`, `test5`);
  t.like(e.data, [`test0`, `test1`, `test2`, `test3`, `test4`, `test5`]);

  // Older items are discarded (ie test0, test1) - partial flush
  let f = immutable<string>(
    { capacity: 4, discardPolicy: `older` },
    `test0`,
    `test1`,
    `test2`
  );
  f = f.enqueue(`test3`, `test4`, `test5`);
  t.like(f.data, [`test2`, `test3`, `test4`, `test5`]);

  // Older items are discarded (ie test0, test1) - complete flush
  f = immutable<string>(
    { capacity: 4, discardPolicy: `older` },
    `test0`,
    `test1`,
    `test2`
  );
  f = f.enqueue(`test3`, `test4`, `test5`, `test6`, `test7`);
  t.like(f.data, [`test4`, `test5`, `test6`, `test7`]);

  // Older items are discarded (ie test0, test1) - exact flush
  f = immutable<string>(
    { capacity: 3, discardPolicy: `older` },
    `test0`,
    `test1`,
    `test2`
  );
  f = f.enqueue(`test3`, `test4`, `test5`);
  t.like(f.data, [`test3`, `test4`, `test5`]);

  // Newer items are discarded (ie test1, test2) - partial flush
  let g = immutable<string>(
    { capacity: 4, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`, `test4`, `test5`);
  t.like(g.data, [`test0`, `test1`, `test2`, `test5`]);

  // Newer items are discarded (ie test1, test2) - complete flush
  g = immutable<string>(
    { capacity: 4, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`, `test4`, `test5`, `test6`, `test7`);
  t.like(g.data, [`test4`, `test5`, `test6`, `test7`]);

  // Newer items are discarded (ie test1, test2) - exact flush
  g = immutable<string>(
    { capacity: 3, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`, `test4`, `test5`);
  t.like(g.data, [`test3`, `test4`, `test5`]);

  // One item past capacity with newer
  g = immutable<string>(
    { capacity: 3, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`);
  t.like(g.data, [`test0`, `test1`, `test3`]);
});
