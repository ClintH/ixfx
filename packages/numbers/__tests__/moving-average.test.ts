import { test, expect } from 'vitest';
import { movingAverageLight } from '../src/moving-average.js';

test(`moving-average-light`, () => {
  const ma = movingAverageLight(5);
  const r1 = ma(1);
  const r2 = ma(2);
  const r3 = ma(3);
  const r4 = ma(4);
  const r5 = ma(5);
  const r6 = ma();
  const r7 = ma(Number.NaN);

  expect(r1).toBe(1);
  expect(r2).toBe(1.5);
  expect(r3).toBe(2);
  expect(r4).toBe(2.5);
  expect(r5).toBe(3);
  expect(r5).toBe(r6);
  expect(r5).toBe(r7);

  // Saturate with five values
  ma(5);
  ma(5);
  ma(5);
  const r8 = ma(5);
  expect(r8).toBe(4.1808);
});

// import { test, expect } from 'vitest';
// import { movingAverageLight } from '../src/moving-average.js';

// test(`moving-average-light`, () => {
//   const ma = movingAverageLight(5);
//   const r1 = ma(1);
//   const r2 = ma(2);
//   const r3 = ma(3);
//   const r4 = ma(4);
//   const r5 = ma(5);
//   const r6 = ma();
//   const r7 = ma(Number.NaN);

//   expect(r1).toBe(1);
//   expect(r2).toBe(1.5);
//   expect(r3).toBe(2);
//   expect(r4).toBe(2.5);
//   expect(r5).toBe(3);
//   expect(r5).toBe(r6);
//   expect(r5).toBe(r7);

//   // Saturate with five values
//   ma(5);
//   ma(5);
//   ma(5);
//   const r8 = ma(5);
//   expect(r8).toBe(5);
// });