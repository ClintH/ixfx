import { test, expect, describe } from 'vitest';
import * as Colour from '../src/colour/index.js';

describe(`math`, () => {
  describe(`multiplyOpacity`, () => {
    test(`multiplies string colour opacity by 0.5`, () => {
      expect(Colour.multiplyOpacity(`red`, 0.5)).toBe(`rgb(100% 0% 0% / 50%)`);
    });

    test(`multiplies HSL opacity by 0.5`, () => {
      const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 0.8);
      const result = Colour.multiplyOpacity(hsl, 0.5);
      expect(result.opacity).toBeCloseTo(0.4);
    });

    test(`multiplies RGB opacity by 0.5`, () => {
      const rgb = Colour.SrgbSpace.scalar(1, 0, 0, 0.8);
      const result = Colour.multiplyOpacity(rgb, 0.5);
      expect(result.opacity).toBeCloseTo(0.4);
    });

    test(`multiplies OkLch opacity by 0.5`, () => {
      const oklch = Colour.OklchSpace.scalar(0.5, 0.1, 0.2, 0.8);
      const result = Colour.multiplyOpacity(oklch, 0.5);
      expect(result.opacity).toBeCloseTo(0.4);
    });

    test(`clamps opacity to minimum 0`, () => {
      const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 0.2);
      const result = Colour.multiplyOpacity(hsl, 0.1);
      expect(result.opacity).toBeGreaterThanOrEqual(0);
    });

    test(`clamps opacity to maximum 1`, () => {
      const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 1);
      const result = Colour.multiplyOpacity(hsl, 2);
      expect(result.opacity).toBeLessThanOrEqual(1);
    });

    test(`multiplies HSL absolute opacity by 0.5`, () => {
      const hsl = Colour.HslSpace.absolute(0, 100, 50, 80);
      const result = Colour.multiplyOpacity(hsl, 0.5);
      expect(result.opacity).toBeCloseTo(40);
    });

    test(`multiplies RGB 8bit opacity by 0.5`, () => {
      const rgb = Colour.SrgbSpace.eightBit(255, 0, 0, 200);
      const result = Colour.multiplyOpacity(rgb, 0.5);
      expect(result.opacity).toBeCloseTo(100);
    });
  });

  describe(`withOpacity`, () => {
    test(`applies function to string colour opacity`, () => {
      expect(Colour.withOpacity(`red`, (o) => o * 0.5)).toBe(`rgb(100% 0% 0% / 50%)`);
    });

    test(`applies function to HSL colour opacity`, () => {
      const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 0.5);
      const result = Colour.withOpacity(hsl, (o) => o * 2);
      expect(result.opacity).toBe(1);
    });

    test(`applies function to RGB colour opacity`, () => {
      const rgb = Colour.SrgbSpace.scalar(1, 0, 0, 0.5);
      const result = Colour.withOpacity(rgb, (o) => o * 2);
      expect(result.opacity).toBe(1);
    });

    test(`applies function to OkLch colour opacity`, () => {
      const oklch = Colour.OklchSpace.scalar(0.5, 0.1, 0.2, 0.5);
      const result = Colour.withOpacity(oklch, (o) => o * 2);
      expect(result.opacity).toBe(1);
    });

    test(`receives colour object in function`, () => {
      const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 0.5);
      let receivedColour: any;
      Colour.withOpacity(hsl, (o) => {
        receivedColour = hsl;
        return o;
      });
      expect(receivedColour).toEqual(hsl);
    });
  });

  describe(`setOpacity`, () => {
    test(`sets string colour opacity`, () => {
      expect(Colour.setOpacity(`red`, 0.3)).toBe(`rgb(100% 0% 0% / 30%)`);
    });

    test(`sets HSL colour opacity`, () => {
      const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 1);
      const result = Colour.setOpacity(hsl, 0.3);
      expect(result.opacity).toBe(0.3);
    });

    test(`sets RGB colour opacity`, () => {
      const rgb = Colour.SrgbSpace.scalar(1, 0, 0, 1);
      const result = Colour.setOpacity(rgb, 0.3);
      expect(result.opacity).toBe(0.3);
    });

    test(`sets OkLch colour opacity`, () => {
      const oklch = Colour.OklchSpace.scalar(0.5, 0.1, 0.2, 1);
      const result = Colour.setOpacity(oklch, 0.3);
      expect(result.opacity).toBe(0.3);
    });

    test(`overwrites existing opacity`, () => {
      const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 0.9);
      const result = Colour.setOpacity(hsl, 0.3);
      expect(result.opacity).toBe(0.3);
    });

    test(`clamps opacity to minimum 0`, () => {
      const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 0.5);
      const result = Colour.setOpacity(hsl, -0.1);
      expect((result as any).opacity).toBe(-0.1);
    });

    test(`clamps opacity to maximum 1`, () => {
      const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 0.5);
      const result = Colour.setOpacity(hsl, 1.5);
      expect((result as any).opacity).toBe(1.5);
    });
  });
});
