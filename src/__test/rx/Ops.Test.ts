import test from 'ava';
import * as Rx from '../../rx/index.js';
import * as Flow from '../../flow/index.js';
import { count } from '../../numbers/Count.js';

test(`derived`, async t => {
  const counter = Rx.number(0);
  const isEven = Rx.pinged(counter, value => (value & 1) == 0);

  isEven.value(v => {
    console.log(`isEven: ${ v }`);
  })
  for (let i = 0; i < 10; i++) {
    console.log(`set: ${ i }`);
    counter.set(i);
    await Flow.sleep(100);
  }
  console.log(`Done`);
  t.pass();
});

test(`derived-2`, async t => {
  Rx.mergeToObject({
    move: Rx.fromEvent<PointerEvent>(document.body, `pointermove`)
  })
});

const genArray = (count: number) => {
  const data: string[] = [];
  for (let i = 0; i < count; i++) {
    data[ i ] = `data-${ i }`;
  }
  return data;
}

// test(`dummy`, t => {
//   t.pass();
// })

test(`transform`, async t => {
  // Simple array as source
  const data = [ 1, 2, 3, 4, 5 ];
  const values = Rx.transform(data, (v => v + '!'));
  const valuesArray = await Rx.toArray(values);
  t.is(valuesArray.length, data.length);
  for (let i = 0; i < data.length; i++) {
    t.is(valuesArray[ i ], data[ i ] + '!');
  }
});


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

test(`resolve`, async t => {
  let produced = 0;
  const r = Rx.resolve(() => {
    produced++;
    return Math.floor(Math.random() * 1000);
  }, { lazy: `initial`, infinite: true, interval: 50 });

  let results1 = 0;
  const r1Off = r.on(msg => {
    results1++;
  });
  await Flow.sleep(500);
  r1Off();

  await Flow.sleep(500);

  let results2 = 0;
  const r2Off = r.on(msg => {
    results2++;
  });
  await Flow.sleep(500);
  r2Off();

  t.is(results1, results2);

  // Since producer is lazy, we expect # produced to be amount listened to
  t.is(results1 + results2, produced);
});

test(`take-next-value`, async t => {
  const s1 = Rx.readFromArray([ 1, 2, 3, 4, 5 ], { interval: 100 });
  const r1 = await Rx.takeNextValue(s1);
  t.plan(3);

  // First value 1
  t.is(r1, 1);

  // Sleep for a bit to get past first value
  await Flow.sleep(50);

  // Second value should be 2
  const r2 = await Rx.takeNextValue(s1);
  t.is(r2, 2);

  // Sleep until all numbers emitted and source has ended. Should timeout
  await Flow.sleep(500);

  // This will throw because there's no more
  try {
    const v = await Rx.takeNextValue(s1, 500);
    t.fail(`Error not thrown. Instead got value: ${ v }`);
  } catch (error) {
    t.pass(`Error thrown`);
  }
});

test(`merge-to-object`, async t => {
  const s1 = [ 0, 1, 2, 3, 4 ];
  const s2 = [ 10, 11, 12, 13, 14 ];
  const createSources = () => ({
    fast: Rx.readFromArray(s1, { interval: 1 }),
    slow: Rx.readFromArray(s2, { interval: 20 })
  });

  // Test 1 - Break when a source completes
  const r1 = Rx.mergeToObject(createSources());
  const r1Array = await Rx.toArray(r1);
  t.deepEqual(r1Array, [
    { fast: 0, slow: undefined }, { fast: 1, slow: undefined }, { fast: 2, slow: undefined }, { fast: 3, slow: undefined }, { fast: 4, slow: undefined }
  ]);
  // Test 2 - Allow sources to complete
  const r2 = Rx.mergeToObject(createSources(), { onSourceDone: `allow` });
  const r2Array = await Rx.toArray(r2);
  t.deepEqual(r2Array, [
    { fast: 0, slow: undefined },
    { fast: 1, slow: undefined },
    { fast: 2, slow: undefined },
    { fast: 3, slow: undefined },
    { fast: 4, slow: undefined },
    { fast: 4, slow: 10 },
    { fast: 4, slow: 11 },
    { fast: 4, slow: 12 },
    { fast: 4, slow: 13 },
    { fast: 4, slow: 14 }
  ]);
});

