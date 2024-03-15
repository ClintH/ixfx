import test from 'ava';
import * as Rx from '../../rx/index.js';
import * as Flow from '../../flow/index.js';
import { isApproximately } from '../../Numbers.js';
import * as Generators from '../../generators/index.js';

// const r = Rx.object({ name: `bob`, level: 2 });
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

// const source = Rx.event(window, `pointermove`);
// let t = Rx.throttle(source, { elapsed: 100 })
// t = Rx.field(t, `button`);
// t.on(value => {
//   // button id
// })

test(`rx-from-proxy-array`, async t => {
  const { proxy, rx } = Rx.fromProxy([ `one`, `two`, `three` ]);
  let step = 0;
  rx.value(v => {
    //console.log(`value`, v);
    switch (step) {
      case 0: {
        t.deepEqual(v, [ `one`, `two`, `three`, `four` ]);
        break;
      }
      case 1: {
        t.deepEqual(v, [ `one`, `two`, `three` ]);
        break;
      }
    }
  })

  // Step 0: [one,two,three,four]  
  proxy.push(`four`);
  await Flow.sleep(50);

  // Step 1: [one, two, three]
  step++;
  proxy.pop();
  await Flow.sleep(50);

});

// test(`rx-from-proxy-object`, async t => {
//   const { proxy: person, rx: personRx } = Rx.fromProxy({ name: `jill` });
//   let valueFired = 0;

//   personRx.value(v => {
//     t.deepEqual(v, { name: "john" });
//     valueFired++;
//   });
//   personRx.on(v => {
//     t.deepEqual(v.value, { name: `john` });
//     valueFired++;
//   });
//   personRx.onDiff(diff => {
//     t.deepEqual(diff.value, [ { path: `name`, value: `john`, previous: `jill` } ]);
//     valueFired++;
//   })

//   t.is(person.name, `jill`);
//   t.is(personRx.last().name, `jill`);
//   person.name = `john`;
//   t.is(person.name, `john`);
//   t.is(personRx.last().name, `john`);

//   // @ts-ignore
//   t.throws(() => proxy.age = 12);

//   const { proxy: person2, rx: person2Rx } = Rx.fromProxy({
//     name: `jill`, address: {
//       street: `Test St`, number: 12
//     }
//   });
//   person2Rx.value(v => {
//     valueFired++;
//   });
//   person2.address = { street: `West St`, number: 12 };

//   await Flow.sleep(50);
//   t.is(valueFired, 4);

//   valueFired = 0;
//   const { proxy: array, rx: arrayRx } = Rx.fromProxy([ `a`, `b`, `c` ]);
//   arrayRx.value(v => {
//     t.deepEqual(v, [ `a`, `d`, `c` ]);
//     valueFired++;
//   });
//   arrayRx.onDiff(diff => {
//     t.deepEqual(diff.value, [ { path: `1`, value: `d`, previous: `b` } ]);
//     valueFired++;
//   });

//   array[ 1 ] = `d`;
//   t.deepEqual(array, [ `a`, `d`, `c` ]);
//   await Flow.sleep(50);
//   t.is(valueFired, 2);
// });

test(`rx-number`, t => {
  const nonInit = Rx.number();
  t.falsy(nonInit.last());
  t.false(Rx.hasLast(nonInit));
  t.plan(8);
  nonInit.on(v => {
    t.is(v.value, 10);
  });
  nonInit.set(10);
  t.is(nonInit.last(), 10);
  t.true(Rx.hasLast(nonInit));

  const x = Rx.number(5);
  t.truthy(x.last());
  t.true(Rx.hasLast(x));
  t.is(x.last(), 5);
});

test(`rx-from-array`, async t => {
  const a1 = [ 1, 2, 3, 4, 5 ];
  // Default options
  const v1 = Rx.readFromArray(a1);
  t.false(v1.isDone());
  t.is(v1.last(), 1);

  let read: number[] = [];
  const v1Off = v1.on(msg => {
    if (msg.value) {
      read.push(msg.value);
    }
  });
  await Flow.sleep(1000);
  v1Off();
  t.deepEqual(read, a1);

});

