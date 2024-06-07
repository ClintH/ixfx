import test from 'ava';
import { QueueMutable } from '../../../collections/queue/QueueMutable.js';
import { asResponsive } from '../../../collections/queue/Responsive.js';
import { arrayValuesEqual } from '../../Include.js';
import { sleep } from '../../../flow/Sleep.js';
import { SyncWait } from '../../../flow/SyncWait.js';

test(`events`, async t => {
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
  t.deepEqual(lastEnqueueData, { added: [ `1` ], finalData: [ `1` ] });

  qm1.enqueue(`2`);
  await sw.forSignal();
  t.deepEqual(lastEnqueueData, { added: [ `2` ], finalData: [ `1`, `2` ] });


  const qm2 = new QueueMutable<string>();
  qm2.enqueue(`1`, `2`);

  qm2.addEventListener(`dequeue`, event => {
    lastDequeuedData = event;
    sw.signal();
  });

  qm2.dequeue();
  await sw.forSignal();
  t.deepEqual(lastDequeuedData, { removed: `1`, finalData: [ `2` ] });

  qm2.dequeue();
  await sw.forSignal();
  t.deepEqual(lastDequeuedData, { removed: `2`, finalData: [] });


  const qm3 = new QueueMutable<string>();
  qm3.enqueue(`1`, `2`);
  qm3.addEventListener(`removed`, event => {
    lastRemovedData = event;
    sw.signal();
  });

  qm3.clear();
  await sw.forSignal();
  t.deepEqual(lastRemovedData, { removed: [ `1`, `2` ], finalData: [] });

  qm3.enqueue(`3`, `4`, `5`);
  qm3.removeWhere(v => v === `4`);
  await sw.forSignal();
  t.deepEqual(lastRemovedData, { removed: [ `4` ], finalData: [ `3`, `5` ] });

});

// test(`responsive`, async t => {
//   const a = new QueueMutable<string>();
//   const r = asResponsive(a);

//   const seen: Array<ReadonlyArray<string>> = [];
//   r.value(value => {
//     seen.push(value);
//   });

//   a.enqueue(`1`);
//   await sleep(20);
//   console.log(seen);
//   t.is(seen, [ [ `1` ] ]);
// });

test(`basic`, (t) => {
  const a = new QueueMutable<string>();
  t.truthy(a.isEmpty);
  t.is(a.length, 0);
  t.falsy(a.isFull);
  t.falsy(a.peek);

  a.enqueue(`test0`);
  a.enqueue(`test1`);
  t.is(a.length, 2);
  t.falsy(a.isEmpty);
  t.falsy(a.isFull);

  arrayValuesEqual(t, a.data, [ `test0`, `test1` ]);
  t.is(a.peek, `test0`);

  const b = a.dequeue();
  t.is(a.length, 1);
  t.is(b, `test0`);

  const c = a.dequeue();
  t.true(a.isEmpty);
  t.is(a.length, 0);
  t.falsy(a.peek);
  t.is(c, `test1`);
});
