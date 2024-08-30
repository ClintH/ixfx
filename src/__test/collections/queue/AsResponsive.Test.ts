import test from "ava";
import { QueueMutable } from "../../../collections/queue/QueueMutable.js";
import { asResponsive } from "../../../collections/queue/Responsive.js";
import { SyncWait } from "../../../flow/SyncWait.js";

test(`responsive`, async t => {
  const qm1 = new QueueMutable<string>();
  const r1 = asResponsive(qm1);
  const sw = new SyncWait();

  let seen: Array<ReadonlyArray<string>> = [];
  const off = r1.onValue(value => {
    seen.push(value);
    sw.signal();
  });


  // Enqueuing
  qm1.enqueue(`1`);
  await sw.forSignal();
  t.deepEqual(seen, [ [], [ `1` ] ]);

  qm1.enqueue(`2`);
  await sw.forSignal();
  t.deepEqual(seen, [ [], [ `1` ], [ `1`, `2` ] ]);

  // Enqueuing multiple
  qm1.enqueue(`3`, `4`);
  await sw.forSignal();
  t.deepEqual(seen, [ [], [ `1` ], [ `1`, `2` ], [ `1`, `2`, `3`, `4` ] ]);

  // Dequeuing
  seen = []; // Reset changelog
  qm1.dequeue();
  await sw.forSignal();
  t.deepEqual(seen, [ [ `2`, `3`, `4` ] ]);

  // Clearing
  qm1.clear();
  await sw.forSignal();
  t.deepEqual(seen, [ [ `2`, `3`, `4` ], [] ]);

  // Adding
  seen = [];
  r1.set([ `5`, `6`, `7` ]);
  await sw.forSignal();
  t.deepEqual(seen, [ [ `5`, `6`, `7` ] ]);

  off();

});