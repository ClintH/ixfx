import { test, expect } from 'vitest';
import { QueueMutable } from '../../src/queue/queue-mutable.js';

import { SyncWait } from '../sync-wait.js';

test(`events`, async () => {
  const qm1 = new QueueMutable<string>();
  const sw = new SyncWait();

  let lastEnqueueData: { added: ReadonlyArray<string>, finalData: ReadonlyArray<string> } = { added: [], finalData: [] };
  let lastRemovedData: { removed: ReadonlyArray<string>, finalData: ReadonlyArray<string> } = { removed: [], finalData: [] };
  let lastDequeuedData: { removed: string, finalData: ReadonlyArray<string> } = { removed: ``, finalData: [] };

  qm1.addEventListener(`enqueue`, event => {
    lastEnqueueData = event;
    sw.signal();
  });

  qm1.enqueue(`1`);
  await sw.forSignal();
  expect(lastEnqueueData).toEqual({ added: [ `1` ], finalData: [ `1` ] });

  qm1.enqueue(`2`);
  await sw.forSignal();
  expect(lastEnqueueData).toEqual({ added: [ `2` ], finalData: [ `1`, `2` ] });


  const qm2 = new QueueMutable<string>();
  qm2.enqueue(`1`, `2`);

  qm2.addEventListener(`dequeue`, event => {
    lastDequeuedData = event;
    sw.signal();
  });

  qm2.dequeue();
  await sw.forSignal();
  expect(lastDequeuedData).toEqual({ removed: `1`, finalData: [ `2` ] });

  qm2.dequeue();
  await sw.forSignal();
  expect(lastDequeuedData).toEqual({ removed: `2`, finalData: [] });

  const qm3 = new QueueMutable<string>();
  qm3.enqueue(`1`, `2`);
  qm3.addEventListener(`removed`, event => {
    lastRemovedData = event;
    sw.signal();
  });

  qm3.clear();
  await sw.forSignal();
  expect(lastRemovedData).toEqual({ removed: [ `1`, `2` ], finalData: [] });

  qm3.enqueue(`3`, `4`, `5`);
  qm3.removeWhere(v => v === `4`);
  await sw.forSignal();
  expect(lastRemovedData).toEqual({ removed: [ `4` ], finalData: [ `3`, `5` ] });
});

test(`basic`, () => {
  const a = new QueueMutable<string>();
  expect(a.isEmpty).toBeTruthy();
  expect(a.length).toBe(0);
  expect(a.isFull).toBeFalsy();
  expect(a.peek).toBeFalsy();

  a.enqueue(`test0`);
  a.enqueue(`test1`);
  expect(a.length).toBe(2);
  expect(a.isEmpty).toBeFalsy();
  expect(a.isFull).toBeFalsy();

  expect(a.data).toEqual([ `test0`, `test1` ]);
  expect(a.peek).toBe(`test0`);

  const b = a.dequeue();
  expect(a.length).toBe(1);
  expect(b).toBe(`test0`);

  const c = a.dequeue();
  expect(a.isEmpty).toBe(true);
  expect(a.length).toBe(0);
  expect(a.peek).toBeFalsy();
  expect(c).toBe(`test1`);
});