test(`merge`, async t => {
  const s1 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
  const s2 = [ 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ];
  const createSources = () => ([
    Rx.readFromArray(s1, { interval: 1 }),
    Rx.readFromArray(s2, { interval: 20 })
  ])

  // Test 1 - Break when a source completes
  const r1 = Rx.mergeToArray(createSources(), { onSourceDone: `break` });
  const r1Array = await Rx.toArray(r1);

  // Since source 1 runs and completes before source 2 even has a chance to produce:
  t.deepEqual(r1Array, [
    [ 0, undefined ], [ 1, undefined ], [ 2, undefined ], [ 3, undefined ], [ 4, undefined ], [ 5, undefined ], [ 6, undefined ], [ 7, undefined ], [ 8, undefined ], [ 9, undefined ]
  ])

  // Test 2 - Allow sources to complete
  const r2 = Rx.mergeToArray(createSources(), { onSourceDone: `allow` });
  const r2Array = await Rx.toArray(r2) as number[][];

  // First half array will be first source, with _undefined_ for second source since it's too slow
  for (let i = 0; i < 1; i++) {
    t.is(r2Array[ i ][ 0 ], i);
    t.falsy(r2Array[ i ][ 1 ]);
  }

  // Second half of array will be last value of first source along with second source values
  for (let i = 10; i < 20; i++) {
    t.is(r2Array[ i ][ 0 ], 9);
    t.is(r2Array[ i ][ 1 ], i);

  }
});

test(`sync-to-object`, async t => {
  const s1 = [ 0, 1, 2, 3, 4 ];
  const s2 = [ 10, 11, 12, 13, 14 ];
  const createSources = () => ({
    fast: Rx.readFromArray(s1, { interval: 1 }),
    slow: Rx.readFromArray(s2, { interval: 20 })
  });

  // Test 1: Break
  const r1 = Rx.syncToObject(createSources(), { onSourceDone: `break` });
  const r1Array = await Rx.toArray(r1);
  // Since first source finishes before second has a chance to begin, we'll get an empty array
  t.deepEqual(r1Array, []);

  // Test 2: Allow source completion; setting to completed stream value to _undefined_
  const r2 = Rx.syncToObject(createSources(), { onSourceDone: `allow`, finalValue: `undefined` });
  const r2Array = await Rx.toArray(r2);
  t.deepEqual(r2Array, [
    { fast: undefined, slow: 10 },
    { fast: undefined, slow: 11 },
    { fast: undefined, slow: 12 },
    { fast: undefined, slow: 13 },
    { fast: undefined, slow: 14 }
  ])

  // Test 3: Allow source completion; using last value from stream
  const r3 = Rx.syncToObject(createSources(), { onSourceDone: `allow`, finalValue: `last` });
  const r3Array = await Rx.toArray(r3);
  t.deepEqual(r3Array, [
    { fast: 4, slow: 10 },
    { fast: 4, slow: 11 },
    { fast: 4, slow: 12 },
    { fast: 4, slow: 13 },
    { fast: 4, slow: 14 }
  ])

  // Tighter time interval
  const createSources2 = () => ({
    fast: Rx.readFromArray(s1, { interval: 2 }),
    slow: Rx.readFromArray(s2, { interval: 5 })
  });

  // Test 4: Break
  const r4 = Rx.syncToObject(createSources2(), { onSourceDone: `break` });
  const r4Array = await Rx.toArray(r4);
  if (r4Array[ 0 ]?.fast === 0) {
    t.deepEqual(r4Array, [
      { fast: 0, slow: 10 }, { fast: 3, slow: 11 }
    ])
  } else {
    t.deepEqual(r4Array, [
      { fast: 1, slow: 10 }, { fast: 3, slow: 11 }
    ])
  }
});

test(`cache`, async t => {
  const r1 = Rx.fromFunction(Math.random, { predelay: 300 });
  const r1dv = Rx.cache(r1, { initialValue: 10 });
  t.is(r1dv.last(), 10);
  const value = await Rx.takeNextValue(r1dv);
  t.true(r1dv.last() < 1);
  t.is(value, r1dv.last());

  const r2 = Rx.fromFunction(Math.random, { predelay: 300 });
  const r2dv = Rx.cache(r2, { initialValue: 10, lazy: `never` });
  t.is(r2dv.last(), 10);
  await Flow.sleep(400);
  t.true(r2dv.last() < 1);

});

test(`sync`, async t => {
  const s1 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
  const s2 = [ 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ];
  const createSources = () => ([
    Rx.readFromArray(s1, { interval: 5 }),
    Rx.readFromArray(s2, { interval: 20 })
  ])
  const r1 = Rx.sync(createSources());
  const r1Array = await Rx.toArray(r1) as number[][];

  // Second source is slower, so we'd expect those numbers to increment by 1
  const max = 2;
  for (let i = 0; i < 2; i++) {
    t.is(r1Array[ i ][ 1 ], 10 + i);
  }

  // Total duration of source 1 is 10x5ms = 50ms
  // Total duration of source 2 is 10x20ms = 200ms
  t.is(r1Array.length, max);

  await Flow.sleep(500);

});