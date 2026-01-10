import { expect, test } from 'vitest';

import { mutable } from '../../src/queue/queue-mutable.js';

test(`remove`, () => {
  const a = mutable<string>();
  a.enqueue(`test0`, `test1`, `test2`, `test3`, `test4`);
  expect(a.toArray()).toEqual([ `test0`, `test1`, `test2`, `test3`, `test4` ]);
  expect(a.length).toBe(5);
  expect(a.peek).toBe(`test0`);

  const l = a.removeWhere(v => v === `test2`);
  expect(l).toBe(1);

  expect(a.toArray()).toEqual([ `test0`, `test1`, `test3`, `test4` ]);
});

test(`basic`, () => {
  const a = mutable<string>();

  // Check initial state
  expect(a.isEmpty).toBe(true);
  expect(a.length === 0).toBe(true);
  expect(a.isFull).toBe(false);
  expect(a.peek).toBeFalsy();

  // Add two things
  expect(a.enqueue(`test0`) === 1).toBe(true);
  expect(a.enqueue(`test1`) === 2).toBe(true);

  expect(a.length === 2).toBe(true);
  expect(a.isEmpty).toBe(false);
  expect(a.isFull).toBe(false);

  expect(a.toArray()).toEqual([ `test0`, `test1` ]);
  expect(a.peek === `test0`).toBe(true);

  // Remove from front of queue
  let b = a.dequeue();
  expect(a.length === 1).toBe(true);
  expect(b === `test0`).toBe(true);

  // Remove again, queue is empty
  b = a.dequeue();
  expect(a.isEmpty).toBe(true);
  expect(a.length === 0).toBe(true);
  expect(a.peek).toBeFalsy();
  expect(b === `test1`).toBe(true);

  // Add multiple
  a.enqueue('test2', 'test3', 'test4');
  expect(a.length === 3).toBe(true);
  expect(a.peek === 'test2').toBe(true);
});

test('bounded older', () => {
  const qOlder1 = mutable<string>({ capacity: 3, discardPolicy: 'older' });
  const qOlder2 = mutable<string>({ capacity: 3, discardPolicy: 'older' });

  // Add as a batch
  qOlder1.enqueue(`a`, `b`, `c`, `d`);

  // Add sequentially
  qOlder2.enqueue(`a`);
  qOlder2.enqueue(`b`);
  qOlder2.enqueue(`c`);
  qOlder2.enqueue(`d`);

  expect(qOlder1.length === 3).toBe(true);
  expect(qOlder1.isFull).toBe(true);
  expect(qOlder1.toArray()).toEqual([ `b`, `c`, `d` ]);
  expect(qOlder2.length === 3).toBe(true);
  expect(qOlder2.isFull).toBe(true);
  expect(qOlder2.toArray()).toEqual([ `b`, `c`, `d` ]);

  qOlder1.enqueue(`e`, `f`, `g`);
  qOlder2.enqueue(`e`);
  qOlder2.enqueue(`f`);
  qOlder2.enqueue(`g`);

  expect(qOlder1.toArray()).toEqual([ `e`, `f`, `g` ]);
  expect(qOlder1.length === 3).toBe(true);
  expect(qOlder1.isFull).toBe(true);

  expect(qOlder2.toArray()).toEqual([ `e`, `f`, `g` ]);
  expect(qOlder2.length === 3).toBe(true);
  expect(qOlder2.isFull).toBe(true);
});

test('bounded newer', () => {
  const q1 = mutable<string>({
    capacity: 3,
    discardPolicy: 'newer',
  });
  const q2 = mutable<string>({
    capacity: 3,
    discardPolicy: 'newer',
  });

  // Add as batch
  q1.enqueue(`a`, `b`, `c`, `d`);
  expect(q1.length === 3).toBe(true);
  expect(q1.isFull).toBe(true);
  expect(q1.toArray()).toEqual([ `a`, `b`, `d` ]);

  // Add in series
  q2.enqueue(`a`);
  q2.enqueue(`b`);
  q2.enqueue(`c`);
  q2.enqueue(`d`);
  expect(q2.length === 3).toBe(true);
  expect(q2.isFull).toBe(true);
  expect(q2.toArray()).toEqual([ `a`, `b`, `d` ]);

  // Batch
  q1.enqueue(`e`, `f`);
  expect(q1.toArray()).toEqual([ `a`, `b`, `f` ]);
  expect(q1.length === 3).toBe(true);
  expect(q1.isFull).toBe(true);

  // Sequence
  q2.enqueue(`e`);
  q2.enqueue(`f`);
  expect(q2.toArray()).toEqual([ `a`, `b`, `f` ]);
  expect(q2.length === 3).toBe(true);
  expect(q2.isFull).toBe(true);
});

test('bounded additions', () => {
  const q1 = mutable<string>({
    capacity: 3,
    discardPolicy: 'additions',
  });
  q1.enqueue(`a`, `b`, `c`, `d`);
  expect(q1.length === 3).toBe(true);
  expect(q1.isFull).toBe(true);
  expect(q1.toArray()).toEqual([ `a`, `b`, `c` ]);

  const q2 = mutable<string>({ capacity: 3, discardPolicy: 'additions' });
  q2.enqueue(`a`);
  q2.enqueue(`b`);
  q2.enqueue(`c`);
  q2.enqueue(`d`);
  expect(q2.length === 3).toBe(true);
  expect(q2.isFull).toBe(true);
  expect(q2.toArray()).toEqual([ `a`, `b`, `c` ]);

  q1.enqueue(`e`, `f`, `g`);
  expect(q1.toArray()).toEqual([ `a`, `b`, `c` ]);
  expect(q1.length === 3).toBe(true);
  expect(q1.isFull).toBe(true);

  q2.enqueue(`e`);
  q2.enqueue(`f`);
  q2.enqueue(`g`);
  expect(q2.toArray()).toEqual([ `a`, `b`, `c` ]);
  expect(q2.length === 3).toBe(true);
  expect(q2.isFull).toBe(true);

  q1.dequeue();
  expect(q1.length === 2).toBe(true);
  expect(q1.isFull).toBe(false);
  expect(q1.peek === `b`).toBe(true);

  q2.dequeue();
  expect(q2.length === 2).toBe(true);
  expect(q2.isFull).toBe(false);
  expect(q2.peek === `b`).toBe(true);
});
