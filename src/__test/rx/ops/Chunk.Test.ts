import expect from 'expect';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
import { count } from '../../../numbers/Count.js';
import { isEqualValueDefault } from '../../../util/IsEqual.js';
import { rangeInclusive } from '../../../numbers/Filter.js';
test(`chunk-limit`, async () => {
  // Even number of items per chunk
  const amt1 = 20;
  const values1 = count(amt1);
  const limit1 = 5;
  const b1 = Rx.chunk(values1, { quantity: limit1 });
  const reader1 = await Rx.toArray(b1);
  expect(reader1.flat().length).toBe(amt1);
  expect(reader1.length).toBe(Math.ceil(amt1 / limit1));
  for (const row of reader1) {
    t.assert(row !== undefined);
    expect(row!.length).toBe(limit1);
  }

  //Remainders
  const amt2 = 20;
  const values2 = count(amt2);
  const limit2 = 6;
  const b2 = Rx.chunk(values2, { quantity: limit2 });
  const reader2 = await Rx.toArray(b2);
  expect(reader2.flat().length).toBe(amt2);
  for (let index = 0; index < reader2.length; index++) {
    if (index === reader2.length - 1) {
      expect(reader2[ index ]!.length).toBe(amt2 % limit2);
    } else {
      expect(reader2[ index ]!.length).toBe(limit2);
    }
  }
})

test(`chunk-elapsed-0`, async done => {
  const m = Rx.manual<number>();
  const results: Array<Array<number>> = [];
  const chunkElapsed = 200;
  Rx.wrap(m)
    .transform(v => v / 10)
    .chunk({ elapsed: chunkElapsed, returnRemainder: false })
    .onValue(v => {
      results.push(v);
    });

  // Run through numbers
  const start = Date.now();
  const array = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
  const arrayInterval = 50;

  for await (const v of Flow.repeat(array, { delayMinimum: arrayInterval })) {
    m.set(v);
  }
  const elapsed = Date.now() - start;
  const expectedItemsPerChunk = Math.floor(chunkElapsed / arrayInterval);

  // Test chunking - could be a few alternates depending on timing
  const a = isEqualValueDefault(results, [
    [ 0.1, 0.2, 0.3, 0.4 ], [ 0.5, 0.6, 0.7, 0.8 ]
  ]);
  const b = isEqualValueDefault(results, [
    [ 0.1, 0.2, 0.3, 0.4, 0.5 ], [ 0.6, 0.7, 0.8, 0.9, 1 ]
  ]);
  const c = isEqualValueDefault(results, [
    [ 0.1, 0.2, 0.3, 0.4, 0.5 ], [ 0.6, 0.7, 0.8, 0.9 ]
  ]);
  if (!a && !b && !c)
    done.fail(`results: ${ JSON.stringify(results) }`);
});

test(`chunk-elapsed-1`, async () => {
  // Read all items within the elapsed period
  const amt = 20;
  const started = Date.now();
  const values = count(amt);
  const elapsed = 5000;
  // Make a chunk for 5 seconds. But `count` gives all the values
  // quickly, so it won't take long
  const chunk = Rx.chunk(values, { elapsed: elapsed });
  const reader = await Rx.toArray(chunk);
  const readElapsed = Date.now() - started;
  // Check that that toArray yielded all the emitted values
  expect(reader.flat().length).toBe(amt);
  // Expect that time to drain source isn't so long
  expect(readElapsed < 500).toBe(true);
});

test(`chunked-elapsed-2`, async () => {
  // Read items in gulps
  const amt = 20;
  const elapsed = 200;
  const interval = 50
  const values = count(amt);

  // Iterate over values with an interval
  const valuesOverTime = Flow.repeat(values, { delayMinimum: interval });

  // Chunk read over elapsed ms
  const chunk = Rx.chunk(valuesOverTime, { elapsed });

  // Read all the chunked sets of data
  const reader = await Rx.toArrayOrThrow(chunk);

  // Expect that number of read items is the same as source

  expect(reader.flat().length).toBe(amt);
  const expected = elapsed / interval;
  const r = rangeInclusive(expected - 1, expected + 1);
  for (const row of reader) {
    expect(r(row.length)).toBe(true);
  }
});
