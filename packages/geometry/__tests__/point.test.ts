import { test, expect, assert, describe } from 'vitest';

import * as Points from '../src/point/index.js';
import { divide, divider } from '../src/point/divider.js';
import { radianToDegree } from '../src/angles.js';
import { isApprox } from '@ixfxfun/numbers';

function closeToPercent(input: number, target: number, percent: number = 0.001) {
  const diff = (Math.abs(target - input) / target);
  if (target === input) return [ true ];
  if (diff <= percent) return [ true ];
  return [ false, `Value: ${ input } target: ${ target } diff%: ${ diff * 100 }` ];
  //t.fail(`Value: ${ input } target: ${ target } diff%: ${ diff * 100 }`);
}

describe(`point`, () => {
  test(`bbox-3d`, () => {
    const r1 = Points.bbox3d(
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 },
      { x: 2, y: 2, z: 2 }
    );
    expect(r1).toEqual({ x: 0, y: 0, width: 2, height: 2, z: 0, depth: 2 })

    const r2 = Points.bbox3d(
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: -1 },
      { x: 2, y: 2, z: 2 }
    );
    expect(r2).toEqual({ x: 0, y: 0, width: 2, height: 2, z: -1, depth: 3 })

  });

  test(`from-string`, () => {
    expect(Points.fromString(`10,20`)).toEqual({ x: 10, y: 20 });
    expect(Points.fromString(`10,20,30`)).toEqual({ x: 10, y: 20, z: 30 });
    expect(Points.fromString(`10,20,`)).toEqual({ x: 10, y: 20, z: NaN });
    expect(Points.fromString(`10,a`)).toEqual({ x: 10, y: NaN });
    expect(Points.fromString(`b,20`)).toEqual({ x: NaN, y: 20 });
    expect(Points.fromString(`asdf`)).toEqual({ x: NaN, y: NaN });

  });

  test(`angleRadianCircle`, () => {
    expect(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: 1, y: 1 }))).toBe(45);
    expect(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: -1, y: -1 }))).toBe(225);
    expect(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: 1, y: 0 }))).toBe(0);
    expect(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: -1, y: 1 }))).toBe(135);
    expect(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: 1, y: -1 }))).toBe(315);
    expect(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: 0, y: 1 }))).toBe(90);


  });


  test(`abs`, () => {
    expect(Points.abs({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 });
    expect(Points.abs({ x: -1, y: 2 })).toEqual({ x: 1, y: 2 });
    expect(Points.abs({ x: 1, y: -2 })).toEqual({ x: 1, y: 2 });

    expect(Points.abs({ x: 1, y: 2, z: 3 })).toEqual({ x: 1, y: 2, z: 3 });
    expect(Points.abs({ x: -1, y: 2, z: 3 })).toEqual({ x: 1, y: 2, z: 3 });
    expect(Points.abs({ x: 1, y: -2, z: 3 })).toEqual({ x: 1, y: 2, z: 3 });
  });

  test(`apply`, () => {
    const f = (v: number, field: string) => {
      if (field === `x`) return v * 2;
      if (field === `y`) return v * 3;
      if (field === `z`) return v * 10;
      return v;
    }

    expect(Points.apply({ x: 1, y: 2, z: 3 }, f)).toEqual({ x: 2, y: 6, z: 30 });
    expect(Points.apply({ x: 1, y: 2 }, f)).toEqual({ x: 2, y: 6 });
  });


  test(`withinRange`, () => {

    expect(Points.withinRange({ x: -1, y: -1 }, Points.Empty, 1)).toBe(true);
    expect(Points.withinRange({ x: 1, y: 1 }, Points.Empty, 1)).toBe(true);
    expect(Points.withinRange({ x: 1, y: 1 }, Points.Empty, 0)).toBe(false);
    expect(Points.withinRange({ x: 2, y: 2 }, Points.Empty, 1)).toBe(false);

    // Both coords have to be within range
    expect(Points.withinRange({ x: 1, y: 1 }, { x: 100, y: 1 }, 1)).toBe(false);
    expect(Points.withinRange({ x: 1, y: 1 }, { x: 1, y: 100 }, 1)).toBe(false);

    expect(Points.withinRange({ x: 100, y: 100 }, { x: 101, y: 101 }, 1)).toBe(true);
    expect(Points.withinRange({ x: 100, y: 100 }, { x: 105, y: 101 }, { x: 5, y: 1 })).toBe(true);
    expect(Points.withinRange({ x: 100, y: 100 }, { x: 105, y: 105 }, { x: 5, y: 1 })).toBe(false);

    // With point as range
    expect(Points.withinRange(Points.Empty, Points.Empty, Points.Empty)).toBe(true);
    expect(Points.withinRange(Points.Empty, { x: 1, y: 100 }, { x: 1, y: 100 })).toBe(true);

    expect(() => Points.withinRange(Points.Empty, Points.Placeholder, 1)).toThrow();
    // @ts-expect-error
    expect(() => Points.withinRange(Points.Empty, Points.Empty, false)).toThrow();
    expect(() => Points.withinRange(Points.Empty, Points.Empty, Number.NaN)).toThrow();
    // @ts-expect-error
    expect(() => Points.withinRange({}, Points.Empty, 1)).toThrow();
    // @ts-expect-error
    expect(() => Points.withinRange(Points.Empty, {}, 1)).toThrow();


  });

  test(`round`, () => {
    assert.deepEqual(Points.round({ x: 1.12345, y: 2.6789 }, 2), { x: 1.12, y: 2.67 });
    assert.deepEqual(Points.round({ x: -1.12345, y: -2.6789 }, 2), { x: -1.13, y: -2.68 });

    // x,y separate
    assert.deepEqual(Points.round(1.12345, 2.6789, 2), { x: 1.12, y: 2.67 });

    // with data
    // @ts-expect-error
    assert.deepEqual(Points.round({ x: 1.12345, y: 2.6789, colour: `red` }, 2), { x: 1.12, y: 2.67, colour: `red` });

  })

  test(`normalise`, () => {
    // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
    assert.deepEqual(Points.round(Points.normalise({ x: 5, y: 2 }), 2), { x: 0.92, y: 0.37 });
    assert.deepEqual(Points.round(Points.normalise({ x: -5, y: 2 }), 2), { x: -0.93, y: 0.37 });
    assert.deepEqual(Points.round(Points.normalise({ x: 5, y: -2 }), 2), { x: 0.92, y: -0.38 });
  });

  test(`normaliseByRect`, () => {
    assert.deepEqual(Points.normaliseByRect(100, 100, 100, 100), { x: 1, y: 1 });
    assert.deepEqual(Points.normaliseByRect(0, 0, 100, 100), { x: 0, y: 0 });
    assert.deepEqual(Points.normaliseByRect(50, 50, 100, 100), { x: 0.5, y: 0.5 });

    assert.deepEqual(Points.normaliseByRect(200, 50, 100, 100), { x: 2, y: 0.5 });
    assert.deepEqual(Points.normaliseByRect(50, 200, 100, 100), { x: 0.5, y: 2 });

    assert.deepEqual(Points.normaliseByRect({ x: 100, y: 100 }, 100, 100), { x: 1, y: 1 });
    assert.deepEqual(Points.normaliseByRect({ x: 0, y: 0 }, 100, 100), { x: 0, y: 0 });
    assert.deepEqual(Points.normaliseByRect({ x: 50, y: 50 }, 100, 100), { x: 0.5, y: 0.5 });
  });

  test(`placeholder`, () => {
    expect(Points.isPlaceholder(Points.Placeholder)).toBe(true);
    expect(Points.isPlaceholder(Points.Placeholder3d)).toBe(true);
    expect(Points.isPlaceholder({ x: Number.NaN, y: Number.NaN })).toBe(true);
    expect(Points.isPlaceholder({ x: Number.NaN, y: Number.NaN, z: Number.NaN })).toBe(true);
    expect(Points.isPlaceholder({ x: Number.NaN, y: 1 })).toBe(false);
    expect(Points.isPlaceholder({ x: 1, y: Number.NaN })).toBe(false);
    expect(Points.isPlaceholder({ x: Number.NaN, y: Number.NaN, z: 1 })).toBe(false);
    expect(Points.isPlaceholder({ x: 0, y: Number.NaN, z: Number.NaN })).toBe(false);
    expect(Points.isPlaceholder({ x: Number.NaN, y: 0, z: Number.NaN })).toBe(false);

  });
  test(`wrap`, () => {
    // Within range
    assert.deepEqual(Points.wrap({ x: 0, y: 0 }, { x: 100, y: 100 }), { x: 0, y: 0 });

    assert.deepEqual(Points.wrap({ x: 50, y: 50 }, { x: 100, y: 100 }), { x: 50, y: 50 });
    assert.deepEqual(Points.wrap({ x: 99, y: 99 }, { x: 100, y: 100 }), { x: 99, y: 99 });

    // On the boundary
    assert.deepEqual(Points.wrap({ x: 100, y: 100 }, { x: 100, y: 100 }), { x: 0, y: 0 });

    // Wrapped x
    assert.deepEqual(Points.wrap({ x: 150, y: 99 }, { x: 100, y: 100 }), { x: 50, y: 99 });
    assert.deepEqual(Points.wrap({ x: -50, y: 99 }, { x: 100, y: 100 }), { x: 50, y: 99 });

    // Wrapped y
    assert.deepEqual(Points.wrap({ x: 50, y: 150 }, { x: 100, y: 100 }), { x: 50, y: 50 });
    assert.deepEqual(Points.wrap({ x: 50, y: -50 }, { x: 100, y: 100 }), { x: 50, y: 50 });

    // Wrapped x & y
    assert.deepEqual(Points.wrap({ x: 150, y: 150 }, { x: 100, y: 100 }), { x: 50, y: 50 });

  });

  test(`clamp`, () => {
    // Within range
    assert.deepEqual(Points.clamp({ x: 10, y: 20 }, 0, 100), { x: 10, y: 20 });
    assert.deepEqual(Points.clamp({ x: 10, y: 20, z: 30 }, 0, 100), { x: 10, y: 20, z: 30 });

    assert.deepEqual(Points.clamp({ x: 100, y: 100 }, 0, 100), { x: 100, y: 100 });
    assert.deepEqual(Points.clamp({ x: 100, y: 100, z: 100 }, 0, 100), { x: 100, y: 100, z: 100 });

    // Out of range x
    assert.deepEqual(Points.clamp({ x: 101, y: 100 }, 0, 100), { x: 100, y: 100 });
    assert.deepEqual(Points.clamp({ x: -1, y: 100 }, 0, 100), { x: 0, y: 100 });

    // Out of range y
    assert.deepEqual(Points.clamp({ x: 100, y: 101 }, 0, 100), { x: 100, y: 100 });
    assert.deepEqual(Points.clamp({ x: 100, y: -1 }, 0, 100), { x: 100, y: 0 });

    // Out of range z
    assert.deepEqual(Points.clamp({ x: 10, y: 20, z: 101 }, 0, 100), { x: 10, y: 20, z: 100 });
    assert.deepEqual(Points.clamp({ x: 10, y: 20, z: -1 }, 0, 100), { x: 10, y: 20, z: 0 });


  });

  test(`clampMagnitude`, () => {
    const pt = { x: 100, y: 100 };
    const distance = Points.distance(pt);

    assert.deepEqual(Points.clampMagnitude(pt, distance), pt);

    const half = Points.clampMagnitude(pt, distance / 2);
    expect(Points.distance(half)).toBe(distance / 2);


    const double = Points.clampMagnitude(pt, distance * 2, distance * 2);
    expect(Points.distance(double)).toBe(distance * 2);


  });

  test(`distance`, () => {
    // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
    const approx = isApprox(0.001);
    expect(approx(Points.distance({ x: 5, y: 2 }), 5.385164807134504)).toBe(true)
    expect(approx(Points.distance({ x: -5, y: 2 }), 5.385164807134504)).toBe(true);
    expect(approx(Points.distance({ x: 5, y: -2 }), 5.385164807134504)).toBe(true);

    // Expected results from: https://www.calculatorsoup.com/calculators/geometry-solids/distance-two-points.php
    expect(
      approx(Points.distance({ x: 7, y: 4, z: 3 }, { x: 17, y: 6, z: 2 }), 10.246)
    ).toBe(true);
    expect(
      approx(Points.distance({ x: 0, y: 0, z: 0 }, { x: 17, y: 6, z: 2 }), 18.138)
    ).toBe(true);
    expect(approx(Points.distance({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }), 0)).toBe(true);
    expect(
      approx(Points.distance({ x: 35, y: 10, z: 90 }, { x: -30, y: -12, z: -20 }), 129.649)
    ).toBe(true);
  });

  test(`angleRadian`, () => {
    // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
    expect(closeToPercent(Points.angleRadian({ x: 0, y: 10 }), 1.5708)).toEqual([ true ]); // 90 degrees
    expect(closeToPercent(Points.angleRadian({ x: 10, y: 0 }), 0)).toEqual([ true ]); // 0 degrees
    expect(closeToPercent(Points.angleRadian({ x: 2, y: 5 }), 1.190290375284613456)).toEqual([ true ]); // 68 degrees
  });

  test(`divide`, () => {
    assert.deepEqual(divide({ x: 5, y: 10 }, 2, 2), { x: 2.5, y: 5 });
    assert.deepEqual(divide({ x: 10, y: 5 }, { x: 5, y: 2 }), { x: 2, y: 2.5 });
    assert.deepEqual(divide({ x: 10, y: 5 }, 5, 2), { x: 2, y: 2.5 });

    // A contains 0
    assert.deepEqual(divide({ x: 0, y: 5 }, { x: 5, y: 2 }), { x: 0, y: 2.5 });
    assert.deepEqual(divide({ x: 10, y: 0 }, 5, 2), { x: 2, y: 0 });

    // Should not throw if a contains a zero
    // expect(() => divide({x: 0, y: 5}, 1, 11)).toThrow();
    // expect(() => divide({x: 10, y: 0}, 1, 1)).toThrow();

    // B contains zero
    expect(() => divide({ x: 10, y: 5 }, { x: 0, y: 10 })).toThrow(); //toEqual({ x: Infinity, y: 0.5 });
    // expect(
    //   () => t.like(divide({ x: 10, y: 5 }, { x: 0, y: 10 }), { x: Infinity, y: 0.5 })
    // ).toThrow();

    expect(() => divide({ x: 10, y: 5 }, { x: 10, y: 0 })).toThrow();
    // expect(
    //   () => t.like(divide({ x: 10, y: 5 }, { x: 10, y: 0 }), { x: 1, y: Infinity })
    // ).toThrow();

    expect(() => divide({ x: 10, y: 5 }, 0, 10)).toThrow();
    expect(() => divide({ x: 10, y: 5 }, 10, 0)).toThrow();

    // B contains NaN
    expect(() => divide({ x: 10, y: 5 }, NaN, 2)).toThrow();
    expect(() => divide({ x: 10, y: 5 }, 2, NaN)).toThrow();
  });

  test(`empty`, () => {
    expect(Points.isEmpty(Points.Empty)).toBe(true);
    expect(Points.isEmpty(Points.Empty3d)).toBe(true);
    expect(Points.isEmpty({ x: 0, y: 0 })).toBe(true);
    expect(Points.isEmpty({ x: 0, y: 0, z: 0 })).toBe(true);

    expect(Points.isEmpty(Points.Placeholder)).toBe(false);
    expect(Points.isEmpty({ x: 0, y: 1 })).toBe(false);
    expect(Points.isEmpty({ x: 1, y: 0 })).toBe(false);
    expect(Points.isEmpty({ x: 0, y: 0, z: 1 })).toBe(false);
  });

  test(`from`, () => {
    expect(Points.from([ 10, 5 ])).toEqual({ x: 10, y: 5 });
    expect(Points.from(10, 5)).toEqual({ x: 10, y: 5 });

    expect(Points.from([ 10, 5, 2 ])).toEqual({ x: 10, y: 5, z: 2 });
    expect(Points.from(10, 5, 2)).toEqual({ x: 10, y: 5, z: 2 });

    // @ts-ignore
    expect(() => Points.from()).toThrow();
    // @ts-ignore
    expect(() => Points.from(10)).toThrow();
    // @ts-ignore
    expect(() => Points.from([ 10 ])).toThrow();
    // @ts-ignore
    expect(() => Points.from([])).toThrow();


  })
  test(`multiply`, () => {
    expect(Points.multiply({ x: 5, y: 10 }, 2, 3)).toEqual({ x: 10, y: 30 });
    expect(Points.multiply({ x: 5, y: 10, z: 15 }, 2, 3, 4)).toEqual({ x: 10, y: 30, z: 60 });

    expect(Points.multiply({ x: 2, y: 3 }, { x: 0.5, y: 2 })).toEqual({ x: 1, y: 6 });
    expect(Points.multiply({ x: 2, y: 3 }, 0.5, 2)).toEqual({ x: 1, y: 6 });
    expect(Points.multiply({ x: 5, y: 10, z: 15 }, { x: 2, y: 3, z: 4 })).toEqual({ x: 10, y: 30, z: 60 });

    expect(Points.multiply({ x: 2, y: 3 }, 0, 2)).toEqual({ x: 0, y: 6 });
    expect(Points.multiply({ x: 2, y: 3 }, 2, 0)).toEqual({ x: 4, y: 0 });

    expect(() => Points.multiply({ x: 10, y: 5 }, NaN, 2)).toThrow();
    expect(() => Points.multiply({ x: 10, y: 5 }, 2, NaN)).toThrow();
  });

  test(`quantise`, () => {
    expect(Points.quantiseEvery({ x: 0, y: 0.1 }, { x: 0.1, y: 0.1 })).toEqual({ x: 0, y: 0.1 });
    expect(Points.quantiseEvery({ x: 0, y: 0.123 }, { x: 0.1, y: 0.1 })).toEqual({ x: 0, y: 0.1 });
    expect(Points.quantiseEvery({ x: 0.1, y: 0.18 }, { x: 0.1, y: 0.1 })).toEqual({ x: 0.1, y: 0.2 });

    expect(Points.quantiseEvery({ x: 0.5, y: 0.123 }, { x: 0.5, y: 0.1 })).toEqual({ x: 0.5, y: 0.1 });
    expect(Points.quantiseEvery({ x: 0.9, y: 0.123 }, { x: 0.5, y: 0.1 })).toEqual({ x: 1, y: 0.1 });

    expect(
      Points.quantiseEvery({ x: 0.9, y: 0.1, z: 0.123 }, { x: 0.5, y: 0.1, z: 0.1 })
    ).toEqual({ x: 1, y: 0.1, z: 0.1 });

  });

  test(`sum`, () => {
    assert.deepEqual(Points.sum({ x: 5, y: 10 }, 1, 2), { x: 6, y: 12 });
    assert.deepEqual(Points.sum({ x: 5, y: 10, z: 15 }, 1, 2, 3), { x: 6, y: 12, z: 18 });

    assert.deepEqual(Points.sum(5, 10, 1, 2), { x: 6, y: 12 });
    assert.deepEqual(Points.sum(5, 10, 15, 1, 2, 3), { x: 6, y: 12, z: 18 });
    assert.deepEqual(Points.sum(1, 2, 0, 0), { x: 1, y: 2 });

    assert.deepEqual(Points.sum({ x: 5, y: 10 }, -1, -2), { x: 4, y: 8 });
    assert.deepEqual(Points.sum({ x: 5, y: 10, z: 15 }, -1, -2, -3), { x: 4, y: 8, z: 12 });
    assert.deepEqual(Points.sum({ x: 5, y: 10 }, { x: 1, y: 2 }), { x: 6, y: 12 });

    expect(Points.sum({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 })).toEqual({ x: 5, y: 7, z: 9 });
    expect(Points.sum(1, 2, 3, 4, 5, 6)).toEqual({ x: 5, y: 7, z: 9 });
    expect(Points.sum(1, 2, 3, 4)).toEqual({ x: 4, y: 6 });

    expect(() => Points.sum(NaN, 2, 0, 0)).toThrow();
    expect(() => Points.sum(1, NaN, 0, 0)).toThrow();
    expect(() => Points.sum(1, 2, NaN, 0)).toThrow();
    expect(() => Points.sum(1, 2, 0, NaN)).toThrow();
  });

  test(`compareByX`, () => {
    expect(Points.compareByX({ x: 10, y: 100 }, { x: 10, y: 200 })).toBe(0);
    expect(Points.compareByX({ x: 100, y: 0 }, { x: 50, y: 0 }) > 0).toBe(true);
    expect(Points.compareByX({ x: 10, y: 0 }, { x: 10, y: 0 }) === 0).toBe(true);
    expect(Points.compareByX({ x: 60, y: 0 }, { x: 50, y: 0 }) > 0).toBe(true);
    expect(Points.compareByX({ x: -100, y: 0 }, { x: 50, y: 0 }) < 0).toBe(true);
    expect(Points.compareByX({ x: 0, y: 0 }, { x: 50, y: 0 }) < 0).toBe(true);
  });

  test(`compareByY`, () => {
    expect(Points.compareByY({ x: 100, y: 1 }, { x: 1000, y: 1 })).toBe(0);
    expect(Points.compareByY({ y: 100, x: 0 }, { y: 50, x: 0 }) > 0).toBe(true);
    expect(Points.compareByY({ y: 10, x: 0 }, { y: 10, x: 0 }) === 0).toBe(true);
    expect(Points.compareByY({ y: 60, x: 0 }, { y: 50, x: 0 }) > 0).toBe(true);
    expect(Points.compareByY({ y: -100, x: 0 }, { y: 50, x: 0 }) < 0).toBe(true);
    expect(Points.compareByY({ y: 0, x: 0 }, { y: 50, x: 0 }) < 0).toBe(true);
  });

  test(`subtract`, () => {
    expect(Points.subtract({ x: 5, y: 10 }, 1, 2)).toEqual({ x: 4, y: 8 });
    expect(Points.subtract({ x: 5, y: 10, z: 15 }, 1, 2, 3)).toEqual({ x: 4, y: 8, z: 12 });

    expect(Points.subtract(5, 10, 1, 2)).toEqual({ x: 4, y: 8 });
    expect(Points.subtract(5, 10, 15, 1, 2, 3)).toEqual({ x: 4, y: 8, z: 12 });
    expect(Points.subtract(1, 2, 0, 0)).toEqual({ x: 1, y: 2 });

    expect(Points.subtract({ x: 5, y: 10 }, -1, -2)).toEqual({ x: 6, y: 12 });
    expect(Points.subtract({ x: 5, y: 10 }, { x: 1, y: 2 })).toEqual({ x: 4, y: 8 });
    expect(Points.subtract({ x: 5, y: 10, z: 15 }, { x: 1, y: 2, z: 3 })).toEqual({ x: 4, y: 8, z: 12 });

    expect(() => Points.subtract(NaN, 2, 0, 0)).toThrow();
    expect(() => Points.subtract(1, NaN, 0, 0)).toThrow();
    expect(() => Points.subtract(1, 2, NaN, 0)).toThrow();
    expect(() => Points.subtract(1, 2, 0, NaN)).toThrow();
  });


  test('divideFn', () => {
    let f = divider(100, 200);
    assert.deepEqual(f(50, 100), { x: 0.5, y: 0.5 });
    assert.deepEqual(f({ x: 50, y: 100 }), { x: 0.5, y: 0.5 });
    assert.deepEqual(f([ 50, 100 ]), { x: 0.5, y: 0.5 });

    f = divider([ 100, 200 ]);
    assert.deepEqual(f(50, 100), { x: 0.5, y: 0.5 });
    assert.deepEqual(f({ x: 50, y: 100 }), { x: 0.5, y: 0.5 });
    assert.deepEqual(f([ 50, 100 ]), { x: 0.5, y: 0.5 });

    f = divider({ x: 100, y: 200 });
    assert.deepEqual(f(50, 100), { x: 0.5, y: 0.5 });
    assert.deepEqual(f({ x: 50, y: 100 }), { x: 0.5, y: 0.5 });
    assert.deepEqual(f([ 50, 100 ]), { x: 0.5, y: 0.5 });

    // Empty array == {x:0, y:0}
    assert.deepEqual(f([]), { x: 0, y: 0 });

    // Dodgy input
    expect(() => divider(0, 1)).toThrow();
    expect(() => divider(1, 0)).toThrow();
    expect(() => divider(1, 1, 0)).toThrow();
    expect(() => divider({ x: 1, y: 0 })).toThrow();
    expect(() => divider({ x: 0, y: 1 })).toThrow();
    expect(() => divider(Number.NaN, Number.NaN)).toThrow();

    // Incorrect array length
    expect(() => divider([])).toThrow();
    expect(() => divider([ 1, 2, 3, 4 ])).toThrow();


    const f2 = divider({ x: 100, y: 200 });

    expect(() => f2(Number.NaN)).toThrow();
    expect(() => f2([ 1, 2, 3, 4 ])).toThrow();

    // @ts-ignore
    expect(() => f2({ x: 0, b: 2 })).toThrow();
  });

  test(`getTwoPointParams`, () => {
    let r = Points.getTwoPointParameters({ x: 1, y: 2 }, { x: 3, y: 4 });
    expect(r).toEqual([ { x: 1, y: 2 }, { x: 3, y: 4 } ]);

    r = Points.getTwoPointParameters({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 });
    expect(r).toEqual([ { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } ]);

    r = Points.getTwoPointParameters({ x: 1, y: 2 }, 3, 4);
    expect(r).toEqual([ { x: 1, y: 2 }, { x: 3, y: 4 } ]);

    r = Points.getTwoPointParameters({ x: 1, y: 2, z: 3 }, 4, 5, 6);
    expect(r).toEqual([ { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } ]);

    r = Points.getTwoPointParameters(1, 2, 3, 4, 5, 6);
    expect(r).toEqual([ { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } ]);

    r = Points.getTwoPointParameters(1, 2, 3, 4);
    expect(r).toEqual([ { x: 1, y: 2 }, { x: 3, y: 4 } ]);

    // @ts-ignore
    expect(() => Points.getTwoPointParameters({ x: 1, y: 2 })).toThrow();
    // @ts-ignore
    expect(() => Points.getTwoPointParameters({ x: 1, y: 2 }, 1)).toThrow();
    // @ts-ignore
    expect(() => Points.getTwoPointParameters({ x: 1, y: 2, z: 3 }, 4)).toThrow();

    // @ts-ignore
    expect(() => Points.getTwoPointParameters({ x: 1, y: 2, z: 3 }, 4, 5)).toThrow();

    // @ts-ignore
    expect(() => Points.getTwoPointParameters()).toThrow();


    // @ts-ignore
    expect(() => Points.getTwoPointParameters(1, 2)).toThrow();
    // @ts-ignore
    expect(() => Points.getTwoPointParameters(1, 2, 3)).toThrow();

  })
});