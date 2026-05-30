import { describe, expect, it } from 'vitest';
import { angleConvert, angleParse, degreeArc, degreesSum, degreeToGradian, degreeToRadian, degreeToTurn, gradianToDegree, gradianToRadian, radianArc, radiansSum, radianToDegree, radianToGradian, radianToTurn, turnToDegree, turnToRadian } from '../src/angles.js';
import { piPi } from '../src/pi.js';

describe(`degreeArc`, () => {
  it (`clockwise`, () => {
    // From zero CW
    expect(degreeArc(0, 90, `cw`)).toBe(-270);
    expect(degreeArc(0, 180, `cw`)).toBe(-180);
    expect(degreeArc(0, 270, `cw`)).toBe(-90);
    expect(degreeArc(0, 360, `cw`)).toBe(0);
    // Cross over pre zero
    expect(degreeArc(45, 315, `cw`)).toBe(-90);
    expect(degreeArc(45, 225, `cw`)).toBe(-180);
    expect(degreeArc(45, 135, `cw`)).toBe(-270);
    expect(degreeArc(45, 45, `cw`)).toBe(0);
  });
  it (`counterclockwise`, () => {
  // From zero CCW
    expect(degreeArc(0, 90, `ccw`)).toBe(90);
    expect(degreeArc(0, 180, `ccw`)).toBe(180);
    expect(degreeArc(0, 270, `ccw`)).toBe(270);
    expect(degreeArc(0, 360, `ccw`)).toBe(360);
    // Cross over post zero
    expect(degreeArc(315, 315, `ccw`)).toBe(0);
    expect(degreeArc(315, 225, `ccw`)).toBe(270);
    expect(degreeArc(315, 135, `ccw`)).toBe(180);
    expect(degreeArc(315, 45, `ccw`)).toBe(90);
  });

  it (`long`, () => {
    // From zero
    expect(degreeArc(0, 90, `long`)).toBe(-270);
    expect(degreeArc(0, 180, `long`)).toBe(180);
    expect(degreeArc(0, 270, `long`)).toBe(270);
    expect(degreeArc(0, 360, `long`)).toBe(360);
    // Cross over pre zero
    expect(degreeArc(45, 315, `long`)).toBe(270);
    expect(degreeArc(45, 225, `long`)).toBe(180);
    expect(degreeArc(45, 135, `long`)).toBe(-270);
    expect(degreeArc(45, 45, `long`)).toBe(0);

    expect(degreeArc(271, 315, `long`)).toBe(-316);
    expect(degreeArc(271, 225, `long`)).toBe(314);
    expect(degreeArc(271, 135, `long`)).toBe(224);
    expect(degreeArc(271, 45, `long`)).toBe(-226);
  });

  it (`short`, () => {
    // From zero
    expect(degreeArc(0, 90, `short`)).toBe(90);
    expect(degreeArc(0, 180, `short`)).toBe(180);
    expect(degreeArc(0, 270, `short`)).toBe(-90);
    expect(degreeArc(0, 360, `short`)).toBe(0);
    // Cross over pre zero
    expect(degreeArc(45, 315, `short`)).toBe(-90);
    expect(degreeArc(45, 225, `short`)).toBe(180);
    expect(degreeArc(45, 135, `short`)).toBe(90);
    expect(degreeArc(45, 45, `short`)).toBe(0);

    expect(degreeArc(271, 315, `short`)).toBe(44.000000000000014);
    expect(degreeArc(271, 225, `short`)).toBe(-45.999999999999986);
    expect(degreeArc(271, 135, `short`)).toBe(-136);
    expect(degreeArc(271, 45, `short`)).toBe(134.00000000000003);
  });
});

/**
 * ```
 *       90deg
 *       Pi/2
 *        |
 * Pi  ---+--- 0 (2Pi)
 * 180    |
 *       3PI/2
 *       270deg
 * ```
 */
