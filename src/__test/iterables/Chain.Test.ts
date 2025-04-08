import expect from 'expect';
import * as Chains from '../../iterables/chain/index.js';
import { count } from '../../numbers/Count.js';
import * as Async from '../../iterables/IterableAsync.js'
import { sleep } from '../../flow/Sleep.js';
import { interval as intervalTracker } from '../../trackers/IntervalTracker.js';
import { isApprox } from '../../numbers/IsApprox.js';

const getNumberData = () => Array.from([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);
const getStringData = () => getNumberData().map(v => v.toString());

test('asPromise', async () => {
  const timeout = 100;
  const loops = 10;
  expect.assertions(loops);
  t.timeout(timeout * (loops + 2));
  const tick = Chains.From.timestamp({ interval: timeout, loops });
  const tickValue = Chains.asPromise(tick);

  let timer = setInterval(async () => {
    const v = await tickValue();
    if (v === undefined) {
      clearInterval(timer);
      return;
    }
    t.assert(true);
  }, timeout);

  await sleep(timeout * (loops + 1));
});


test(`fromFunction`, async () => {
  // Low-level
  let produced = 0;
  const factory = Chains.From.func(() => {
    return produced++;
  });
  const f = factory();
  let count = 0;
  for await (const v of f) {
    expect(v).toBe(count);
    count++;
    if (count === 5) break;
  }

  const r1 = await Chains.single(factory, 10);
  expect(r1).toBe(5);

  // In context
  produced = 0;
  const ch1 = Chains.run(
    Chains.From.func(() => produced++),
    Chains.Links.transform(v => `x:${ v }`),
    Chains.Links.take(5)
  );
  const ch1Result = (await Chains.asArray(ch1)).join(` `);
  expect(ch1Result).toEqual(`x:0 x:1 x:2 x:3 x:4`);
});

test(`lazy`, async done => {
  // Make sure input is not called on too early
  let produced = 0;
  let fired = false;
  const l1 = Chains.lazy().fromFunction(() => {
    if (!fired) done.fail(`Lazy function used before fired`);
    if (produced === 5) return;
    return produced++;
  });

  setTimeout(async () => {
    fired = true;
    const x = await l1.asArray([]);
    expect(x).toEqual([ 0, 1, 2, 3, 4 ]);
  }, 200);


  const l3 = await Chains.lazy().max().input([ 4, 0, 10 ]).lastOutput();
  expect(l3).toBe(10);
  await sleep(250);
});

test(`chunk`, async () => {
  // Chunk of 1
  const ch1 = Chains.run(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.Links.chunk(1)
  );
  const r1 = await Chains.asArray(ch1);
  expect(r1).toEqual([ [ 1 ], [ 2 ], [ 3 ], [ 4 ], [ 5 ], [ 6 ] ]);

  // Chunk of 2
  const ch2 = Chains.run(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.Links.chunk(2)
  );
  const r2 = await Chains.asArray(ch2);
  expect(r2).toEqual([ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ]);

  // Chunk of 4 - with remainders
  const ch3 = Chains.run(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.Links.chunk(4)
  );
  const r3 = await Chains.asArray(ch3);
  expect(r3).toEqual([ [ 1, 2, 3, 4 ], [ 5, 6 ] ]);

  // Chunk of 4 - suppress remainders
  const ch4 = Chains.run(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.Links.chunk(4, false)
  );
  const r4 = await Chains.asArray(ch4);
  expect(r4).toEqual([ [ 1, 2, 3, 4 ] ]);

  // Throw for zero-sized chunk
  await t.throwsAsync(async () => {
    const ch5 = Chains.run(
      [ 1, 2, 3, 4, 5, 6 ],
      Chains.Links.chunk(0)
    );
    const r5 = await Chains.asArray(ch5);
  });
});

test(`flatten`, async () => {
  // Simple
  const f = Chains.Links.reduce<string, string>(data => data.join(`-`));
  const r1 = await Chains.single(f, [ `a`, `b`, `c` ]);
  expect(r1).toBe(`a-b-c`);

  const ch1 = Chains.run(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.Links.transform(v => `x:${ v }`),
    Chains.Links.chunk(3),
    Chains.Links.reduce(v => v.join(`-`))
  );
  const r2 = (await Chains.asArray(ch1)).join(`;`);
  expect(r2).toBe(`x:1-x:2-x:3;x:4-x:5-x:6`)

});

/**
 * Merge to object, breaking when stream stops
 */
test(`combine-latest-to-object-break`, async () => {
  const c1 = Chains.combineLatestToObject({
    fast: Chains.From.array([ 1, 2, 3, 4 ], 10),
    slow: Chains.From.array([ 5, 6, 7 ], 25)
  }, { onSourceDone: `break`, afterEmit: `last` });
  const c1Array = await Chains.asArray(c1);
  // Slow chain doesn't get a chance to finish due to 'onSourceDone:break'
  // Values get repeated because afterEmit:last
  expect(c1Array).toEqual([
    { fast: 1, slow: undefined }, { fast: 2, slow: undefined }, { fast: 2, slow: 5 }, { fast: 3, slow: 5 }, { fast: 4, slow: 5 }
  ]);

  // Slow chain doesn't get a chance to finish due to 'onSourceDone:break'
  // Values set to undefined because afterEmit:undefined  
  const c2 = Chains.combineLatestToObject({
    fast: Chains.From.array([ 1, 2, 3, 4 ], 10),
    slow: Chains.From.array([ 5, 6, 7 ], 25)
  }, { onSourceDone: `break`, afterEmit: 'undefined' });
  const c2Array = await Chains.asArray(c2);
  expect(c2Array).toEqual([
    { fast: 1, slow: undefined }, { fast: 2, slow: undefined }, { fast: undefined, slow: 5 }, { fast: 3, slow: undefined }, { fast: 4, slow: undefined }
  ]);

});

test(`combine-latest-to-object-allow`, async () => {
  const c1 = Chains.combineLatestToObject({
    fast: Chains.From.array([ 1, 2, 3, 4 ], 10),
    slow: Chains.From.array([ 5, 6, 7 ], 25)
  }, { onSourceDone: `allow`, finalValue: `last`, afterEmit: `last` });
  const c1Array = await Chains.asArray(c1);

  // Allow source to finish without closing.
  // Expect last values to be carried forward becase of afterEmit: last and finalValue:last
  expect(c1Array).toEqual([
    { fast: 1, slow: undefined },
    { fast: 2, slow: undefined },
    { fast: 2, slow: 5 },
    { fast: 3, slow: 5 },
    { fast: 4, slow: 5 },
    { fast: 4, slow: 6 },
    { fast: 4, slow: 7 }
  ]);

  const c2 = Chains.combineLatestToObject({
    fast: Chains.From.array([ 1, 2, 3, 4 ], 10),
    slow: Chains.From.array([ 5, 6, 7 ], 25)
  }, { onSourceDone: `allow`, finalValue: `undefined`, afterEmit: `last` });
  const c2Array = await Chains.asArray(c2);

  // Allow source to finish without closing.
  // Expect last values to be undefined forward becase of afterEmit: last and finalValue:undefined
  expect(c2Array).toEqual([
    { fast: 1, slow: undefined },
    { fast: 2, slow: undefined },
    { fast: 2, slow: 5 },
    { fast: 3, slow: 5 },
    { fast: 4, slow: 5 },
    { fast: undefined, slow: 5 },
    { fast: undefined, slow: 6 },
    { fast: undefined, slow: 7 }
  ]);

  const c3 = Chains.combineLatestToObject({
    fast: Chains.From.array([ 1, 2, 3, 4 ], 10),
    slow: Chains.From.array([ 5, 6, 7 ], 25)
  }, { onSourceDone: `allow`, finalValue: `undefined`, afterEmit: `undefined` });
  const c3Array = await Chains.asArray(c3);

  // Allow source to finish without closing.
  // Expect last values to be undefined forward becase of afterEmit: undefined and finalValue:undefined
  expect(c3Array).toEqual([
    { fast: 1, slow: undefined },
    { fast: 2, slow: undefined },
    { fast: undefined, slow: 5 },
    { fast: 3, slow: undefined },
    { fast: 4, slow: undefined },
    { fast: undefined, slow: 6 },
    { fast: undefined, slow: 7 }
  ]);
});


test(`combine-latest-to-array`, async () => {
  const c1 = Chains.combineLatestToArray([
    Chains.From.array([ 1, 2, 3, 4 ], 10),
    Chains.From.array([ 5, 6, 7 ], 25)
  ], { onSourceDone: `break`, afterEmit: `last` });
  const c1Array = await Chains.asArray(c1);

  // Second chain a bit slow, second doesn't get a chance to finish due to 'onSourceDone:break'
  // Values get repeated because afterEmit:last
  expect(c1Array).toEqual([
    [ 1, undefined ], [ 2, undefined ], [ 2, 5 ], [ 3, 5 ], [ 4, 5 ]
  ]);

  const c1a = Chains.combineLatestToArray([
    Chains.From.array([ 1, 2, 3, 4 ], 10),
    Chains.From.array([ 5, 6, 7 ], 25)
  ], { onSourceDone: `break`, afterEmit: 'undefined' });
  const c1aArray = await Chains.asArray(c1a);

  // afterEmit:undefined
  expect(c1aArray).toEqual([
    [ 1, undefined ], [ 2, undefined ], [ undefined, 5 ], [ 3, undefined ], [ 4, undefined ]
  ]);

  const c2 = Chains.combineLatestToArray([
    Chains.From.array([ 1, 2, 3, 4 ], 10),
    Chains.From.array([ 5, 6, 7 ], 25)
  ], { onSourceDone: `allow`, finalValue: `last`, afterEmit: `last` });
  const c2Array = await Chains.asArray(c2);

  // Second chain a bit slow, second doesn't get a chance to finish due to 'onSourceDone:break'
  expect(c2Array).toEqual([
    [ 1, undefined ], [ 2, undefined ], [ 2, 5 ], [ 3, 5 ], [ 4, 5 ],
    [ 4, 6 ], [ 4, 7 ]
  ]);

  const c2a = Chains.combineLatestToArray([
    Chains.From.array([ 1, 2, 3, 4 ], 10),
    Chains.From.array([ 5, 6, 7 ], 25)
  ], { onSourceDone: `allow`, finalValue: `last`, afterEmit: `undefined` });
  const c2aArray = await Chains.asArray(c2a);
  expect(c2aArray).toEqual([
    [ 1, undefined ], [ 2, undefined ], [ undefined, 5 ], [ 3, undefined ], [ 4, undefined ], [ undefined, 6 ], [ undefined, 7 ]
  ]);

  const c3 = Chains.combineLatestToArray([
    Chains.From.array([ 1, 2, 3, 4 ], 10),
    Chains.From.array([ 5, 6, 7 ], 25)
  ], { onSourceDone: `allow`, finalValue: `undefined` });
  const c3Array = await Chains.asArray(c3);
  expect(c3Array).toEqual([
    [ 1, undefined ], [ 2, undefined ], [ 2, 5 ], [ 3, 5 ],
    [ 4, 5 ], [ undefined, 5 ], [ undefined, 6 ], [ undefined, 7 ]
  ]);
});

test(`merge-flat`, async () => {
  const t1 = Chains.run(
    Chains.From.timestamp({ interval: 50, loops: 10 }),
    Chains.Links.tally(),
    Chains.Links.transform(v => `a:${ v }`)
  );

  const t2 = Chains.run(
    Chains.From.timestamp({ interval: 10, loops: 9 }),
    Chains.Links.tally(),
    Chains.Links.transform(v => `b:${ v }`)
  );

  const t3 = Chains.run(
    Chains.From.timestamp({ interval: 30, loops: 8 }),
    Chains.Links.tally(),
    Chains.Links.transform(v => `c:${ v }`)
  );

  const output = await Chains.asArray(Chains.mergeFlat(t1, t2, t3));
  expect(output.includes(`a:10`)).toBe(true);
  expect(output.includes(`b:9`)).toBe(true);
  expect(output.includes(`c:8`)).toBe(true);
  expect(output.length).toBe(10 + 9 + 8);

  // for await (const v of Chains.merge(t1, t2, t3)) {
  //   console.log(v);
  // }
  //await sleep(5000);
});

test(`addToArray`, async () => {
  const data: Array<number> = [];
  Chains.addToArray(data, Chains.From.timestamp({ interval: 100, loops: 5 }));

  // Wait for all the data to arrive
  await sleep(505);
  expect(data.length).toBe(5);
});



test('asValue', async () => {
  const tick = Chains.From.timestamp({ interval: 100 });
  const tickValue = Chains.asValue(tick);
  const v1 = await tickValue();
  expect(v1).toBeFalsy();
  await sleep(100);
  const v2 = await tickValue();
  expect(v2).toBeTruthy();
});

test('asCallback', async () => {
  expect.assertions(5);
  const tick = Chains.From.timestamp({ interval: 100, loops: 5 });
  const tickValue = Chains.asCallback(tick, v => {
    t.assert(true, `callback triggered`);
  });
  await sleep(5 * 102);
});

test('transform', async () => {
  const tr = Chains.Links.transform<string, number>(v => Number.parseInt(v));
  const output = await Async.toArray(tr([ `1`, `2`, `3` ]));
  const expected = [ 1, 2, 3 ];
  expect(output).toEqual(expected);
})

test('filter', async () => {
  const data = getNumberData();
  const out1 = await Async.toArray(Chains.Links.filter<number>(v => v % 2 === 0)(data));
  expect(out1).toEqual([ 2, 4, 6, 8, 10 ]);
});

test('take', async () => {
  const inputData = getNumberData();
  const limit = 5;
  const output = await Async.toArray(Chains.Links.take(limit)(inputData));
  expect(output).toEqual(inputData.slice(0, limit));

  const output2 = await Async.toArray(Chains.Links.take(0)(inputData));
  expect(output2.length).toBe(0);
});

test(`syncToArray`, async () => {
  const t1 = Chains.From.timestamp({ interval: 10, loops: 10 });
  const t2 = Chains.From.timestamp({ interval: 20, loops: 5, asClockTime: true });
  const ch1 = Chains.syncToArray([ t1, t2 ], { onSourceDone: `break` });
  const output1 = await Chains.asArray(ch1);
  // Expect the total length to be 5 because 'onSourceDone:break'
  expect(output1.length).toBe(5);

  const ch2 = Chains.syncToArray([
    Chains.From.timestamp({ interval: 10, loops: 10 }),
    Chains.From.timestamp({ interval: 20, loops: 5, asClockTime: true })
  ], { onSourceDone: `allow` });

  const ch2Array = await Chains.asArray(ch2);
  expect(ch2Array.length).toBe(10);

  const ch3 = Chains.syncToArray([
    Async.withDelay([ 1, 2, 3 ], 10),
    Async.withDelay([ 4, 5, 6 ], 15)
  ], { onSourceDone: `allow` });
  const ch3Array = await Chains.asArray(ch3);
  expect(ch3Array).toEqual([ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]);

  const ch4 = Chains.syncToArray([
    Async.withDelay([ 1, 2, 3, 4 ], 10),
    Async.withDelay([ 5, 6, 7 ], 15)
  ], { onSourceDone: `allow`, finalValue: `last` });
  const ch4Array = await Chains.asArray(ch4);
  // Expect repeat of '7' because of 'finalValue:last'
  expect(ch4Array).toEqual([
    [ 1, 5 ], [ 2, 6 ], [ 3, 7 ], [ 4, 7 ], [ 4, 7 ]
  ]);

  // Expect error because maximumWait gets exceed
  const ch5 = Chains.syncToArray([
    Async.withDelay([ 1, 2, 3, 4 ], 2000)
  ], { onSourceDone: `allow`, finalValue: `last`, maximumWait: 500 });
  await t.throwsAsync(async () => await Chains.asArray(ch5));
});

test(`debounce`, async () => {
  expect.assertions(3);
  //const elapsed = Elapsed.since();
  const ch1 = Chains.run(
    Chains.From.timestamp({ interval: 10, elapsed: 350 }),
    Chains.Links.debounce(100)
  );
  for await (const v of ch1) {
    t.assert(true);
  }
});

test('chain', async () => {
  // Input array, transform
  const ch1 = Chains.run(
    [ `1`, `2`, `3` ],
    Chains.Links.transform(v => Number.parseInt(v))
  );
  const out1 = await Async.toArray(ch1);
  expect(out1).toEqual([ 1, 2, 3 ]);

  // Input array, transform & filter
  const data = getStringData();
  const ch2 = Chains.run(
    data,
    Chains.Links.transform(v => Number.parseInt(v)),
    Chains.Links.filter(v => v % 2 === 0)
  );
  const out2 = await Async.toArray(ch2);
  expect(out2).toEqual([ 2, 4, 6, 8, 10 ]);

  // Generator input
  const ch3 = Chains.run(
    count(10, 1),
    Chains.Links.filter(v => v % 2 === 0)
  );
  const out3 = await Async.toArray(ch3);
  expect(out3).toEqual([ 2, 4, 6, 8, 10 ])
})

test(`rank-array`, async () => {
  const values = [ [ 1, 2, 3 ], [ 3, 2, 1 ], [ 1, 2, 1 ], [ 1, 1, 1 ] ];

  const ranker = (a: number, b: number) => {
    if (a > b) return `a`;
    if (a < b) return `b`;
    return `eq`
  };

  // Basic
  const ch1 = Chains.run(
    values,
    Chains.Links.rankArray(ranker));
  const out1 = await Async.toArray(ch1);
  expect(out1).toEqual([ 3 ])

  // Also emit equal ranked
  const ch2 = Chains.run(
    values,
    Chains.Links.rankArray(ranker, { emitEqualRanked: true }));
  const out2 = await Async.toArray(ch2);
  expect(out2).toEqual([ 3, 3 ])

  // Always emit max
  const ch3 = Chains.run(
    values,
    Chains.Links.rankArray(ranker, { emitRepeatHighest: true }));
  const out3 = await Async.toArray(ch3);
  expect(out3).toEqual([ 3, 3, 3, 3 ]);

  // -- Within arrays
  // const values = [ [1,2,3], [3,2,1], [1,2,1], [1,1,1] ];
  const ch4 = Chains.run(
    values,
    Chains.Links.rankArray(ranker, { withinArrays: true }));
  const out4 = await Async.toArray(ch4);
  expect(out4).toEqual([ 3, 3, 2, 1 ])
});

test(`rank`, async () => {
  const objects: Array<{ size: number }> = [
    { size: 4 }, { size: 2 }, { size: 10 }, { size: 10 }, { size: 1 }, { size: 4 }, { size: 11 }
  ]

  const ranker = (a: any, b: any) => {
    if (a.size > b.size) return `a`;
    if (a.size < b.size) return `b`;
    return `eq`
  };

  // Basic
  const ch1 = Chains.run(
    objects,
    Chains.Links.rank(ranker));
  const out1 = await Async.toArray(ch1);
  expect(out1).toEqual([ { size: 4 }, { size: 10 }, { size: 11 } ])

  // Also emit equal ranked
  const ch2 = Chains.run(
    objects,
    Chains.Links.rank(ranker, { emitEqualRanked: true }));
  const out2 = await Async.toArray(ch2);
  expect(out2).toEqual([ { size: 4 }, { size: 10 }, { size: 10 }, { size: 11 } ])

  // Always emit max
  const ch3 = Chains.run(
    objects,
    Chains.Links.rank(ranker, { emitRepeatHighest: true }));
  const out3 = await Async.toArray(ch3);
  expect(out3).toEqual(
    [ { size: 4 }, { size: 4 }, { size: 10 }, { size: 10 }, { size: 10 }, { size: 10 }, { size: 11 } ]
  )
});

test('delay', async () => {
  const interval = 200;
  const ch = Chains.run(
    [ `1`, `2`, `3` ],
    Chains.Links.transform(v => Number.parseInt(v)),
    Chains.Links.delay<number>({ before: interval })
  );

  const tracker = intervalTracker();
  for await (const v of ch) {
    tracker.mark();
  }
  expect(isApprox(0.01, interval)(tracker.avg)).toBe(true);
});

test('tick', async () => {
  // Tick with interval
  const intervalMs = 50;
  const ch1 = Chains.run(
    Chains.From.timestamp({ interval: intervalMs }),
    Chains.Links.transform(v => v)
  );
  let tracker = intervalTracker();
  let count = 0;
  for await (const v of ch1) {
    tracker.mark();
    if (count++ > 20) break;
  }
  // Check that interval between iterations is about right
  expect(isApprox(0.01, intervalMs)(tracker.avg)).toBe(true)

  // Tick with max loops
  let loops = 10;
  const ch2 = Chains.run(
    Chains.From.timestamp({ loops, interval: intervalMs }),
    Chains.Links.transform(v => v)
  );
  tracker = intervalTracker();
  count = 0;
  for await (const v of ch2) {
    tracker.mark();
    count++;
  }
  // Check that loops is right
  expect(loops).toBe(count);

  // Check that interval between iterations is about right
  expect(isApprox(0.01, intervalMs)(tracker.avg)).toBe(true)

});