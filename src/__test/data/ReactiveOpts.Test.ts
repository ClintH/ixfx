import test from 'ava';
import * as Rx from '../../data/Reactive.js';
import * as Flow from '../../flow/index.js';
import { isApproximately } from '../../Numbers.js';
import { count } from '../../Generators.js';

import * as Reactive from '../../data/Reactive.js';

const genArray = (count: number) => {
  const data: string[] = [];
  for (let i = 0; i < count; i++) {
    data[ i ] = `data-${ i }`;
  }
  return data;
}



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
  const b1 = Rx.batch(values1, { limit: limit1 });
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
  const b2 = Rx.batch(values2, { limit: limit2 });
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

test(`batch-elapsed`, async t => {
  // Read all items within the elapsed period
  const amt1 = 20;
  const started1 = Date.now();
  const values1 = count(amt1);
  const elapsed1 = 5000;
  const b1 = Rx.batch(values1, { elapsed: elapsed1 });
  const reader1 = await Rx.toArray(b1);
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
  const b2 = Rx.batch(valuesOverTime, { elapsed: elapsed2 });
  const reader2 = await Rx.toArrayOrThrow(b2);
  t.is(reader2.flat().length, amt2);
  for (const row of reader2) {
    t.is(row.length, elapsed2 / interval2);
  }
});

test(`rx-resolve`, async t => {
  let produced = 0;
  const r = Rx.resolve(() => {
    produced++;
    return Math.floor(Math.random() * 1000);
  }, { lazy: true, infinite: true, interval: 50 });

  let results1 = 0;
  const r1Off = r.on(msg => {
    results1++;
  });
  await Flow.sleep(1000);
  r1Off();

  await Flow.sleep(1000);

  let results2 = 0;
  const r2Off = r.on(msg => {
    results2++;
  });
  await Flow.sleep(1000);
  r2Off();

  t.is(results1, results2);

  // Since producer is lazy, we expect # produced to be amount listened to
  t.is(results1 + results2, produced);
});