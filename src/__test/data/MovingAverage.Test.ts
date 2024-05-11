import test from 'ava';
import { movingAverage } from '../../data/MovingAverage.js';

test(`moving-average`, (t) => {
  const ma = movingAverage(5);
  const r1 = ma(1);
  const r2 = ma(2);
  const r3 = ma(3);
  const r4 = ma(4);
  const r5 = ma(5);
  const r6 = ma();
  const r7 = ma(Number.NaN);

  t.is(r1, 1);
  t.is(r2, 1.5);
  t.is(r3, 2);
  t.is(r4, 2.5);
  t.is(r5, 3);
  t.is(r5, r6);
  t.is(r5, r7);

  // Saturate with five values
  ma(5);
  ma(5);
  ma(5);
  const r8 = ma(5);
  t.is(r8, 5);
});