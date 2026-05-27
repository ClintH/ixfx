import type { InterpolateObjectOptions } from '../src/interpolate-object.js';
import { describe, expect, it } from 'vitest';
import { interpolatorObject } from '../src/interpolate-object.js';

describe(`interpolatorObject`, () => {
  const testA = {
    name: `Alice`,
    age: 30,
    city: `New York`,
    radians: 0,
    length: 10,
    point: { x: 0, y: 0 },
  };
  const testB = {
    name: `ALICE`,
    age: 4,
    city: `New York`,
    radians: 6.28,
    length: 10,
    point: { x: 10, y: 10 },
  };
  // it(`default`, async () => {
  //   const m = interpolatorObject(testA, {});
  //   expect(m(0)).toEqual(testA);
  //   expect(m(0.5)).toEqual(testA);
  //   expect(m(1)).toEqual(testA);
  // });
  it(`atob`, async () => {
    const m = interpolatorObject(testA, {}, { b: testB });
    expect(m(0)).toEqual(testA);
    expect(m(0.5)).toEqual(testA);
    expect(m(1)).toEqual(testB);
  });
});
