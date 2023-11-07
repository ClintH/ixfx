import test from 'ava';
import { batch, generator, toArray, field, transform, object } from '../../data/Reactive.js';
import * as Flow from '../../flow/index.js';
import { isApproximately } from '../../Numbers.js';
import { count } from '../../Generators.js';

import * as Reactive from '../../data/Reactive.js';

// const r = Reactive.object({ name: `bob`, level: 2 });
// r.on(value => {
//   // reactive value has been changed
// });
// r.onDiff(changes => {
//   // or handle just the set of changed fields
// })

// // ...somewhere else
// // apply partial update, eg:
// r.update({ name: `jane ` })
// // set a field
// r.updateField(`level`, 3);
// // update whole object and let it take care of figuring out changeset
// r.set({ name: `barry`, level: 4 });

// const source = Reactive.event(window, `pointermove`);
// let t = Reactive.throttle(source, { elapsed: 100 })
// t = Reactive.field(t, `button`);
// t.on(value => {
//   // button id
// })


test(`object-field`, async t => {
  const o = object({ name: `bob`, level: 2 });
  let count = 0;
  o.on(valueRaw => {
    const value = valueRaw.value;
    if (count === 0) t.deepEqual(value, { name: `Jane`, level: 2 });
    if (count === 1) t.deepEqual(value, { name: `Jane`, level: 3 });
    count++;
  });

  // No changes
  o.updateField(`name`, `bob`);
  o.updateField(`level`, 2);
  t.is(count, 0);

  t.throws(() => { o.updateField(`blah`, `hello`) });
  o.updateField(`name`, `Jane`);
  o.updateField(`level`, 3);
  t.is(count, 2);
});

test(`object-update`, async t => {
  const o = object({ name: `bob`, level: 2 });
  let count = 0;
  o.on(valueRaw => {
    const value = valueRaw.value;
    //console.log(`count: ${ count }`, value);
    if (count === 0) t.deepEqual(value, { name: `Jane`, level: 2 });
    if (count === 1) t.deepEqual(value, { name: `Jane`, level: 3 });
    count++;
  });

  // Won't change anything
  o.update({ name: `bob` });
  o.update({ level: 2 });
  t.deepEqual(o.last(), { name: `bob`, level: 2 });
  t.is(count, 0);

  o.update({ name: `Jane` });
  t.deepEqual(o.last(), { name: `Jane`, level: 2 });
  o.update({ level: 3 });
  t.deepEqual(o.last(), { name: `Jane`, level: 3 });

  await Flow.sleep(1000);
  t.is(count, 2);
});

test(`object-set`, async t => {

  const o = object({ name: `bob`, level: 2 });
  let count = 0;
  let diffCount = 0;
  o.on(value => {
    const v = value.value;
    if (count === 0) t.deepEqual(v, { name: `jane`, level: 2 });
    if (count === 1) t.deepEqual(v, { name: `mary`, level: 3 });

    //console.log(`value: ${ JSON.stringify(v) }`);
    count++;
  });
  o.onDiff(diffV => {
    const diff = diffV.value;
    if (count === 0) t.deepEqual(diff, [
      { path: `name`, previous: `bob`, value: `jane` }
    ]);
    if (count === 1) t.deepEqual(diff, [
      { path: `name`, previous: `jane`, value: `mary` },
      { path: `level`, previous: 2, value: 3 }
    ]);

    //console.log(diff);
    diffCount++;
  })
  // Won't fire a change, since values are the same
  o.set({ name: `bob`, level: 2 });
  t.deepEqual(o.last(), { name: `bob`, level: 2 });

  o.set({ name: `jane`, level: 2 });
  t.deepEqual(o.last(), { name: `jane`, level: 2 });

  o.set({ name: `mary`, level: 3 });
  t.deepEqual(o.last(), { name: `mary`, level: 3 });

  t.is(count, 2);
  await Flow.sleep(1000);
});

test(`field`, async t => {
  const data1 = [
    { name: `a` },
    { name: `b` },
    { name: `c` },
    { name: `d` }
  ];
  const f1 = field<{ name: string }, string>(data1, `name`);
  const values1 = await toArray(f1);
  t.is(values1.length, data1.length);
  t.deepEqual(values1, [ `a`, `b`, `c`, `d` ]);

  // Check with some values that don't have field
  const data2 = [
    { name: `a` },
    { name: `b` },
    { nameNot: `c` },
    { name: `d` }
  ];
  // @ts-expect-error
  const f2 = field<{ name: string }, string>(data2, `name`);
  const values2 = await toArray(f2);
  t.is(values2.length, data2.length - 1);
  t.deepEqual(values2, [ `a`, `b`, `d` ]);

  // Again, but include missing fields as undefined
  const data3 = [
    { name: `a` },
    { name: `b` },
    { nameNot: `c` },
    { name: `d` }
  ];
  // @ts-expect-error
  const f3 = field<{ name: string }, string>(data3, `name`, { missingFieldDefault: `` });
  const values3 = await toArray(f3);
  t.is(values3.length, data3.length);
  t.deepEqual(values3, [ `a`, `b`, ``, `d` ]);

});

