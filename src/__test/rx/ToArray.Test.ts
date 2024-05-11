import test from 'ava';
import * as Rx from '../../rx/index.js';
import * as Flow from '../../flow/index.js';
import { isApproximately, count } from '../../numbers/index.js';
import * as Iter from '../../iterables/index.js';
import { interval } from '../../flow/index.js';
const genArray = (count: number) => {
  const data: string[] = [];
  for (let i = 0; i < count; i++) {
    data[ i ] = `data-${ i }`;
  }
  return data;
}

test(`to-array-2`, async t => {
  const values = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
  const source1 = Rx.From.iterator(values.values(), { lazy: `initial` });
  const reader1 = await Rx.toArray(source1);
  t.true(reader1.length === values.length);

  // maxValues option
  const source2 = Rx.From.iterator(values.values(), { lazy: `initial` });
  const reader2 = await Rx.toArray(source2, { limit: 3 });
  t.true(reader2.length === 3);
});


test(`to-array`, async t => {
  const data = genArray(100);

  // Simple case: limit reachable
  const v1 = Rx.From.array(data);
  const vv1 = await Rx.toArray(v1, { limit: 5 });
  await Flow.sleep(200);
  t.deepEqual(vv1, data.slice(0, 5));

  // Throws, limit not reached
  const v2 = Rx.From.array(data);
  await t.throwsAsync(async () => {
    const vv2 = await Rx.toArray(v2, { limit: 1000, underThreshold: `throw`, maximumWait: 200 });
    await Flow.sleep(200);
  })

  // Fill with placeholder
  const v3 = Rx.From.array([ 1, 2, 3, 4, 5 ]);
  const vv3 = await Rx.toArray(v3, { limit: 10, underThreshold: `fill`, fillValue: 9, maximumWait: 200 });
  await Flow.sleep(200);
  t.deepEqual(vv3, [ 1, 2, 3, 4, 5, 9, 9, 9, 9, 9 ])

  // Return what we can
  const v4 = Rx.From.array([ 1, 2, 3, 4, 5 ]);
  const vv4 = await Rx.toArray(v4, { limit: 10, underThreshold: `partial`, maximumWait: 200 });
  await Flow.sleep(200);
  t.deepEqual(vv4, [ 1, 2, 3, 4, 5 ]);
});