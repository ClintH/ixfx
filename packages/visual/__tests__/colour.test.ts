import { test, expect, describe } from 'vitest';
import { applyToValues, round } from '@ixfx/numbers';
import * as Colour from '../src/colour/index.js';

describe(`colour`, () => {
  test(`opacity`, () => {
    expect(Colour.multiplyOpacity(`red`, 0.5)).toBe(`rgb(100% 0% 0% / 0.5)`);
    expect(Colour.multiplyOpacity(`hsl(0,100%,50%)`, 0.5)).toBe(`hsl(0 100% 50% / 0.5)`);
  });

  test(`special`, () => {
    expect(Colour.toCssColour(`transparent`)).toBe(`#00000000`);
    const hsl1 = Colour.HslSpace.fromCssScalar(`transparent`);

    expect(hsl1.opacity).toBe(0);

    expect(Colour.toCssColour(`white`)).toBe(`#ffffff`);
    const hsl2a = Colour.HslSpace.fromCssScalar(`white`);
    expect(hsl2a.l).toBe(1);

    //expect(() => Colour.HslSpace.fromCss(`white`, false)).toThrow(); // disable safe

    expect(Colour.toCssColour(`black`)).toBe(`#000000`);
    const hsl3 = Colour.HslSpace.fromCssScalar(`black`);
    expect(hsl3.l).toBe(0);

  });

  test(`colour-parse`, () => {
    // Indeterminate input
    //t.like(Colour.toHsl(`hsl(0,0%,0%)`), { h: 0, s: 0, l: 0 });
    //t.like(Colour.toHsl(`hsla(0,0%,0%,0)`), { h: 0, s: 0, l: 0 });

    expect(Colour.fromCssColour(`hsl(100, 100%, 50%)`)).toEqual({ h: 100 / 360, s: 1, l: 0.5, opacity: 1, space: "hsl", unit: "scalar" });

    expect(Colour.HslSpace.fromCssScalar(`red`)).toEqual({ h: 0, s: 1, l: 0.5, opacity: 1, space: "hsl", unit: "scalar" });
    expect(Colour.HslSpace.fromCssScalar(`rgb(255,0,0)`)).toEqual({ h: 0, s: 1, l: 0.5, opacity: 1, space: "hsl", unit: "scalar" });
    expect(Colour.HslSpace.fromCssScalar(`rgba(255,0,0, 1)`)).toEqual({ h: 0, s: 1, l: 0.5, opacity: 1.0, space: "hsl", unit: "scalar" });
    expect(Colour.HslSpace.fromCssScalar(`rgba(255,0,0, 0.5)`)).toEqual({ h: 0, s: 1, l: 0.5, opacity: 0.5, space: "hsl", unit: "scalar" });

    expect(applyToValues(Colour.HslSpace.fromCssScalar(`hotpink`), v => round(3, v))).toEqual({ h: 0.916, s: 1, l: 0.705, opacity: 1, space: "hsl", unit: "relative" });
    expect(Colour.HslSpace.fromCssScalar(`rgb(255,105,180)`)).toEqual({ h: 0.916666666666666666, s: 1, l: 0.7058823529411764, opacity: 1, space: "hsl", unit: "scalar" });
    expect(Colour.HslSpace.fromCssScalar(`rgba(255,105,180,0.5)`)).toEqual({ h: 0.9166666666666666, s: 1, l: 0.7058823529411764, opacity: 0.5, space: "hsl", unit: "scalar" });

    expect(Colour.HslSpace.fromCssScalar(`hsla(100, 100%, 50%, 0.20)`)).toEqual({ h: 0.2777777777777778, s: 1, l: 0.5, opacity: 0.2, space: "hsl", unit: "scalar" });

  });

  test(`rgb-validate`, () => {
    // Values exceed relative range
    expect(() => Colour.toCssColour({ r: 255, g: 0, b: 0, unit: `scalar` })).toThrow();
    expect(() => Colour.toCssColour({ r: 0, g: 2, b: 0, unit: `scalar` })).toThrow();
    expect(() => Colour.toCssColour({ r: 0, g: 0, b: 2, unit: `scalar` })).toThrow();
    expect(() => Colour.toCssColour({ r: 0, g: 0, b: 0, opacity: 10, unit: `scalar` })).toThrow();

    // Values exceed 8bit range
    expect(() => Colour.toCssColour({ r: 256, g: 0, b: 0, unit: `8bit` })).toThrow();
    expect(() => Colour.toCssColour({ r: 0, g: -1, b: 0, unit: `8bit` })).toThrow();
    expect(() => Colour.toCssColour({ r: 0, g: 0, b: 300, unit: `8bit` })).toThrow();
    expect(() => Colour.toCssColour({ r: 0, g: 0, b: 0, opacity: 10, unit: `8bit` })).toThrow();
  });

  test(`hsl-validate`, () => {
    // Values exceed scalar range
    expect(() => Colour.toCssColour({ h: 1.1, s: 0, l: 0, unit: `scalar` })).toThrow();
    expect(() => Colour.toCssColour({ h: 0, s: 2, l: 0, unit: `scalar` })).toThrow();
    expect(() => Colour.toCssColour({ h: 0, s: 0, l: 2, unit: `scalar` })).toThrow();
    expect(() => Colour.toCssColour({ h: 0, s: 0, l: 0, opacity: 10, unit: `scalar` })).toThrow();

    // Values exceed absolute range
    expect(() => Colour.toCssColour({ h: 361, s: 0, l: 0, unit: `absolute` })).not.toThrow(); // angles wrap
    expect(() => Colour.toCssColour({ h: 0, s: -1, l: 0, unit: `absolute` })).toThrow();
    expect(() => Colour.toCssColour({ h: 0, s: 0, l: 200, unit: `absolute` })).toThrow();
    expect(() => Colour.toCssColour({ h: 0, s: 0, l: 0, opacity: 10, unit: `absolute` })).toThrow();
  });

  test(`to-string`, () => {

    expect(Colour.toCssColour(`black`)).toBe(`rgb(0% 0% 0%)`);
    expect(Colour.toCssColour({ r: 0, g: 0, b: 0, unit: `scalar` })).toBe(`rgb(0% 0% 0%)`);
    expect(Colour.toCssColour({ r: 1, g: 1, b: 1, unit: `scalar` })).toBe(`rgb(100% 100% 100%)`);
    expect(Colour.toCssColour({ r: 1, g: 1, b: 1, opacity: 0.5, unit: `scalar` })).toBe(`rgb(100% 100% 100% / 0.5)`);

    expect(Colour.toCssColour({ r: 0, g: 0, b: 0, unit: `8bit` })).toBe(`rgb(0% 0% 0%)`);
    expect(Colour.toCssColour({ r: 255, g: 255, b: 255, unit: `8bit` })).toBe(`rgb(100% 100% 100%)`);
    expect(Colour.toCssColour({ r: 255, g: 255, b: 255, opacity: 0.5, unit: `8bit` })).toBe(`rgb(100% 100% 100% / 0.5)`);

    expect(Colour.toCssColour({ h: 0, s: 0, l: 0, unit: `scalar` })).toBe(`hsl(0 0% 0%)`);
    expect(Colour.toCssColour({ h: 0, s: 0, l: 0, opacity: 0.5, unit: `scalar` })).toBe(`hsl(0 0% 0% / 0.5)`);

    expect(Colour.toCssColour({ h: 200, s: 0, l: 0, unit: `absolute` })).toBe(`hsl(200 0% 0%)`);
    expect(
      Colour.toCssColour({ h: 200, s: 100, l: 100, opacity: 0.5, unit: `absolute` })
    ).toBe(`hsl(200 100% 100% / 0.5)`);

  });
});