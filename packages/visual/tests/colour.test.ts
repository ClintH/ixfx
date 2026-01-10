
import { test, expect, describe } from 'vitest';
import { applyToValues, round } from '@ixfx/numbers';
import * as Colour from '../src/colour/index.js';

describe(`colour`, () => {




  test(`special`, () => {
    expect(Colour.toCssColour(`transparent`)).toBe(`transparent`);
    const hsl1 = Colour.HslSpace.fromCss(`transparent`, { scalar: true });

    expect(hsl1.opacity).toBe(0);

    expect(Colour.toCssColour(`white`)).toBe(`white`);
    const hsl2a = Colour.HslSpace.fromCss(`white`, { scalar: true });
    expect(hsl2a.l).toBe(1);

    //expect(() => Colour.HslSpace.fromCss(`white`, false)).toThrow(); // disable safe

    expect(Colour.toCssColour(`black`)).toBe(`black`);
    const hsl3 = Colour.HslSpace.fromCss(`black`, { scalar: true });
    expect(hsl3.l).toBe(0);

  });




  test(`colour-parse`, () => {
    // Indeterminate input
    //t.like(Colour.toHsl(`hsl(0,0%,0%)`), { h: 0, s: 0, l: 0 });
    //t.like(Colour.toHsl(`hsla(0,0%,0%,0)`), { h: 0, s: 0, l: 0 });

    expect(Colour.fromCssColour(`hsl(100, 100%, 50%)`)).toEqual({ h: 100 / 360, s: 1, l: 0.50, opacity: 1, space: "hsl", unit: "scalar" });

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
    expect(() => Colour.toCssColour({ r: 0, g: 0, b: 0, opacity: 256, unit: `8bit` })).toThrow();
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
    expect(() => Colour.toCssColour({ h: 0, s: 0, l: 0, opacity: Number.NaN, unit: `absolute` })).toThrow();
  });

  test(`to-string`, () => {

    expect(Colour.toCssColour(`black`)).toBe(`black`);
    expect(Colour.toCssColour({ r: 0, g: 0, b: 0, unit: `scalar` })).toBe(`rgb(0% 0% 0%)`);
    expect(Colour.toCssColour({ r: 1, g: 1, b: 1, unit: `scalar` })).toBe(`rgb(100% 100% 100%)`);
    expect(Colour.toCssColour({ r: 1, g: 1, b: 1, opacity: 0.5, unit: `scalar` })).toBe(`rgb(100% 100% 100% / 50%)`);

    expect(Colour.toCssColour({ r: 0, g: 0, b: 0, unit: `8bit` })).toBe(`rgb(0 0 0)`);
    expect(Colour.toCssColour({ r: 255, g: 255, b: 255, unit: `8bit` })).toBe(`rgb(255 255 255)`);
    expect(Colour.toCssColour({ r: 255, g: 255, b: 255, opacity: 127.5, unit: `8bit` })).toBe(`rgb(255 255 255 / 0.5)`);

    expect(Colour.toCssColour({ h: 0, s: 0, l: 0, unit: `scalar` })).toBe(`hsl(0deg 0% 0%)`);
    expect(Colour.toCssColour({ h: 0, s: 0, l: 0, opacity: 0.5, unit: `scalar` })).toBe(`hsl(0deg 0% 0% / 50%)`);

    expect(Colour.toCssColour({ h: 200, s: 0, l: 0, unit: `absolute` })).toBe(`hsl(200deg 0% 0%)`);
    expect(
      Colour.toCssColour({ h: 200, s: 100, l: 100, opacity: 50, unit: `absolute` })
    ).toBe(`hsl(200deg 100% 100% / 50%)`);

  });
});


test(`set-opacity`, () => {
  expect(Colour.setOpacity(`red`, 0.5)).toEqual(`rgb(100% 0% 0% / 50%)`);
  expect(Colour.setOpacity(Colour.HslSpace.scalar(0.5, 0.1, 0.2, 0.4), 0.5)).toEqual(
    Colour.HslSpace.scalar(0.5, 0.1, 0.2, 0.5)
  );
  expect(Colour.setOpacity(Colour.OklchSpace.scalar(0.5, 0.1, 0.2, 0.4), 0.5)).toEqual(
    Colour.OklchSpace.scalar(0.5, 0.1, 0.2, 0.5)
  );
});

test(`opacity`, () => {
  expect(Colour.multiplyOpacity(`red`, 0.5)).toBe(`rgb(100% 0% 0% / 50%)`);
  expect(Colour.multiplyOpacity(`hsl(0,100%,50%)`, 0.5)).toBe(`hsl(0deg 100% 50% / 50%)`);
  expect(Colour.multiplyOpacity(Colour.HslSpace.scalar(0.5, 0.1, 0.2, 0.4), 0.5)).toEqual(
    Colour.HslSpace.scalar(0.5, 0.1, 0.2, 0.4 * 0.5)
  );

});