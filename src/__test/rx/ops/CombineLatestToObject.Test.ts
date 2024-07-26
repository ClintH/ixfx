import test from 'ava';
import * as Rx from '../../../rx/index.js';
test(`combine-latest-to-object`, async t => {
  const s1 = [ 0, 1, 2, 3, 4 ];
  const s2 = [ 10, 11, 12, 13, 14 ];
  const createSources = () => ({
    fast: Rx.From.array(s1, { interval: 1 }),
    slow: Rx.From.array(s2, { interval: 20 })
  });

  // Test 1 - Break when a source completes
  const r1 = Rx.combineLatestToObject(createSources(), { onSourceDone: `break` });
  const r1Array = await Rx.toArray(r1);
  if (r1Array[ 0 ]?.slow === 10) {
    if (r1Array.length === 5) {
      t.deepEqual(r1Array, [
        { fast: 0, slow: 10 }, { fast: 1, slow: 10 }, { fast: 2, slow: 10 }, { fast: 3, slow: 10 }, { fast: 4, slow: 10 }
      ]);
    } else {
      t.deepEqual(r1Array, [
        { fast: 1, slow: 10 }, { fast: 2, slow: 10 }, { fast: 3, slow: 10 }, { fast: 4, slow: 10 }
      ]);
    }
  } else {
    t.deepEqual(r1Array, [
      { fast: 0, slow: undefined }, { fast: 1, slow: undefined }, { fast: 2, slow: undefined }, { fast: 3, slow: undefined }, { fast: 4, slow: undefined }
    ]);
  }

  // Test 2 - Allow sources to complete
  const r2 = Rx.combineLatestToObject(createSources(), { onSourceDone: `allow` });
  const r2Array = await Rx.toArray(r2);
  const opt1 = [
    { fast: 0, slow: 10 },
    { fast: 1, slow: 10 },
    { fast: 2, slow: 10 },
    { fast: 3, slow: 10 },
    { fast: 4, slow: 10 },
    { fast: 4, slow: 10 },
    { fast: 4, slow: 11 },
    { fast: 4, slow: 12 },
    { fast: 4, slow: 13 },
    { fast: 4, slow: 14 }
  ];
  const opt1Same = JSON.stringify(opt1) === JSON.stringify(r2Array);

  const opt2 = [
    { fast: 0, slow: 10 },
    { fast: 1, slow: 10 },
    { fast: 2, slow: 10 },
    { fast: 3, slow: 10 },
    { fast: 4, slow: 10 },
    { fast: 4, slow: 11 },
    { fast: 4, slow: 12 },
    { fast: 4, slow: 13 },
    { fast: 4, slow: 14 }
  ]
  const opt2ASame = JSON.stringify(opt2) === JSON.stringify(r2Array);
  // Sometimes we miss the first value
  const opt2BSame = JSON.stringify(opt2.slice(1)) === JSON.stringify(r2Array);
  t.true(opt1Same || opt2ASame || opt2BSame);

});