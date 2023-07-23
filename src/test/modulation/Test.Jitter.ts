import test from 'ava';
import {jitter} from '../../modulation/Jitter.js';
import {repeat} from '../../flow/index.js';
import {rangeCheck, someNearnessMany} from '../util.js';

test('relative', t => {
  const tests = 10 * 1000;

  // 50% relative jitter of a value of 0.5
  const rel = jitter({relative: 0.5});
  const relD = repeat(tests, () => rel(0.5));

  // Check that jitter values are within range
  someNearnessMany(t, relD, 0.0015, [0.25, 0.75]);
  rangeCheck(t, relD, {
    lowerExcl: 0.25,
    upperExcl: 0.75
  });
  t.pass();
});

test('absolute', t => {
  const tests = 10 * 1000;

  // 50% absolute jitter, clamped
  const abs = jitter({absolute: 0.5, clamped: true});
  // ...of a value of 0.5
  const absD = repeat(tests, () => abs(0.5));
  // ...should be a range of 0..1 when clamped
  someNearnessMany(t, absD, 0.0015, [0, 1]);
  rangeCheck(t, absD, {
    lowerExcl: 0,
    upperExcl: 1
  });

  t.pass();
});