describe(`radianArc`, () => {
  const threeQuarter = 3 * Math.PI / 2;
  const quarter = Math.PI / 2;
  const half = Math.PI;
  const full = Math.PI * 2;
  it (`clockwise`, () => {
    expect(radianArc(0, quarter, `cw`).toFixed(3)).toBe(`-4.712`);
    expect(radianArc(0, half, `cw`).toFixed(3)).toBe(`-3.142`);
    expect(radianArc(0, threeQuarter, `cw`).toFixed(3)).toBe(`-1.571`);
    expect(radianArc(0, full, `cw`).toFixed(3)).toBe(`0.000`);

    expect(radianArc(threeQuarter, 0, `cw`).toFixed(3)).toBe(`-4.712`);
    expect(radianArc(threeQuarter, quarter, `cw`).toFixed(3)).toBe(`-3.142`);
    expect(radianArc(threeQuarter, half, `cw`).toFixed(3)).toBe(`-1.571`);
    expect(radianArc(threeQuarter, full, `cw`).toFixed(3)).toBe(`-4.712`);
  });
  it (`counterclockwise`, () => {
  // From zero CCW
    expect(radianArc(0, quarter, `ccw`).toFixed(3)).toBe(`1.571`);
    expect(radianArc(0, half, `ccw`).toFixed(3)).toBe(`3.142`);
    expect(radianArc(0, threeQuarter, `ccw`).toFixed(3)).toBe(`4.712`);
    expect(radianArc(0, full, `ccw`).toFixed(3)).toBe(`6.283`);
  });

  it (`long`, () => {
    // From zero
    expect(radianArc(0, quarter, `long`).toFixed(3)).toBe(`-4.712`);
    expect(radianArc(0, half, `long`).toFixed(3)).toBe(`3.142`);
    expect(radianArc(0, threeQuarter, `long`).toFixed(3)).toBe(`4.712`);
    expect(radianArc(0, full, `long`).toFixed(3)).toBe(`6.283`);
  });

  it (`short`, () => {
    // From zero
    expect(radianArc(0, quarter, `short`).toFixed(3)).toBe(`1.571`);
    expect(radianArc(0, half, `short`).toFixed(3)).toBe(`3.142`);
    expect(radianArc(0, threeQuarter, `short`).toFixed(3)).toBe(`-1.571`);
    expect(radianArc(0, full, `short`).toFixed(3)).toBe(`0.000`);
  });
});

it(`radiansSum`, () => {
  expect(radiansSum(3.14, 1.57, false)).toBe(1.57);

  // From zero CCW
  expect(degreesSum(0, 90, false)).toBe(270);
  expect(degreesSum(0, 180, false)).toBe(180);
  expect(degreesSum(0, 270, false)).toBe(90);
  expect(degreesSum(0, 360, false)).toBe(0);

  // From zero CW
  expect(degreesSum(0, 90, true)).toBe(90);
  expect(degreesSum(0, 180, true)).toBe(180);
  expect(degreesSum(0, 270, true)).toBe(270);
  expect(degreesSum(0, 360, true)).toBe(0);

  // Pre zero CCW
  expect(degreesSum(45, 45, false)).toBe(0);
  expect(degreesSum(45, 90, false)).toBe(315);
  expect(degreesSum(45, 180, false)).toBe(225);
  expect(degreesSum(45, 270, false)).toBe(135);
  expect(degreesSum(45, 360, false)).toBe(45);

  // Post zero CW
  expect(degreesSum(315, 45, true)).toBe(0);
  expect(degreesSum(315, 90, true)).toBe(45);
  expect(Math.ceil(degreesSum(315, 180, true))).toBe(135);
  expect(Math.floor(degreesSum(315, 270, true))).toBe(225);
  expect(Math.ceil(degreesSum(315, 360, true))).toBe(315);
});

it(`radian-to-turn`, () => {
  // https://www.unitconverters.net/angle/radian-to-turn.htm
  expect(radianToTurn(1)).toEqual(0.15915494309189535);
  expect(radianToTurn(0.01)).toEqual(0.0015915494309189536);
});

it(`degree-to-turn`, () => {
  expect(degreeToTurn(1)).toEqual(0.002777777777777778);
  expect(degreeToTurn(360)).toEqual(1);
  expect(degreeToTurn(540)).toEqual(1.5);
});

