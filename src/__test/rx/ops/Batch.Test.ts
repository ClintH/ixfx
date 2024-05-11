import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
import { count } from '../../../numbers/Count.js';
import { isApproximately } from '../../../numbers/IsApproximately.js';
test(`batch-limit`, async t => {
  // Even number of items per batch
  const amt1 = 20;
  const values1 = count(amt1);
  const limit1 = 5;
  const b1 = Rx.batch(values1, { quantity: limit1 });
  const reader1 = await Rx.toArray(b1);
  t.is(reader1.flat().length, amt1);
  t.is(reader1.length, Math.ceil(amt1 / limit1));
  for (const row of reader1) {
    t.assert(row !== undefined);
    t.is(row!.length, limit1);
  }

  //Remainders
  const amt2 = 20;
  const values2 = count(amt2);
  const limit2 = 6;
  const b2 = Rx.batch(values2, { quantity: limit2 });
  const reader2 = await Rx.toArray(b2);
  t.is(reader2.flat().length, amt2);
  for (let i = 0; i < reader2.length; i++) {
    if (i === reader2.length - 1) {
      t.is(reader2[ i ]!.length, amt2 % limit2);
    } else {
      t.is(reader2[ i ]!.length, limit2);
    }
  }
})

test(`batch-elapsed-0`, async t => {
  const m = Rx.manual<number>();
  const results: Array<Array<number>> = [];
  const batchElapsed = 200;
  Rx.wrap(m)
    .transform(v => v / 10)
    .batch({ elapsed: batchElapsed, returnRemainder: false })
    .value(v => {
      results.push(v);
    });

  // Run through numbers
  let start = Date.now();
  const arr = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
  const arrInterval = 50;

  for await (const v of Flow.interval(arr, arrInterval)) {
    m.set(v);
  }
  let elapsed = Date.now() - start;
  const expectedItemsPerBatch = Math.floor(batchElapsed / arrInterval);

  // Test batching
  t.deepEqual(results, [
    [ 0.1, 0.2, 0.3, 0.4 ], [ 0.5, 0.6, 0.7, 0.8 ]
  ])
});

test(`batch-elapsed-1`, async t => {
  // Read all items within the elapsed period
  const amt = 20;
  const started = Date.now();
  const values = count(amt);
  const elapsed = 5000;
  // Make a batch for 5 seconds. But `count` gives all the values
  // quickly, so it won't take long
  const batch = Rx.batch(values, { elapsed: elapsed });
  const reader = await Rx.toArray(batch);
  const readElapsed = Date.now() - started;
  // Check that that toArray yielded all the emitted values
  t.is(reader.flat().length, amt);
  // Expect that time to drain source isn't so long
  t.true(readElapsed < 500, `Reading shouldn't take full time since source ends`);
});

test(`batched-elapsed-2`, async t => {
  // Read items in gulps
  const amt = 20;
  const elapsed = 200;
  const interval = 50
  const values = count(amt);
  // Iterate over values with an interval
  const valuesOverTime = Flow.interval(values, interval);

  // Batch read over elapsed ms
  const batch = Rx.batch(valuesOverTime, { elapsed: elapsed });

  // Read all the batched sets of data
  const reader = await Rx.toArrayOrThrow(batch);

  // Expect that number of read items is the same as source
  t.is(reader.flat().length, amt);
  for (const row of reader) {
    t.is(row.length, elapsed / interval);
  }
});
