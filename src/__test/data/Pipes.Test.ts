import test from 'ava';
import { fromArray, connect, insert, filter, filterAB, asArray, cap, bidi, readArray } from '../../data/Pipes.js';
import { sleep } from '../../flow/Sleep.js';
import { arrayValuesEqual } from '../util.js';


const getData = () => Array.from([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);

test('insert', t => {
  const a = bidi<number>();
  const b = bidi<number>();
  const c = bidi<number>();

  // A->C
  connect(a, c);

  // Now A->B->C
  insert(a, b);

  const cOutput = asArray(c);
  const data = getData();

  // Send data into A
  readArray(a, data);

  // Expect to see it at C
  return cOutput.then(v => {
    t.is(v.length, data.length);
    t.deepEqual(v, data);
  })
});

test('connect', t => {
  const a = bidi();
  const b = bidi();

  connect(a, b);

  const data = getData();
  const collectB = asArray(b);
  readArray(a, data);

  // Check that all the values that are read into A make it to B's output
  return collectB.then(v => {
    t.is(v.length, data.length);
    t.deepEqual(v, data);
  });
});

test('cap', async t => {
  const length = 3;
  const pipe = bidi();
  const capped = cap(pipe, { length });
  const cappedAsArray = asArray(capped);

  readArray(pipe, getData());
  return cappedAsArray.then(v => {
    // Expect to see length of array
    t.is(v.length, length);
    // Expect to see first items of array
    t.deepEqual(v, getData().slice(0, 3));
  });

});

test('arrayFromOutlet', async t => {
  // Default options
  const feedInterval = 200;
  const data = getData();
  const pipe = fromArray(data, { interval: 200 });
  t.timeout(feedInterval * (data.length + 2));
  const results = await asArray(pipe);
  arrayValuesEqual(t, results, data);

  // maxValues option
  const maxValues = 3;
  const data2 = getData();
  const pipe2 = fromArray(data2, { interval: 200 });
  t.timeout(feedInterval * (maxValues + 2));
  const results2 = await asArray(pipe2, { maximumValues: maxValues });
  t.true(results2.length === maxValues);
});

test('fromArray', async t => {
  const feedInterval = 200;
  const data = getData();
  t.plan(data.length * 2 + 3);

  // Default
  const pipe = fromArray(data, { interval: 200 });
  const results: Array<Number> = [];
  pipe.setOutlet(v => {
    t.assert(true);
    results.push(v);
  });
  t.timeout(feedInterval * (data.length + 1));
  await sleep(feedInterval * (data.length + 1));
  t.like(results, data);

  // Reverse order
  const pipe2 = fromArray(data, { interval: 200, startIndex: -1, moveBy: -1 });
  const results2: Array<Number> = [];
  pipe2.setOutlet(v => {
    t.assert(true);
    results2.push(v);
  });
  t.timeout(feedInterval * (data.length + 1));
  await sleep(feedInterval * (data.length + 1));

  t.like(results2, data.reverse());

});

test('filter', t => {
  const pipe = bidi<number>();
  const data = getData();
  const filtered = filter(pipe, v => v % 2 === 0);
  const filteredAsArray = asArray(filtered);
  readArray(pipe, data);

  return filteredAsArray.then(v => {
    t.is(v.length, data.length / 2);
    t.deepEqual(v, [ 2, 4, 6, 8, 10 ]);
  });
});

test('filterAB', t => {
  const pipe = bidi<number>();
  const data = getData();
  const [ a, b ] = filterAB(pipe, v => v % 2 === 0);
  const filteredA = asArray(a);
  const filteredB = asArray(b);
  readArray(pipe, data);

  return Promise.all([ filteredA, filteredB ]).then(results => {
    const [ resultA, resultB ] = results;
    t.is(resultA.length, data.length / 2);
    t.is(resultB.length, data.length / 2);
    t.deepEqual(resultA, [ 2, 4, 6, 8, 10 ]);
    t.deepEqual(resultB, [ 1, 3, 5, 7, 9 ]);

  });

});