describe(`to-radian`, () => {
  it(`turn-to-radian`, () => {
    expect(turnToRadian(1)).toEqual(piPi);
    expect(turnToRadian(2)).toEqual(2 * piPi);
    expect(turnToRadian(0)).toEqual(0);
    expect(turnToRadian(1.5)).toEqual(1.5 * piPi);
  });
  it(`gradian-to-radian`, () => {
    expect(gradianToRadian(10)).toEqual(0.157079633);
    expect(gradianToRadian(400)).toEqual(6.283185319999999);
  });
  it(`degree-to-radian`, () => {
    expect(degreeToRadian(30).toPrecision(4)).toBe(`0.5236`);
    expect(degreeToRadian(45).toPrecision(4)).toBe(`0.7854`);
    expect(degreeToRadian(60).toPrecision(4)).toBe(`1.047`);
    expect(degreeToRadian(90).toPrecision(4)).toBe(`1.571`);
    expect(degreeToRadian(120).toPrecision(4)).toBe(`2.094`);
    expect(degreeToRadian(135).toPrecision(4)).toBe(`2.356`);
    expect(degreeToRadian(150).toPrecision(4)).toBe(`2.618`);
    expect(degreeToRadian(180).toPrecision(4)).toBe(`3.142`);
    expect(degreeToRadian(200).toPrecision(4)).toBe(`3.491`);
    expect(degreeToRadian(270).toPrecision(4)).toBe(`4.712`);
    expect(degreeToRadian(360).toPrecision(4)).toBe(`6.283`);
  });
});

describe(`to-degree`, () => {
  it(`turn-to-degree`, () => {
    expect(turnToDegree(1, true)).toEqual(0);
    expect(turnToDegree(1, false)).toEqual(360);
    expect(turnToDegree(1.5, true)).toEqual(180);
    expect(turnToDegree(1.5, false)).toEqual(540);
  });
  it(`gradian-to-degree`, () => {
    expect(gradianToDegree(800, true)).toEqual(0);
    expect(gradianToDegree(800, false)).toEqual(720);
    expect(gradianToDegree(0, false)).toEqual(0);
    expect(gradianToDegree(100, false)).toEqual(90);
    expect(gradianToDegree(400, false)).toEqual(360);
    expect(gradianToDegree(400, true)).toEqual(0);
  });
  it(`radian-to-degree`, () => {
    expect(radianToDegree(0)).toBe(0);
    expect(Math.round(radianToDegree(0.5235))).toBe(30);
    expect(Math.round(radianToDegree(0.7853))).toBe(45);
    expect(Math.round(radianToDegree(1.047))).toBe(60);
    expect(Math.round(radianToDegree(1.5707))).toBe(90);
    expect(Math.round(radianToDegree(2.0943))).toBe(120);
    expect(Math.round(radianToDegree(3.1415))).toBe(180);
    expect(Math.round(radianToDegree(4.7123))).toBe(270);
    expect(Math.round(radianToDegree(6.2831))).toBe(360);
  });
});

it(`degree-to-gradian`, () => {
  expect(degreeToGradian(0)).toEqual(0);
  expect(Math.ceil(degreeToGradian(90))).toEqual(100);
  expect(Math.ceil(degreeToGradian(360))).toEqual(400);
  expect(Math.ceil(degreeToGradian(720))).toEqual(800);
});

