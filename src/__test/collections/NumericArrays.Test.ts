import test from 'ava';
import { average, minMaxAvg } from '../../collections/NumericArrays.js';
import { count } from '../../Generators.js';

test(`minMaxAvg`, (t) => {
  const startIndex = 5;
  const endIndex = 7;
  const r1 = minMaxAvg([1, 2, 3, 4, 5]);
  t.is(r1.min, 1);
  t.is(r1.max, 5);
  t.is(r1.total, 15);
  t.is(r1.avg, 3);

  const r1Gen = minMaxAvg(count(5, 1));
  t.is(r1Gen.avg, r1.avg);
  t.is(r1Gen.min, r1.min);
  t.is(r1Gen.max, r1.max);
  t.is(r1Gen.total, r1.total);

  const r2 = minMaxAvg([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { startIndex });
  const r2Gen = minMaxAvg(count(10, 1), { startIndex });

  const r2StartAt5 = minMaxAvg([6, 7, 8, 9, 10]);
  t.is(r2.avg, r2StartAt5.avg);
  t.is(r2.min, r2StartAt5.min);
  t.is(r2.max, r2StartAt5.max);
  t.is(r2.total, r2StartAt5.total);

  t.is(r2.avg, r2Gen.avg);
  t.is(r2.min, r2Gen.min);
  t.is(r2.max, r2Gen.max);
  t.is(r2.total, r2Gen.total);

  const r3 = minMaxAvg([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], {
    startIndex,
    endIndex,
  });
  t.is(r3.avg, 6.5);
  t.is(r3.total, 13);
  t.is(r3.min, 6);
  t.is(r3.max, 7);

  const r3Gen = minMaxAvg(count(10, 1), { startIndex, endIndex });
  const r3StartAtEnd = minMaxAvg([...count(10, 1)].slice(startIndex, endIndex));
  t.is(r3StartAtEnd.avg, r3.avg);
  t.is(r3StartAtEnd.min, r3.min);
  t.is(r3StartAtEnd.max, r3.max);
  t.is(r3StartAtEnd.total, r3.total);

  t.is(r3.avg, r3Gen.avg);
  t.is(r3.min, r3Gen.min);
  t.is(r3.max, r3Gen.max);
  t.is(r3.total, r3Gen.total);
});

test(`average`, (t) => {
  const a = [1];
  t.is(average(a), 1);

  const b = [1, 2, 3, 4, 5];
  t.is(average(b), 3);

  const c = [-5, 5];
  t.is(average(c), 0);

  const d = [1, 0, null, undefined, NaN];
  // @ts-ignore
  t.is(average(d), 0.5);

  const e = [1, 1.4, 0.9, 0.1];
  t.is(average(e), 0.85);
});
