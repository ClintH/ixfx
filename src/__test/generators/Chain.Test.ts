import test from 'ava';
import * as Chains from '../../generators/chain/index.js';
import { Async, count } from '../../generators/index.js';
import { sleep } from '../../flow/Sleep.js';
import { Elapsed } from '../../flow/index.js';
import { intervalTracker } from '../../data/IntervalTracker.js';
import { isApproximately } from '../../Numbers.js';

const getNumberData = () => Array.from([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);
const getStringData = () => getNumberData().map(v => v.toString());

test('asPromise', async t => {
  const timeout = 100;
  const loops = 10;
  t.plan(loops);
  t.timeout(timeout * (loops + 2));
  const tick = Chains.tick({ interval: timeout, loops });
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


test(`fromFunction`, async t => {
  // Low-level
  let produced = 0;
  const factory = Chains.fromFunction(() => {
    return produced++;
  });
  const f = factory();
  let count = 0;
  for await (const v of f) {
    t.is(v, count);
    count++;
    if (count === 5) break;
  }

  const r1 = await Chains.single(factory, 10);
  t.is(r1, 5);

  // In context
  produced = 0;
  const ch1 = Chains.run(
    Chains.fromFunction(() => produced++),
    Chains.Links.transform(v => `x:${ v }`),
    Chains.Links.take(5)
  );
  const ch1Result = (await Chains.asArray(ch1)).join(` `);
  t.deepEqual(ch1Result, `x:0 x:1 x:2 x:3 x:4`);
});

test(`lazy`, async t => {
  // Make sure input is not called on too early
  let produced = 0;
  let fired = false;
  const l1 = Chains.lazy().fromFunction(() => {
    if (!fired) t.fail(`Lazy function used before fired`);
    if (produced === 5) return;
    return produced++;
  });

  setTimeout(async () => {
    fired = true;
    const x = await l1.asArray([]);
    t.deepEqual(x, [ 0, 1, 2, 3, 4 ]);
  }, 200);


  const l3 = await Chains.lazy().max().input([ 4, 0, 10 ]).lastOutput();
  t.is(l3, 10);
  await sleep(250);
});

test(`chunk`, async t => {
  // Chunk of 1
  const ch1 = Chains.run(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.Links.chunk(1)
  );
  const r1 = await Chains.asArray(ch1);
  t.deepEqual(r1, [ [ 1 ], [ 2 ], [ 3 ], [ 4 ], [ 5 ], [ 6 ] ]);

  // Chunk of 2
  const ch2 = Chains.run(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.Links.chunk(2)
  );
  const r2 = await Chains.asArray(ch2);
  t.deepEqual(r2, [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ]);

  // Chunk of 4 - with remainders
  const ch3 = Chains.run(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.Links.chunk(4)
  );
  const r3 = await Chains.asArray(ch3);
  t.deepEqual(r3, [ [ 1, 2, 3, 4 ], [ 5, 6 ] ]);

  // Chunk of 4 - suppress remainders
  const ch4 = Chains.run(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.Links.chunk(4, false)
  );
  const r4 = await Chains.asArray(ch4);
  t.deepEqual(r4, [ [ 1, 2, 3, 4 ] ]);

  // Throw for zero-sized chunk
  await t.throwsAsync(async () => {
    const ch5 = Chains.run(
      [ 1, 2, 3, 4, 5, 6 ],
      Chains.Links.chunk(0)
    );
    const r5 = await Chains.asArray(ch5);
  });
});

test(`flatten`, async t => {
  // Simple
  const f = Chains.Links.flatten<string, string>(data => data.join(`-`));
  const r1 = await Chains.single(f, [ `a`, `b`, `c` ]);
  t.is(r1, `a-b-c`);

  const ch1 = Chains.run(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.Links.transform(v => `x:${ v }`),
    Chains.Links.chunk(3),
    Chains.Links.flatten(v => v.join(`-`))
  );
  const r2 = (await Chains.asArray(ch1)).join(`;`);
  t.is(r2, `x:1-x:2-x:3;x:4-x:5-x:6`)

});

test(`merge`, async t => {
  const t1 = Chains.run(
    Chains.tick({ interval: 50, loops: 10 }),
    Chains.Links.tally(),
    Chains.Links.transform(v => `a:${ v }`)
  );

  const t2 = Chains.run(
    Chains.tick({ interval: 10, loops: 9 }),
    Chains.Links.tally(),
    Chains.Links.transform(v => `b:${ v }`)
  );

  const t3 = Chains.run(
    Chains.tick({ interval: 30, loops: 8 }),
    Chains.Links.tally(),
    Chains.Links.transform(v => `c:${ v }`)
  );

  const output = await Chains.asArray(Chains.mergeFlat(t1, t2, t3));
  t.true(output.includes(`a:10`));
  t.true(output.includes(`b:9`));
  t.true(output.includes(`c:8`));
  t.is(output.length, 10 + 9 + 8);

  // for await (const v of Chains.merge(t1, t2, t3)) {
  //   console.log(v);
  // }
  //await sleep(5000);
});

test(`addToArray`, async t => {
  const data: Array<number> = [];
  Chains.addToArray(data, Chains.tick({ interval: 100, loops: 5 }));

  // Wait for all the data to arrive
  await sleep(505);
  t.is(data.length, 5);
});



test('asValue', async t => {
  const tick = Chains.tick({ interval: 100 });
  const tickValue = Chains.asValue(tick);
  const v1 = await tickValue();
  t.falsy(v1);
  await sleep(100);
  const v2 = await tickValue();
  t.truthy(v2);
});

test('asCallback', async t => {
  t.plan(5);
  const tick = Chains.tick({ interval: 100, loops: 5 });
  const tickValue = Chains.asCallback(tick, v => {
    t.assert(true, `callback triggered`);
  });
  await sleep(5 * 102);
});

test('transform', async t => {
  const tr = Chains.Links.transform<string, number>(v => Number.parseInt(v));
  const output = await Async.toArray(tr([ `1`, `2`, `3` ]));
  const expected = [ 1, 2, 3 ];
  t.deepEqual(output, expected);
})

test('filter', async t => {
  const data = getNumberData();
  const out1 = await Async.toArray(Chains.Links.filter<number>(v => v % 2 === 0)(data));
  t.deepEqual(out1, [ 2, 4, 6, 8, 10 ]);
});

test('take', async t => {
  const inputData = getNumberData();
  const limit = 5;
  const output = await Async.toArray(Chains.Links.take(limit)(inputData));
  t.deepEqual(output, inputData.slice(0, limit));

  const output2 = await Async.toArray(Chains.Links.take(0)(inputData));
  t.is(output2.length, 0);
});

test(`synchronise`, async t => {
  const t1 = Chains.tick({ interval: 10, loops: 10 });
  const t2 = Chains.tick({ interval: 20, loops: 5, asClockTime: true });
  const ch1 = Chains.synchronise(t1, t2);
  const output = await Chains.asArray(ch1);
  t.is(output.length, 5);
});

test(`debounce`, async t => {
  t.plan(3);
  //const elapsed = Elapsed.since();
  const ch1 = Chains.run(
    Chains.tick({ interval: 10, elapsed: 350 }),
    Chains.Links.debounce(100)
  );
  for await (const v of ch1) {
    t.assert(true);
  }
});

test('chain', async t => {
  // Input array, transform
  const ch1 = Chains.run(
    [ `1`, `2`, `3` ],
    Chains.Links.transform(v => Number.parseInt(v))
  );
  const out1 = await Async.toArray(ch1);
  t.deepEqual(out1, [ 1, 2, 3 ]);

  // Input array, transform & filter
  const data = getStringData();
  const ch2 = Chains.run(
    data,
    Chains.Links.transform(v => Number.parseInt(v)),
    Chains.Links.filter(v => v % 2 === 0)
  );
  const out2 = await Async.toArray(ch2);
  t.deepEqual(out2, [ 2, 4, 6, 8, 10 ]);

  // Generator input
  const ch3 = Chains.run(
    count(10, 1),
    Chains.Links.filter(v => v % 2 === 0)
  );
  const out3 = await Async.toArray(ch3);
  t.deepEqual(out3, [ 2, 4, 6, 8, 10 ])
})

test(`rank-array`, async t => {
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
  t.deepEqual(out1, [ 3 ])

  // Also emit equal ranked
  const ch2 = Chains.run(
    values,
    Chains.Links.rankArray(ranker, { emitEqualRanked: true }));
  const out2 = await Async.toArray(ch2);
  t.deepEqual(out2, [ 3, 3 ])

  // Always emit max
  const ch3 = Chains.run(
    values,
    Chains.Links.rankArray(ranker, { emitRepeatHighest: true }));
  const out3 = await Async.toArray(ch3);
  t.deepEqual(out3, [ 3, 3, 3, 3 ]);

  // -- Within arrays
  // const values = [ [1,2,3], [3,2,1], [1,2,1], [1,1,1] ];
  const ch4 = Chains.run(
    values,
    Chains.Links.rankArray(ranker, { withinArrays: true }));
  const out4 = await Async.toArray(ch4);
  t.deepEqual(out4, [ 3, 3, 2, 1 ])
});

test(`rank`, async t => {
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
  t.deepEqual(out1, [ { size: 4 }, { size: 10 }, { size: 11 } ])

  // Also emit equal ranked
  const ch2 = Chains.run(
    objects,
    Chains.Links.rank(ranker, { emitEqualRanked: true }));
  const out2 = await Async.toArray(ch2);
  t.deepEqual(out2, [ { size: 4 }, { size: 10 }, { size: 10 }, { size: 11 } ])

  // Always emit max
  const ch3 = Chains.run(
    objects,
    Chains.Links.rank(ranker, { emitRepeatHighest: true }));
  const out3 = await Async.toArray(ch3);
  t.deepEqual(out3, [ { size: 4 }, { size: 4 }, { size: 10 }, { size: 10 }, { size: 10 }, { size: 10 }, { size: 11 } ])
});

test('delay', async t => {
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
  t.true(isApproximately(interval, 0.01)(tracker.avg));
});

test('tick', async t => {
  // Tick with interval
  const intervalMs = 50;
  const ch1 = Chains.run(
    Chains.tick({ interval: intervalMs }),
    Chains.Links.transform(v => v)
  );
  let tracker = intervalTracker();
  let count = 0;
  for await (const v of ch1) {
    tracker.mark();
    if (count++ > 20) break;
  }
  // Check that interval between iterations is about right
  t.true(isApproximately(intervalMs, 0.01)(tracker.avg))

  // Tick with max loops
  let loops = 10;
  const ch2 = Chains.run(
    Chains.tick({ loops, interval: intervalMs }),
    Chains.Links.transform(v => v)
  );
  tracker = intervalTracker();
  count = 0;
  for await (const v of ch2) {
    tracker.mark();
    count++;
  }
  // Check that loops is right
  t.is(loops, count);

  // Check that interval between iterations is about right
  t.true(isApproximately(intervalMs, 0.01)(tracker.avg))

});