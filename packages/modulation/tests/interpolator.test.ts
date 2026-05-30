import { describe, expect, it } from 'vitest';
import { interpolatorAngle } from '../src/interpolate/angle.js';
import { interpolatorBoolean } from '../src/interpolate/boolean.js';

// it(`interpolatorInterval`, async () => {
//   const v = interpolatorInterval(100);
//   const values: number[] = [];

//   for await (const _ of delayLoop(9)) {
//     const value = v();
//     values.push(round(1, value));
//     if (value >= 1)
//       break;
//   }
// });

describe(`interpolatorAngle`, () => {
  const normalizeAngle = (value: number) => {
    const normalized = value % 360;
    return normalized < 0 ? normalized + 360 : normalized;
  };

  const floorAngle = (value: number) => Math.floor(normalizeAngle(value));

  const expectAngleInterpolation = (
    a: number,
    b: number,
    amounts: number[],
    expected: number[],
    direction = `short`,
  ) => {
    expect(
      amounts.length,
      `Expected amounts/expected lengths to match: a=${a}, b=${b}, direction=${direction}`,
    ).toBe(expected.length);
    amounts.forEach((amount, index) => {
      const expectedValue = expected[index];
      const forward = interpolatorAngle(amount, a, b, { direction });
      const reverse = interpolatorAngle(1 - amount, b, a, { direction });

      expect(floorAngle(forward), `Forward mismatch: a=${a}, b=${b}, amount=${amount}, expected=${expectedValue}, direction=${direction}`).toEqual(
        floorAngle(expectedValue),
      );
      expect(floorAngle(reverse), `Reverse mismatch: a=${b}, b=${a}, amount=${1 - amount}, expected=${expectedValue}, direction=${direction}`).toEqual(
        floorAngle(expectedValue),
      );
    });
  };

  // const piPi = Math.PI * 2;
  // const south = 3 * Math.PI / 2;
  // const west = Math.PI;
  // const north = Math.PI / 2;
  // const east = 0;
  it(`short`, () => {
    // East to north (ccw)
    expectAngleInterpolation(0, 90, [0, 0.5, 0.75, 1], [0, 45, 67, 90]);

    // East to west (ccw)
    expectAngleInterpolation(0, 181, [0.5, 0.75], [270, 225]);

    // East to south (cw)
    expectAngleInterpolation(0, 270, [0.5, 0.75], [315, 292]);

    // North to west
    expectAngleInterpolation(90, 180, [0.5], [135]);

    // North to south
    expectAngleInterpolation(91, 270, [0.75], [225]);

    // East to north
    expectAngleInterpolation(180, 90, [0.5, 0.75], [135, 112]);

    // East to self, east to south
    expectAngleInterpolation(180, 180, [0.5], [180]);
    expectAngleInterpolation(180, 270, [0.75], [247]);

    // South to west
    expectAngleInterpolation(270, 180, [0.5], [225]);
    // South to east
    expectAngleInterpolation(270, 0, [0.5], [315]);

    // South to self
    expectAngleInterpolation(270, 270, [0.75], [270]);

    // North-east to south-east
    expectAngleInterpolation(
      45,
      315,
      [0.25, 0.5, 0.75],
      [22, 0, 337],
    );

    // South-east to north-east
    expectAngleInterpolation(
      315,
      45,
      [0.25, 0.5, 0.75],
      [337, 360, 22],
    );
  });

  it(`long`, () => {
    // East to north (ccw)
    expectAngleInterpolation(0, 90, [0, 0.5, 0.75, 1], [0, 225, 157, 90], `long`);

    // East to west (ccw)
    expectAngleInterpolation(0, 181, [0.5, 0.75], [90, 135], `long`);

    // East to south (cw)
    expectAngleInterpolation(0, 269, [0.5, 0.75], [134, 201], `long`);

    // North to west
    expectAngleInterpolation(90, 179, [0.5], [314], `long`);

    // North to south
    expectAngleInterpolation(91, 270, [0.75], [315], `long`);

    // East to north
    expectAngleInterpolation(180, 90, [0.5, 0.75], [315, 22], `long`);

    // East to self, east to south
    expectAngleInterpolation(180, 180, [0.5], [180], `long`);
    expectAngleInterpolation(180, 270, [0.75], [337], `long`);

    // South to west
    expectAngleInterpolation(270, 180, [0.5], [45], `long`);
    // South to east
    expectAngleInterpolation(271, 0, [0.5], [135], `long`);

    // South to self
    expectAngleInterpolation(270, 270, [0.75], [270], `long`);

    // North-east to south-east
    expectAngleInterpolation(
      46,
      315,
      [0.25, 0.5, 0.75],
      [113, 180, 247],
      `long`,
    );

    // South-east to north-east
    expectAngleInterpolation(
      315,
      46,
      [0.25, 0.5, 0.75],
      [247, 180, 113],
      `long`,
    );
  });
  // it(`angles`, () => {
  //   expect(interpolatorAngle(`0deg`, `270deg`)(0)).toEqual(0);
  //   expect(interpolatorAngle(`0deg`, `270deg`)(0.25)).toEqual(135);
  //   expect(interpolatorAngle(`0deg`, `270deg`)(1)).toEqual(270);

  //   expect(interpolatorAngle(`0deg`, `270deg`, { direction: `long` })(0)).toEqual(0);
  //   expect(interpolatorAngle(`0deg`, `270deg`, { direction: `long` })(0.25)).toEqual(315);
  //   expect(interpolatorAngle(`0deg`, `270deg`, { direction: `long` })(1)).toEqual(270);
  // });
});

describe(`interpolatorBoolean`, () => {
  it(`default`, () => {
    const i = interpolatorBoolean(false, true);
    expect(i(0)).toBe(false);
    expect(i(0.25)).toBe(false);
    expect(i(0.5)).toBe(true);
    expect(i(0.75)).toBe(true);
    expect(i(1)).toBe(true);
  });
  it(`threshold`, () => {
    const i = interpolatorBoolean(false, true, { threshold: 0.8 });
    expect(i(0)).toBe(false);
    expect(i(0.25)).toBe(false);
    expect(i(0.5)).toBe(false);
    expect(i(0.8)).toBe(true);
    expect(i(0.81)).toBe(true);
    expect(i(1)).toBe(true);
  });
});