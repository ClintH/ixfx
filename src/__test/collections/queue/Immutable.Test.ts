/* eslint-disable */
import test from 'ava';
import {
  QueueImmutable,
  immutable,
} from '../../../collections/queue/QueueImmutable.js';
import { arrayValuesEqual } from '../../Include.js';

test(`basic`, (t) => {
  // Front of queue is index 0, end of queue (newer items) are end of array

  // Bounded queue. Default is that new additions are ignored
  const a = new QueueImmutable<string>({ capacity: 5 });
  t.true(a.isEmpty);
  const b = a.enqueue(`test`);
  let c = b;
  for (let i = 0; i < 15; i++) {
    c = c.enqueue(`test` + i);

    // Queue peek always returns oldest item, not the latest
    t.is(c.peek, `test`);

    if (i < 3) t.falsy(c.isFull);
    else t.truthy(c.isFull);
    t.falsy(c.isEmpty);
  }

  // Test immutability and enqueing
  const d = c.dequeue().dequeue().enqueue(`new1`).enqueue(`new2`);
  t.is(a.length, 0);
  arrayValuesEqual(t, b.data, [ `test` ]);
  arrayValuesEqual(t, c.data, [ `test`, `test0`, `test1`, `test2`, `test3` ]);
  arrayValuesEqual(t, d.data, [ `test1`, `test2`, `test3`, `new1`, `new2` ]);
});

test(`unbounded`, (t) => {
  // Unbounded queue
  let a1 = new QueueImmutable<string>();
  for (let i = 0; i < 15; i++) {
    a1 = a1.enqueue(`test` + i);
  }
  arrayValuesEqual(t, a1.data, [
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

test(`bounded`, (t) => {
  // Test different overflow logic

  // Discard additions: let something in
  let e = immutable<string>(
    { capacity: 4, discardPolicy: `additions` },
    `test0`,
    `test1`,
    `test2`
  );
  e = e.enqueue(`test3`, `test4`, `test5`); // Only test3 should make it in
  arrayValuesEqual(t, e.data, [ `test0`, `test1`, `test2`, `test3` ]);
});

test(`unbounded-additions`, (t) => {
  // Discard additions: already full
  let e = immutable<string>(
    { capacity: 3, discardPolicy: `additions` },
    `test0`,
    `test1`,
    `test2`
  );
  e = e.enqueue(`test3`, `test4`, `test5`);
  arrayValuesEqual(t, e.data, [ `test0`, `test1`, `test2` ]);

  // Discard additions: let everything in
  e = immutable<string>(
    { capacity: 6, discardPolicy: `additions` },
    `test0`,
    `test1`,
    `test2`
  );
  e = e.enqueue(`test3`, `test4`, `test5`);
  arrayValuesEqual(t, e.data, [
    `test0`,
    `test1`,
    `test2`,
    `test3`,
    `test4`,
    `test5`,
  ]);
});

test(`unbounded-older`, (t) => {
  // Older items are discarded (ie test0, test1) - partial flush
  let f = immutable<string>(
    { capacity: 4, discardPolicy: `older` },
    `test0`,
    `test1`,
    `test2`
  );
  f = f.enqueue(`test3`, `test4`, `test5`);
  arrayValuesEqual(t, f.data, [ `test2`, `test3`, `test4`, `test5` ]);

  // Older items are discarded (ie test0, test1) - complete flush
  f = immutable<string>(
    { capacity: 4, discardPolicy: `older` },
    `test0`,
    `test1`,
    `test2`
  );
  f = f.enqueue(`test3`, `test4`, `test5`, `test6`, `test7`);
  arrayValuesEqual(t, f.data, [ `test4`, `test5`, `test6`, `test7` ]);

  // Older items are discarded (ie test0, test1) - exact flush
  f = immutable<string>(
    { capacity: 3, discardPolicy: `older` },
    `test0`,
    `test1`,
    `test2`
  );
  f = f.enqueue(`test3`, `test4`, `test5`);
  arrayValuesEqual(t, f.data, [ `test3`, `test4`, `test5` ]);
});

test(`unbounded-newer`, (t) => {
  // Newer items are discarded (ie test1, test2) - partial flush
  let g = immutable<string>(
    { capacity: 4, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`, `test4`, `test5`);
  arrayValuesEqual(t, g.data, [ `test0`, `test1`, `test2`, `test5` ]);

  // Newer items are discarded (ie test1, test2) - complete flush
  g = immutable<string>(
    { capacity: 4, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`, `test4`, `test5`, `test6`, `test7`);
  arrayValuesEqual(t, g.data, [ `test4`, `test5`, `test6`, `test7` ]);

  // Newer items are discarded (ie test1, test2) - exact flush
  g = immutable<string>(
    { capacity: 3, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`, `test4`, `test5`);
  arrayValuesEqual(t, g.data, [ `test3`, `test4`, `test5` ]);

  // One item past capacity with newer
  g = immutable<string>(
    { capacity: 3, discardPolicy: `newer` },
    `test0`,
    `test1`,
    `test2`
  );
  g = g.enqueue(`test3`);
  arrayValuesEqual(t, g.data, [ `test0`, `test1`, `test3` ]);
});
