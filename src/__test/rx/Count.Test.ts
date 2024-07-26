import test from 'ava';
import * as Rx from '../../rx/index.js';
import * as Flow from '../../flow/index.js';
import { isApprox } from '../../numbers/IsApprox.js';
import * as Iter from '../../iterables/index.js';
test(`count`, async t => {
  // Test 1: limit
  const r1 = Rx.count({ amount: 5, interval: 1 });
  const r1Data = await Rx.toArray(r1);
  t.deepEqual(r1Data, [ 0, 1, 2, 3, 4 ]);

  // Test 2: offset
  const r2 = Rx.count({ offset: 20, amount: 5, interval: 1 });
  const r2Data = await Rx.toArray(r2);
  t.deepEqual(r2Data, [ 20, 21, 22, 23, 24 ]);

  // Test 5: interval
  const r5 = Rx.count({ amount: 5, interval: 200 });
  const r5Time = Flow.Elapsed.once();
  const r5Data = await Rx.toArray(r5);
  t.true(isApprox(0.1, 200 * 5, r5Time()), `Elapsed: ${ r5Time() }`);


})