import expect from 'expect';
import * as Rx from '../../../rx/index.js';
test(`sync-to-object`, async () => {
  const s1 = [ 0, 1, 2, 3, 4 ];
  const s2 = [ 10, 11, 12, 13, 14 ];
  const createSources = () => ({
    fast: Rx.From.array(s1, { interval: 1 }),
    slow: Rx.From.array(s2, { interval: 20 })
  });

  // Test 1: Break
  const r1 = Rx.syncToObject(createSources(), { onSourceDone: `break` });
  const r1Array = await Rx.toArray(r1);
  // Since first source finishes before second has a chance to begin, we'll get an empty array
  expect(r1Array).toEqual([]);

  // Test 2: Allow source completion; setting to completed stream value to _undefined_
  const r2 = Rx.syncToObject(createSources(), { onSourceDone: `allow`, finalValue: `undefined` });
  const r2Array = await Rx.toArray(r2);
  expect(r2Array).toEqual([
    { fast: undefined, slow: 10 },
    { fast: undefined, slow: 11 },
    { fast: undefined, slow: 12 },
    { fast: undefined, slow: 13 },
    { fast: undefined, slow: 14 }
  ])

  // Test 3: Allow source completion; using last value from stream
  const r3 = Rx.syncToObject(createSources(), { onSourceDone: `allow`, finalValue: `last` });
  const r3Array = await Rx.toArray(r3);
  expect(r3Array).toEqual([
    { fast: 4, slow: 10 },
    { fast: 4, slow: 11 },
    { fast: 4, slow: 12 },
    { fast: 4, slow: 13 },
    { fast: 4, slow: 14 }
  ])

  // Tighter time interval
  const createSources2 = () => ({
    fast: Rx.From.array(s1, { interval: 2 }),
    slow: Rx.From.array(s2, { interval: 5 })
  });

  // Test 4: Break
  const r4 = Rx.syncToObject(createSources2(), { onSourceDone: `break` });
  const r4Array = await Rx.toArray(r4);

  // Hard to do testing since it is so timing dependent.
  if (r4Array[ 0 ]?.fast === 0) {
    expect(r4Array).toEqual([
      { fast: 0, slow: 10 }, { fast: 3, slow: 11 }
    ])
  } else {
    if (r4Array[ 0 ]?.fast === 1 && r4Array[ 0 ]?.slow === 10) {} else {
      expect(r4Array).toEqual([
        { fast: 1, slow: 10 }, { fast: 3, slow: 11 }
      ]);
    }
  }
});