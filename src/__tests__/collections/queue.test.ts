/* eslint-disable */

import {queue, queueMutable} from '../../collections/Queue.js';

test(`queue-mutable`, () => {
  const a = queueMutable<string>();
  expect(a.isEmpty).toBeTruthy();
  expect(a.length).toEqual(0);
  expect(a.isFull).toBeFalsy();
  expect(a.peek).toBeUndefined();

  a.enqueue(`test0`);
  a.enqueue(`test1`);
  expect(a.length).toEqual(2);
  expect(a.isEmpty).toBeFalsy();
  expect(a.isFull).toBeFalsy();

  expect(a.data).toEqual([`test0`, `test1`]);
  expect(a.peek).toEqual(`test0`);

  let b = a.dequeue();
  expect(a.length).toEqual(1);
  expect(b).toEqual(`test0`);

  b = a.dequeue();
  expect(a.isEmpty).toBeTruthy();
  expect(a.length).toEqual(0);
  expect(a.peek).toBeUndefined();
  expect(b).toEqual(`test1`);
});

test(`queue`, () => {
  // Front of queue is index 0, end of queue (newer items) are end of array

  // Bounded queue. Default is that new additions are ignored
  const a = queue<string>({capacity: 5});
  expect(a.isEmpty).toBeTruthy();
  const b = a.enqueue(`test`);
  let c = b;
  for (let i = 0; i < 15; i++) {
    c = c.enqueue(`test` + i);

    // Queue peek always returns oldest item, not the latest
    expect(c.peek).toEqual(`test`);

    if (i < 3) expect(c.isFull).toBeFalsy();
    else expect(c.isFull).toBeTruthy();
    expect(c.isEmpty).toBeFalsy();
  }

  // Test immutability and enqueing
  const d = c.dequeue().dequeue().enqueue(`new1`).enqueue(`new2`);
  expect(a.length).toEqual(0);
  expect(b.data).toEqual([`test`]);
  expect(c.data).toEqual([`test`, `test0`, `test1`, `test2`, `test3`]);
  expect(d.data).toEqual([`test1`, `test2`, `test3`, `new1`, `new2`]);

  // Unbounded queue
  let a1 = queue<string>();
  for (let i = 0; i < 15; i++) {
    a1 = a1.enqueue(`test` + i);
  }
  expect(a1.data).toEqual([`test0`, `test1`, `test2`, `test3`, `test4`, `test5`, `test6`, `test7`, `test8`, `test9`, `test10`, `test11`, `test12`, `test13`, `test14`]);

  // Test different overflow logic

  // Discard additions: let something in
  let e = queue<string>({capacity: 4, discardPolicy: `additions`}, `test0`, `test1`, `test2`);
  e = e.enqueue(`test3`, `test4`, `test5`); // Only test3 should make it in
  expect(e.data).toEqual([`test0`, `test1`, `test2`, `test3`]);

  // Discard additions: already full
  e = queue<string>({capacity: 3, discardPolicy: `additions`}, `test0`, `test1`, `test2`);
  e = e.enqueue(`test3`, `test4`, `test5`);
  expect(e.data).toEqual([`test0`, `test1`, `test2`]);

  // Discard additions: let everything in
  e = queue<string>({capacity: 6, discardPolicy: `additions`}, `test0`, `test1`, `test2`);
  e = e.enqueue(`test3`, `test4`, `test5`);
  expect(e.data).toEqual([`test0`, `test1`, `test2`, `test3`, `test4`, `test5`]);

  // Older items are discarded (ie test0, test1) - partial flush
  let f = queue<string>({capacity: 4, discardPolicy: `older`}, `test0`, `test1`, `test2`);
  f = f.enqueue(`test3`, `test4`, `test5`);
  expect(f.data).toEqual([`test2`, `test3`, `test4`, `test5`]);

  // Older items are discarded (ie test0, test1) - complete flush
  f = queue<string>({capacity: 4, discardPolicy: `older`}, `test0`, `test1`, `test2`);
  f = f.enqueue(`test3`, `test4`, `test5`, `test6`, `test7`);
  expect(f.data).toEqual([`test4`, `test5`, `test6`, `test7`]);

  // Older items are discarded (ie test0, test1) - exact flush
  f = queue<string>({capacity: 3, discardPolicy: `older`}, `test0`, `test1`, `test2`);
  f = f.enqueue(`test3`, `test4`, `test5`);
  expect(f.data).toEqual([`test3`, `test4`, `test5`]);

  // Newer items are discarded (ie test1, test2) - partial flush
  let g = queue<string>({capacity: 4, discardPolicy: `newer`}, `test0`, `test1`, `test2`);
  g = g.enqueue(`test3`, `test4`, `test5`); // Only `test2` should survive from original
  expect(g.data).toEqual([`test0`, `test3`, `test4`, `test5`]);

  // Newer items are discarded (ie test1, test2) - complete flush
  g = queue<string>({capacity: 4, discardPolicy: `newer`}, `test0`, `test1`, `test2`);
  g = g.enqueue(`test3`, `test4`, `test5`, `test6`, `test7`);
  expect(g.data).toEqual([`test4`, `test5`, `test6`, `test7`]);

  // Newer items are discarded (ie test1, test2) - exact flush
  g = queue<string>({capacity: 3, discardPolicy: `newer`}, `test0`, `test1`, `test2`);
  g = g.enqueue(`test3`, `test4`, `test5`);
  expect(g.data).toEqual([`test3`, `test4`, `test5`]);

});