test(`rx-from-array-lazy`, async t => {
  const a1 = [ 1, 2, 3, 4, 5 ];

  // Pause: Step 1: read 2 items from source
  const v2 = Rx.readFromArray(a1, { idle: `pause`, lazy: true });
  let read: number[] = [];
  const v2Off1 = v2.on(msg => {
    if (msg.value) {
      read.push(msg.value);
      if (read.length === 2) {
        v2Off1();
      }
    }
  });
  // Should only have two items, because we unsubscribed
  await Flow.sleep(200);
  t.deepEqual(read, [ 1, 2 ]);

  // Pause: Step 2: keep reading, expecting data to continue and complete
  const v2Off2 = v2.on(msg => {
    if (msg.value) {
      read.push(msg.value);
    }
  });
  await Flow.sleep(200);
  t.deepEqual(read, a1);

  // Reset: Step 1 read 2 times
  const v3 = Rx.readFromArray(a1, { idle: `reset`, lazy: true });
  read = [];
  const v3Off1 = v3.on(msg => {
    if (msg.value) {
      read.push(msg.value);
      if (read.length === 2) {
        v3Off1();
      }
    }
  });
  await Flow.sleep(200);
  t.deepEqual(read, [ 1, 2 ]);

  // Reset: Step 2: continue reading
  const v3Off2 = v3.on(msg => {
    if (msg.value) read.push(msg.value);
  });
  await Flow.sleep(200);
  t.deepEqual(read, [ 1, 2, 1, 2, 3, 4, 5 ])
});

test(`rx-manual`, t => {
  const v = Rx.manual();
  t.plan(1);
  v.on(msg => {
    t.deepEqual(msg.value, `hello`);
  });
  v.set(`hello`);
});

test(`rx-event`, async t => {
  const target = new EventTarget();

  const v1 = Rx.fromEvent(target, `hello`);
  t.falsy(v1.last());
  const results: string[] = [];
  let gotDone = false
  v1.on(msg => {
    if (Rx.messageHasValue(msg)) {
      results.push((msg as any).value.detail);
    } else if (Rx.messageIsDoneSignal(msg)) {
      gotDone = true;
    } else {
      t.fail(`Unexpected message: ${ JSON.stringify(msg) }`);
    }
  });
  target.dispatchEvent(new CustomEvent(`wrong`, { detail: `wrong-1` }));

  const produceEvents = (count: number) => {
    const expected = [];
    for (let i = 0; i < 5; i++) {
      const value = `hello-${ i }`;
      expected.push(value);
      target.dispatchEvent(new CustomEvent(`hello`, { detail: value }));
    }
    return expected;
  }

  const expectedFive = produceEvents(5);
  await Flow.sleep(200);
  t.deepEqual(results, expectedFive);
  t.false(gotDone, `Received done message too early`);

  // Unsubscribe - expect that we don't receive any additional data
  v1.dispose(`test dispose`);
  const expectedTen = produceEvents(10);
  await Flow.sleep(200);
  t.true(gotDone, `Did not receive done message`);
  t.true(v1.isDisposed());
  t.deepEqual(results, expectedFive);

});

