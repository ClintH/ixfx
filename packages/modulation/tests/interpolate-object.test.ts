import * as Points from '@ixfx/geometry/point';
import { describe, expect, it } from 'vitest';
import { interpolatorObject } from '../src/interpolate/object.js';

describe(`interpolatorObject`, () => {
  const testA = {
    name: `Alice`,
    age: 30,
    city: `New York`,
    radians: 0,
    length: 10,
    flag: true,
    point: { x: 0, y: 0 },
  };
  const testB = {
    name: `ALICE`,
    age: 4,
    city: `New York`,
    radians: 6.28,
    length: 10,
    flag: false,
    point: { x: 10, y: 10 },
  };

  it(`default interpolation`, async () => {
    const m = interpolatorObject(testA, {}, { b: testB });
    expect(m(0)).toEqual(testA);
    expect(m(0.5)).toEqual({
      name: `ALIce`,
      age: 17,
      city: `New York`,
      length: 10,
      point: {
        x: 10,
        y: 10,
      },
      flag: false,
      radians: 3.14,
    });
    expect(m(1)).toEqual(testB);
  });

  it(`with options`, async () => {
    const m = interpolatorObject(testA, {}, {
      b: testB,
      optionsBooleans: { threshold: 0.25 },
      optionsNumbers: { easing: `sineOut`, limits: `clamp` },
      optionsStrings: { style: `centered`, tokenise: `character` },
      fallbackThreshold: 0.2,
    });
    expect(m(0)).toEqual(testA);
    expect(m(0.25)).toEqual({
      name: `AlIce`,
      age: 20.050230758507663,
      city: `New York`,
      length: 10,
      point: {
        x: 10,
        y: 10,
      },
      flag: false,
      radians: 2.403251955252764,
    });
    expect(m(0.5)).toEqual({
      name: `ALICe`,
      age: 11.615223689149767,
      city: `New York`,
      length: 10,
      point: {
        x: 10,
        y: 10,
      },
      flag: false,
      radians: 4.440630585851518,
    });
    expect(m(0.75)).toEqual({
      name: `ALICe`,
      age: 5.979132154706544,
      city: `New York`,
      length: 10,
      point: {
        x: 10,
        y: 10,
      },
      flag: false,
      radians: 5.801963464170881,
    });
    expect(m(1)).toEqual(testB);
  });

  it(`with handlers`, async () => {
    const m = interpolatorObject(testA, {
      point: Points.interpolator,
    }, { b: testB });
    expect(m(0)).toEqual(testA);
    expect(m(0.5)).toEqual({
      name: `ALIce`,
      age: 17,
      city: `New York`,
      length: 10,
      point: {
        x: 5,
        y: 5,
      },
      flag: false,
      radians: 3.14,
    });
    expect(m(1)).toEqual(testB);
  });
});
