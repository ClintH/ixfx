import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
import { count } from '../../../numbers/Count.js';
import { isApproximately } from '../../../numbers/IsApproximately.js';
test(`combine-latest-to-object`, async t => {
  const s1 = [ 0, 1, 2, 3, 4 ];
  const s2 = [ 10, 11, 12, 13, 14 ];
  const createSources = () => ({
    fast: Rx.From.array(s1, { interval: 1 }),
    slow: Rx.From.array(s2, { interval: 20 })
  });

  // Test 1 - Break when a source completes
  const r1 = Rx.combineLatestToObject(createSources());
  const r1Array = await Rx.toArray(r1);
  t.deepEqual(r1Array, [
    { fast: 0, slow: undefined }, { fast: 1, slow: undefined }, { fast: 2, slow: undefined }, { fast: 3, slow: undefined }, { fast: 4, slow: undefined }
  ]);
  // Test 2 - Allow sources to complete
  const r2 = Rx.combineLatestToObject(createSources(), { onSourceDone: `allow` });
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