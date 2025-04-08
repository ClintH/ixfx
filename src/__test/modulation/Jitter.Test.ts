import expect from 'expect';
import { jitter, jitterAbsolute } from '../../modulation/Jitter.js';
import { repeatSync } from '../../flow/Repeat.js';
import { rangeCheck, someNearnessMany } from '../Include.js';

test(`relative-absolute`, () => {
  const tests = 10 * 1000;

  // 50% relative jitter of a value of 50
  const rel = jitterAbsolute({ relative: 0.5 });
  const relD = Array.from(repeatSync(() => rel(50), { count: tests }));

  // Check that jitter values are within range
  someNearnessMany(t, relD, 0.03, [ 25, 75 ]);
  rangeCheck(t, relD, {
    lowerExcl: 25,
    upperExcl: 75,
  });
});

test('absolute-absolute', () => {
  const tests = 10 * 1000;

  // -50..50 absolute jitter, not clamped
  const abs = jitterAbsolute({ absolute: 50, clamped: false });

  // ...of a value of 50
  const absD = Array.from(repeatSync(() => abs(50), { count: tests }));

  // ...should be a range of 0..100 when clamped
  someNearnessMany(t, absD, 0.07, [ 0, 100 ]);
  rangeCheck(t, absD, {
    lowerExcl: 0,
    upperExcl: 100,
  });
});

test('relative', () => {
  const tests = 10 * 1000;

  // 50% relative jitter of a value of 0.5
  const rel = jitter({ relative: 0.5 });
  const relD = Array.from(repeatSync(() => rel(0.5), { count: tests }));

  // Check that jitter values are within range
  someNearnessMany(t, relD, 0.0015, [ 0.25, 0.75 ]);
  rangeCheck(t, relD, {
    lowerExcl: 0.25,
    upperExcl: 0.75,
  });
});

test('absolute', async () => {
  const tests = 10 * 1000;

  // 50% absolute jitter, clamped
  const abs = jitter({ absolute: 0.5, clamped: true });
  // ...of a value of 0.5
  const absD = Array.from(repeatSync(() => abs(0.5), { count: tests }));

  // ...should be a range of 0..1 when clamped
  someNearnessMany(t, absD, 0.0015, [ 0, 1 ]);
  rangeCheck(t, absD, {
    lowerExcl: 0,
    upperExcl: 1,
  });
});
