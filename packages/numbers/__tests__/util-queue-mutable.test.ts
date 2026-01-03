/* eslint-disable unicorn/prevent-abbreviations */
import { test, expect } from 'vitest';
import { BasicQueueMutable } from '../src/util/queue-mutable.js';

test(`test`, () => {
  const q = new BasicQueueMutable<number>();
  expect(q.size).toBe(0);
  expect(q.data).toStrictEqual([]);
  expect(q.dequeue()).toBeFalsy();

  q.enqueue(1);
  q.enqueue(2);
  expect(q.size).toBe(2);
  expect(q.data).toStrictEqual([ 1, 2 ]);

  expect(q.dequeue()).toBe(1);
  expect(q.data).toStrictEqual([ 2 ]);
  expect(q.size).toBe(1);

});
