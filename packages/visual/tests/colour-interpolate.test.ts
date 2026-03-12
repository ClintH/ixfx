import { test, expect, describe } from 'vitest';
import * as Colour from '../src/colour/index.js';

describe(`interpolate`, () => {
  describe(`cssLinearGradient`, () => {
    test(`creates linear gradient with two colours`, () => {
      const result = Colour.cssLinearGradient([`red`, `blue`]);
      expect(result).toBe(`linear-gradient(to right, red, blue)`);
    });

    test(`creates linear gradient with three colours`, () => {
      const result = Colour.cssLinearGradient([`red`, `green`, `blue`]);
      expect(result).toBe(`linear-gradient(to right, red, green, blue)`);
    });

    test(`creates linear gradient with single colour`, () => {
      const result = Colour.cssLinearGradient([`red`]);
      expect(result).toBe(`linear-gradient(to right, red)`);
    });

    test(`creates linear gradient with structured colours`, () => {
      const red = Colour.HslSpace.scalar(0, 1, 0.5, 1);
      const blue = Colour.HslSpace.scalar(0.66, 1, 0.5, 1);
      const result = Colour.cssLinearGradient([red, blue]);
      expect(result).toBe(`linear-gradient(to right, hsl(0deg 100% 50%), hsl(237.60000000000002deg 100% 50%))`);
    });
  });

  describe(`interpolatorDual`, () => {
    test(`interpolates between two colours using default oklch`, () => {
      const interpolator = Colour.interpolatorDual(`red`, `blue`);
      const result = interpolator(0.5);
      expect(result).toStrictEqual({
        "c": 0.713625,
        "h": 0.9073422916666667,
        "l": 0.5399849999999999,
        "opacity": 1,
        "space": "oklch",
        "unit": "scalar",
      });
    });

    test(`uses oklch colour space by default`, () => {
      const interpolator = Colour.interpolatorDual(`red`, `blue`, { space: `oklch` });
      const result = interpolator(0.5);
      expect(result).toBeTruthy();
    });

    test(`interpolates at 0 returns colour equivalent to start`, () => {
      const interpolator = Colour.interpolatorDual(`red`, `blue`, {destination:`srgb-8bit`});
      const result = interpolator(0);
      expect(Colour.isRgb(result)).toBeTruthy();
      expect(result).toEqual({
        "b": 0,
        "g": 0,
        "opacity": 255,
        "r": 255,
        "space": "srgb",
        "unit": "8bit",
      });
    });
  })

  describe(`interpolatorDualToString`, () => {
    test(`interpolates between two colours using default oklch`, () => {
      const interpolator = Colour.interpolatorDualToString(`red`, `blue`);
      const result = interpolator(0.5);
      expect(result).toBe(`oklch(0.540 0.285 326.643)`);
    });
    test(`oklch-scalar`, () => {
      const interpolator = Colour.interpolatorDualToString(`red`, `blue`, { destination: `oklch-scalar` });
      const result = interpolator(0.5);
      expect(result).toBe(`oklch(0.540 0.285 326.643)`);
    });
    test(`oklch-absolute`, () => {
      const interpolator = Colour.interpolatorDualToString(`red`, `blue`, { destination: `oklch-absolute` });
      const result = interpolator(0.5);
      expect(result).toBe(`oklch(53.998% 0.285 326.643)`);
    });
    test(`srgb-scalar`, () => {
      const interpolator = Colour.interpolatorDualToString(`red`, `blue`, { destination: `srgb-scalar` });
      const result = interpolator(0.5);
      expect(result).toBe(`rgb(72.94117647058823% 0% 76.07843137254902%)`);
    });
        test(`srgb-8bit`, () => {
      const interpolator = Colour.interpolatorDualToString(`red`, `blue`, { destination: `srgb-8bit` });
      const result = interpolator(0.5);
      expect(result).toBe(`rgb(186 0 194)`);
    });
    test(`hsl-scalar`, () => {
      const interpolator = Colour.interpolatorDualToString(`red`, `blue`, { destination: `hsl-scalar` });
      const result = interpolator(0.5);
      expect(result).toBe(`hsl(297.53deg 100% 38.04%)`);
    });
    test(`hsl-absolute`, () => {
      const interpolator = Colour.interpolatorDualToString(`red`, `blue`, { destination: `hsl-absolute` });
      const result = interpolator(0.5);
      expect(result).toBe(`hsl(297.53deg 100% 38.04%)`);
    });

    test(`interpolates at 1 returns colour equivalent to end`, () => {
      const interpolator = Colour.interpolatorDualToString(`red`, `blue`,{destination:`srgb-8bit`});
      const result = interpolator(1);
      expect(result).toEqual(`rgb(0 0 255)`);
    });

    test(`interpolates between structured colours`, () => {
      const red = Colour.HslSpace.scalar(0, 1, 0.5, 1);
      const blue = Colour.HslSpace.scalar(0.66, 1, 0.5, 1);
      const interpolator = Colour.interpolatorDualToString(red, blue);
      const result = interpolator(0.5);
      expect( result).toBe(`oklch(0.542 0.284 326.668)`);
    });
  });

  describe(`scale`, () => {
    test(`creates scale between two colours`, () => {
      const result = Colour.scale([`red`, `blue`], { stepsBetween: 3});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5);
      expect(result[0]).toBe(`oklch(0.628 0.258 29.235)`);
      expect(result[1]).toBe(`oklch(0.584 0.272 357.939)`);
      expect(result[2]).toBe(`oklch(0.540 0.285 326.643)`);
      expect(result[3]).toBe(`oklch(0.496 0.299 295.347)`);
      expect(result[4]).toBe(`oklch(0.452 0.313 264.052)`);
    });

    test(`respects stepsBetween option`, () => {
      const result = Colour.scale([`red`, `blue`], { stepsBetween: 5 });
      expect(result.length).toBe(7);
    });

    test(`respects stepsTotal option`, () => {
      const result = Colour.scale([`red`, `blue`], { stepsTotal: 10 });
      expect(result.length).toBe(9);
    });
    test(`throws when stepsTotal is too small`, () => {
      expect(() => Colour.scale([`red`, `blue`], { stepsTotal: 2 })).toThrow();
    });

    test(`throws when stepsBetween is less than 1`, () => {
      expect(() => Colour.scale([`red`, `blue`], { stepsBetween: 0 })).toThrow();
    });

  });

  describe(`createSteps`, () => {
    test(`creates steps between two colours with default options`, () => {
      const result = Colour.createSteps(`red`, `blue`, { steps: 5 });
      expect(result.length).toBe(5);
    });

    test(`includes start and end colours by default`, () => {
      const result = Colour.createSteps(`red`, `blue`, { steps: 5 });
      expect(result.length).toBe(5);
    });

    test(`excludes start and end when exclusive is true`, () => {
      const result = Colour.createSteps(`red`, `blue`, { exclusive: true });
      expect(result.length).toBe(5);
    });


    test(`respects steps option`, () => {
      const result = Colour.createSteps(`red`, `blue`, { steps: 10, space: `oklch` });
      expect(result.length).toBe(9);
    });

    test(`throws when exclusive and steps < 1`, () => {
      expect(() => Colour.createSteps(`red`, `blue`, { exclusive: true, steps: 0 })).toThrow();
    });

    test(`throws when non-exclusive and steps < 2`, () => {
      expect(() => Colour.createSteps(`red`, `blue`, { exclusive: false, steps: 1 })).toThrow();
    });

    test(`returns structured colour objects`, () => {
      const result = Colour.createSteps(`red`, `blue`, { steps: 5 });
      expect(result.length).toBe(5);
      expect(result[0]).toHaveProperty(`space`);
      expect(result[0]).toHaveProperty(`unit`);
    });

  });
});
