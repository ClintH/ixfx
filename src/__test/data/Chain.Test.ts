import test from 'ava';
import * as Chains from '../../data/Chain.js';
import { Async, count } from '../../Generators.js';
import { sleep } from '../../flow/Sleep.js';
import { Elapsed } from '../../flow/index.js';
import { isApproximately } from '../../Numbers.js';

const getData = () => Array.from([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);

test(`chunk`, async t => {
  // Chunk of 1
  const ch1 = Chains.chain<number, number[]>(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.chunk<number>(1)
  );
  const r1 = await Chains.asArray(ch1);
  t.deepEqual(r1, [ [ 1 ], [ 2 ], [ 3 ], [ 4 ], [ 5 ], [ 6 ] ]);

  // Chunk of 2
  const ch2 = Chains.chain<number, number[]>(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.chunk<number>(2)
  );
  const r2 = await Chains.asArray(ch2);
  t.deepEqual(r2, [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ]);

  // Chunk of 4 - with remainders
  const ch3 = Chains.chain<number, number[]>(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.chunk<number>(4)
  );
  const r3 = await Chains.asArray(ch3);
  t.deepEqual(r3, [ [ 1, 2, 3, 4 ], [ 5, 6 ] ]);

  // Chunk of 4 - suppress remainders
  const ch4 = Chains.chain<number, number[]>(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.chunk<number>(4, false)
  );
  const r4 = await Chains.asArray(ch4);
  t.deepEqual(r4, [ [ 1, 2, 3, 4 ] ]);

  // Throw for zero-sized chunk
  await t.throwsAsync(async () => {
    const ch5 = Chains.chain<number, number[]>(
      [ 1, 2, 3, 4, 5, 6 ],
      Chains.chunk<number>(0)
    );
    const r5 = await Chains.asArray(ch5);
  });
});

test(`flatten`, async t => {
  // Simple
  const f = Chains.flatten<string, string>(data => data.join(`-`));
  const r1 = await Chains.single(f, [ `a`, `b`, `c` ]);
  t.is(r1, `a-b-c`);

  const ch1 = Chains.chain<number, string>(
    [ 1, 2, 3, 4, 5, 6 ],
    Chains.transform<number, string>(v => `x:${ v }`),
    Chains.chunk<string>(3),
    Chains.flatten<string, string>(v => v.join(`-`))
  );
  const r2 = (await Chains.asArray(ch1)).join(`;`);
  t.is(r2, `x:1-x:2-x:3;x:4-x:5-x:6`)

});

test(`merge`, async t => {
  const t1 = Chains.chain<number, string>(
    Chains.tick({ interval: 50, loops: 10 }),
    Chains.tally(),
    Chains.transform<number, string>(v => `a:${ v }`)
  );

  const t2 = Chains.chain<number, string>(
    Chains.tick({ interval: 10, loops: 9 }),
    Chains.tally(),
    Chains.transform<number, string>(v => `b:${ v }`)
  );

  const t3 = Chains.chain<number, string>(
    Chains.tick({ interval: 30, loops: 8 }),
    Chains.tally(),
    Chains.transform<number, string>(v => `c:${ v }`)
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

test('asPromise', async t => {
  const timeout = 100;
  const loops = 10;
  t.plan(loops);
  const tick = Chains.tick({ interval: timeout, loops });
  const tickValue = Chains.asPromise(tick);

  setInterval(async () => {
    const v = await tickValue();
    t.assert(true);
  }, timeout);

  await sleep(timeout * (loops + 1));
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
  const tr = Chains.transform<string, number>(v => Number.parseInt(v));
  const output = await Async.toArray(tr([ `1`, `2`, `3` ]));
  const expected = [ 1, 2, 3 ];
  t.deepEqual(output, expected);
})

test('filter', async t => {
  const data = getData();
  const out1 = await Async.toArray(Chains.filter<number>(v => v % 2 === 0)(data));
  t.deepEqual(out1, [ 2, 4, 6, 8, 10 ]);
});

test('cap', async t => {
  const inputData = getData();
  const limit = 5;
  const output = await Async.toArray(Chains.cap(limit)(inputData));
  t.deepEqual(output, inputData.slice(0, limit));

  const output2 = await Async.toArray(Chains.cap(0)(inputData));
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
  const elapsed = Elapsed.since();
  const ch1 = Chains.chain(
    Chains.tick({ interval: 10, elapsed: 350 }),
    Chains.debounce(100)
  );
  for await (const v of ch1) {
    t.assert(true);
  }
});


test('chain', async t => {
  // Input array, transform
  const ch1 = Chains.chain(
    [ `1`, `2`, `3` ],
    Chains.transform<string, number>(v => Number.parseInt(v))
  );
  const out1 = await Async.toArray(ch1);
  t.deepEqual(out1, [ 1, 2, 3 ]);

  // Input array, transform & filter
  const data = getData();
  const ch2 = Chains.chain(
    data,
    Chains.transform<string, number>(v => Number.parseInt(v)),
    Chains.filter(v => v % 2 === 0)
  );
  const out2 = await Async.toArray(ch2);
  t.deepEqual(out2, [ 2, 4, 6, 8, 10 ]);

  // Generator input
  const ch3 = Chains.chain(
    count(10, 1),
    Chains.filter(v => v % 2 === 0)
  );
  const out3 = await Async.toArray(ch3);
  t.deepEqual(out3, [ 2, 4, 6, 8, 10 ])
})

test('delay', async t => {
  const ch = Chains.chain(
    [ `1`, `2`, `3` ],
    Chains.transform<string, number>(v => Number.parseInt(v)),
    Chains.delay({ before: 1000 })
  );

  t.pass();
});

test('tick', async t => {
  const ch = Chains.chain(
    Chains.tick({ interval: 1000 }),
    Chains.transform<string, number>(v => Number.parseInt(v)),
  );
  t.pass();
});