it(`angle-parse`, () => {
  expect(angleParse(`100`)).toEqual({ value: 100, unit: `deg` });
  expect(angleParse(100)).toEqual({ value: 100, unit: `deg` });
  expect(angleParse(`100deg`)).toEqual({ value: 100, unit: `deg` });
  expect(angleParse(`10rad`)).toEqual({ value: 10, unit: `rad` });
  expect(angleParse(`1turn`)).toEqual({ value: 1, unit: `turn` });
  expect(angleParse(`20grad`)).toEqual({ value: 20, unit: `grad` });

  expect(angleParse(`n`)).toEqual({ value: 90, unit: `deg` });
  expect(angleParse(`e`)).toEqual({ value: 0, unit: `deg` });
  expect(angleParse(`s`)).toEqual({ value: 270, unit: `deg` });
  expect(angleParse(`w`)).toEqual({ value: 180, unit: `deg` });
  expect(angleParse(`ne`)).toEqual({ value: 45, unit: `deg` });
  expect(angleParse(`se`)).toEqual({ value: 315, unit: `deg` });
  expect(angleParse(`sw`)).toEqual({ value: 225, unit: `deg` });
  expect(angleParse(`nw`)).toEqual({ value: 135, unit: `deg` });
  expect(() => angleParse(`asf`)).toThrow();
  expect(() => angleParse(``)).toThrow();
  expect(() => angleParse(false as any as string)).toThrow();
  expect(() => angleParse({ blorp: true } as any as string)).toThrow();
});

describe(`convert`, () => {
  it(`to-radian`, () => {
    // Assumes units to be degrees
    expect(angleConvert(100, `rad`)).toEqual({ value: degreeToRadian(100), unit: `rad` });
    expect(angleConvert(`100deg`, `rad`)).toEqual({ value: degreeToRadian(100), unit: `rad` });
    expect(angleConvert(`100`, `rad`)).toEqual({ value: degreeToRadian(100), unit: `rad` });
    expect(angleConvert(`1.4rad`, `rad`)).toEqual({ value: 1.4, unit: `rad` });
    expect(angleConvert(`2turn`, `rad`)).toEqual({ value: turnToRadian(2), unit: `rad` });
    expect(angleConvert(`400grad`, `rad`)).toEqual({ value: 6.283185319999999, unit: `rad` });
    expect(angleConvert(`s`, `rad`)).toEqual({ value: degreeToRadian(270), unit: `rad` });
  });

  it(`to-degree`, () => {
    expect(angleConvert(100, `deg`)).toEqual({ value: 100, unit: `deg` });
    expect(angleConvert(`100deg`, `deg`)).toEqual({ value: 100, unit: `deg` });
    expect(angleConvert(`100`, `deg`)).toEqual({ value: 100, unit: `deg` });
    expect(angleConvert(`4rad`, `deg`)).toEqual({ value: radianToDegree(4), unit: `deg` });
    expect(angleConvert(`1.5turn`, `deg`)).toEqual({ value: 180, unit: `deg` });
    expect(angleConvert(`s`, `deg`)).toEqual({ value: 270, unit: `deg` });
  });

  it (`to-grad`, () => {
    expect(angleConvert(100, `grad`)).toEqual({ value: degreeToGradian(100), unit: `grad` });
    expect(angleConvert(`100deg`, `grad`)).toEqual({ value: degreeToGradian(100), unit: `grad` });
    expect(angleConvert(`1.5turn`, `grad`)).toEqual({ value: 600.0000000003945, unit: `grad` });
    expect(angleConvert(`4rad`, `grad`)).toEqual({ value: radianToGradian(4), unit: `grad` });
    expect(angleConvert(`s`, `grad`)).toEqual({ value: 299.99996999999996, unit: `grad` });
    expect(angleConvert(`100grad`, `grad`)).toEqual({ value: 100, unit: `grad` });
  });

  it(`to-turn`, () => {
    expect(angleConvert(100, `turn`)).toEqual({ value: degreeToTurn(100), unit: `turn` });
    expect(angleConvert(`100`, `turn`)).toEqual({ value: degreeToTurn(100), unit: `turn` });
    expect(angleConvert(`100deg`, `turn`)).toEqual({ value: degreeToTurn(100), unit: `turn` });
    expect(angleConvert(`4rad`, `turn`)).toEqual({ value: radianToTurn(4), unit: `turn` });
    expect(angleConvert(`s`, `turn`)).toEqual({ value: 0.75, unit: `turn` }); // 3/4
    expect(angleConvert(`50grad`, `turn`)).toEqual({ value: 0.125000000255054, unit: `turn` }); // 1/8th
  });

  expect(() => angleConvert(100, `blorp` as any as `deg`)).toThrow();
});