test(`object-field`, async t => {
  const o = Rx.fromObject({ name: `bob`, level: 2 });
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

test(`from-generator`, async t => {
  // Synchronous generator
  const r1 = Rx.fromGenerator(Generators.count(5));
  const r1Data = await Rx.toArray(r1);
  t.deepEqual(r1Data, [ 0, 1, 2, 3, 4 ]);

  // Asynchronous generator
  const count = 5;
  let countProgress = count;
  const intervalPeriod = 100;
  const r2 = Generators.interval(() => {
    if (countProgress === 0) return;
    return --countProgress;
  }, intervalPeriod);
  let start = performance.now();
  const r2Data = await Rx.toArray(r2);
  let elapsed = performance.now() - start;
  t.is(countProgress, 0);
  t.deepEqual(r2Data, [ 4, 3, 2, 1, 0 ]);
  t.true(isApproximately((count + 1) * intervalPeriod, 0.1)(elapsed), `Elapsed: ${ elapsed }`);

});

test(`object-update`, async t => {
  const o = Rx.fromObject({ name: `bob`, level: 2 });
  let count = 0;
  o.on(valueRaw => {
    const value = valueRaw.value;
    if (count === 0) t.deepEqual(value, { name: `Jane`, level: 2 });
    if (count === 1) t.deepEqual(value, { name: `Jane`, level: 3 });
    count++;
  });

  // Won't change anything, nor trigger the above event handler
  o.update({ name: `bob` });
  o.update({ level: 2 });
  t.deepEqual(o.last(), { name: `bob`, level: 2 });
  t.is(count, 0);

  o.update({ name: `Jane` });
  t.deepEqual(o.last(), { name: `Jane`, level: 2 });
  o.update({ level: 3 });
  t.deepEqual(o.last(), { name: `Jane`, level: 3 });

  const o2 = Rx.fromObject([ `` ]);
  o2.on(message => {
    //console.log(`o2`, message.value);
    t.deepEqual(message.value, [ `a`, `b` ]);
    count++;
  });
  o2.onDiff(diffMsg => {
    t.deepEqual(diffMsg.value, [
      { path: '0', previous: '', value: 'a' },
      { path: '1', previous: undefined, value: 'b' }
    ]);
    count++;
  })
  o2.set([ `a`, `b` ]);

  await Flow.sleep(100);
  t.is(count, 4);
});

test(`object-set`, async t => {

  const o = Rx.fromObject({ name: `bob`, level: 2 });
  let count = 0;
  let diffCount = 0;
  o.on(value => {
    const v = value.value;
    if (count === 0) t.deepEqual(v, { name: `jane`, level: 2 });
    if (count === 1) t.deepEqual(v, { name: `mary`, level: 3 });

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

test(`rx-field`, async t => {
  const data = [
    { name: `a` },
    { name: `b` },
    { name: `c` },
    { name: `d` }
  ];
  const f = Rx.field<{ name: string }, string>(`name`)(data);
  const values1 = await Rx.toArrayOrThrow(f);
  t.is(values1.length, data.length);
  t.deepEqual(values1, [ `a`, `b`, `c`, `d` ]);

  // Check with some values that don't have field
  const data2 = [
    { name: `a` },
    { name: `b` },
    { nameNot: `c` },
    { name: `d` }
  ];
  // @ts-expect-error
  const f2 = Rx.field<{ name: string }, string>(`name`)(data2);
  const values2 = await Rx.toArray(f2);
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
  const f3 = Rx.field<{ name: string }, string>(`name`, { missingFieldDefault: `` })(data3);
  const values3 = await Rx.toArray(f3);
  t.is(values3.length, data3.length);
  t.deepEqual(values3, [ `a`, `b`, ``, `d` ]);

});

test(`generator-async`, async t => {
  // Produce values every 100ms
  const valueRateMs = 100;
  const valueCount = 10;
  const valuesOverTime = Flow.interval(() => Math.random(), valueRateMs);

  const source = Rx.generator(valuesOverTime);
  const values1: number[] = [];
  const start = Date.now();
  source.on(v => {
    if (v.value === undefined) return;
    values1.push(v.value);
    if (values1.length === valueCount) {
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
  const source = Rx.generator(values.values(), { lazy: true });
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
  const source1 = Rx.generator(values.values(), { lazy: true });
  const reader1 = await Rx.toArray(source1);
  t.true(reader1.length === values.length);

  // maxValues option
  const source2 = Rx.generator(values.values(), { lazy: true });
  const reader2 = await Rx.toArray(source2, { limit: 3 });
  t.true(reader2.length === 3);
});

const genArray = (count: number) => {
  const data: string[] = [];
  for (let i = 0; i < count; i++) {
    data[ i ] = `data-${ i }`;
  }
  return data;
}

test(`rx-to-array`, async t => {
  const data = genArray(100);

  // Simple case: limit reachable
  const v1 = Rx.readFromArray(data);
  const vv1 = await Rx.toArray(v1, { limit: 5 });
  await Flow.sleep(200);
  t.deepEqual(vv1, data.slice(0, 5));

  // Throws, limit not reached
  const v2 = Rx.readFromArray(data);
  t.throwsAsync(async () => {
    const vv2 = await Rx.toArray(v2, { limit: 1000, underThreshold: `throw`, maximumWait: 200 });
    await Flow.sleep(200);
  })

  // Fill with placeholder
  const v3 = Rx.readFromArray([ 1, 2, 3, 4, 5 ]);
  const vv3 = await Rx.toArray(v3, { limit: 10, underThreshold: `fill`, fillValue: 9, maximumWait: 200 });
  await Flow.sleep(200);
  t.deepEqual(vv3, [ 1, 2, 3, 4, 5, 9, 9, 9, 9, 9 ])

  // Return what we can
  const v4 = Rx.readFromArray([ 1, 2, 3, 4, 5 ]);
  const vv4 = await Rx.toArray(v4, { limit: 10, underThreshold: `partial`, maximumWait: 200 });
  await Flow.sleep(200);
  t.deepEqual(vv4, [ 1, 2, 3, 4, 5 ]);
});


test(`generator-lazy`, async t => {
  let produceCount = 0;
  let consumeCount = 0;
  const ac = new AbortController();

  // Keep track of how many times its called.
  // Runs every 100ms
  const time = Flow.interval(() => {
    produceCount++;
    return Math.random();
  }, { fixed: 100, signal: ac.signal });

  // Reactive from a generator
  const r = Rx.generator(time);

  // Wait 2s before subscribing
  setTimeout(() => {
    r.on(v => {
      consumeCount++;
      if (consumeCount === 10) {
        // We should have consumed as many as created
        ac.abort(`hey`);
      }
    })
  }, 1500);

  await Flow.sleep(1000);
  t.is(consumeCount, produceCount);

})