test(`transform`, async t => {
  // Simple array as source
  const data = [ 1, 2, 3, 4, 5 ];
  const values = transform(data, (v => v + '!'));
  const valuesArray = await toArray(values);
  t.is(valuesArray.length, data.length);
  for (let i = 0; i < data.length; i++) {
    t.is(valuesArray[ i ], data[ i ] + '!');
  }


});

test(`generator-async`, async t => {
  // Produce values every 100ms
  const valueRateMs = 100;
  const valueCount = 10;
  const valuesOverTime = Flow.interval(() => Math.random(), valueRateMs);

  const source = generator(valuesOverTime);
  const values1: number[] = [];
  const start = Date.now();
  source.on(v => {
    if (v.value === undefined) return;
    //console.log(`source.on len: ${ values1.length } v: ${ JSON.stringify(v) }`);
    values1.push(v.value);
    if (values1.length === valueCount) {
      //console.log(`Disposing source`);
      source.dispose(`test dispose`);
      return;
    }
  });
  t.false(source.isDisposed());
  const sleepFor = valueRateMs * (valueCount + 2);
  await Flow.sleep(sleepFor);
  const elapsed = Date.now() - start;
  //t.true(isApproximately(valueRateMs * valueCount, 0.1)(elapsed));
  t.true(source.isDisposed());
});

test(`generator-sync`, async t => {
  const values = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
  const source = generator(values.values(), { lazy: true });
  const readValues: number[] = [];
  source.on(v => {
    if (v.value) {
      readValues.push(v.value);
    }
  });

  await Flow.sleep(1000);
  t.true(readValues.length === values.length);
});

test(`toArray`, async t => {
  const values = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
  const source1 = generator(values.values(), { lazy: true });
  const reader1 = await toArray(source1);
  t.true(reader1.length === values.length);

  // maxValues option
  const source2 = generator(values.values(), { lazy: true });
  const reader2 = await toArray(source2, { limit: 3 });
  t.true(reader2.length === 3);
});

test(`batch-limit`, async t => {
  // Even number of items per batch
  const amt1 = 20;
  const values1 = count(amt1);
  const limit1 = 5;
  const b1 = batch(values1, { limit: limit1 });
  const reader1 = await toArray(b1);
  t.is(reader1.flat().length, amt1);
  t.is(reader1.length, Math.ceil(amt1 / limit1));
  for (const row of reader1) {
    t.is(row.length, limit1);
  }

  //Remainders
  const amt2 = 20;
  const values2 = count(amt2);
  const limit2 = 6;
  const b2 = batch(values2, { limit: limit2 });
  const reader2 = await toArray(b2);
  t.is(reader2.flat().length, amt2);
  for (let i = 0; i < reader2.length; i++) {
    if (i === reader2.length - 1) {
      t.is(reader2[ i ].length, amt2 % limit2);
    } else {
      t.is(reader2[ i ].length, limit2);
    }
  }
})

test(`batch-elapsed`, async t => {
  // Read all items within the elapsed period
  const amt1 = 20;
  const started1 = Date.now();
  const values1 = count(amt1);
  const elapsed1 = 5000;
  const b1 = batch(values1, { elapsed: elapsed1 });
  const reader1 = await toArray(b1);
  const readElapsed = Date.now() - started1;
  t.is(reader1.flat().length, amt1);

  t.true(readElapsed < 1000, `Reading shouldn't take full time since source ends`);

  // Read items in gulps
  const amt2 = 20;
  const elapsed2 = 200;
  const interval2 = 50
  const values2 = count(amt2);
  // Produce values every 500ms
  const valuesOverTime = Flow.interval(values2, interval2);
  const b2 = batch(valuesOverTime, { elapsed: elapsed2 });
  const reader2 = await toArray(b2);
  t.is(reader2.flat().length, amt2);
  for (const row of reader2) {
    t.is(row.length, elapsed2 / interval2);
  }
});

/**
 * Tests lazy subscription
 */
test(`generator-lazy`, async t => {
  let produceCount = 0;
  let consumeCount = 0;
  const ac = new AbortController();
  const time = Flow.interval(() => {
    produceCount++;
    return Math.random();
  }, { fixed: 100, signal: ac.signal });

  const r = generator(time);
  setTimeout(() => {
    // Wait 2s before subscribing
    r.on(v => {
      consumeCount++;
      //console.log(`consume: ${ consumeCount } produce: ${ produceCount }`);
      if (consumeCount === 10) {
        // We should have consumed as many as created
        ac.abort(`hey`);
      }
    })
  }, 2000);
  await Flow.sleep(3000);
  t.is(consumeCount, produceCount);

})