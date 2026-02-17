import { test, expect, describe } from 'vitest';
import { isHsl, isRgb, isOkLch, isColourish, tryParseObjectToRgb, tryParseObjectToHsl } from '../src/colour/guards.js';
import * as Colour from '../src/colour/index.js';

describe(`guards`, () => {
  describe(`isHsl`, () => {
    test(`returns true for valid HslScalar`, () => {
      const hsl = Colour.HslSpace.scalar(0.5, 0.5, 0.5, 1);
      expect(isHsl(hsl)).toBe(true);
    });

    test(`returns true for valid HslAbsolute`, () => {
      const hsl = Colour.HslSpace.absolute(180, 50, 50, 100);
      expect(isHsl(hsl)).toBe(true);
    });

    test(`returns false for OkLch`, () => {
      const oklch = Colour.OklchSpace.scalar(0.5, 0.1, 0.2, 1);
      expect(isHsl(oklch)).toBe(false);
    });

    test(`returns false for Srgb`, () => {
      const srgb = Colour.SrgbSpace.scalar(0.5, 0.5, 0.5, 1);
      expect(isHsl(srgb)).toBe(false);
    });

    test(`returns false for string`, () => {
      expect(isHsl(`red`)).toBe(false);
    });

    test(`returns false for null`, () => {
      expect(() => isHsl(null)).toThrow();
    });

    test(`returns false for undefined`, () => {
      expect(isHsl(undefined)).toBe(false);
    });

    test(`returns false for number`, () => {
      expect(isHsl(123)).toBe(false);
    });

    test(`returns false for object missing h property`, () => {
      expect(isHsl({ s: 0.5, l: 0.5 })).toBe(false);
    });

    test(`returns false for object with wrong space`, () => {
      expect(isHsl({ h: 0.5, s: 0.5, l: 0.5, space: `srgb`, unit: `scalar` })).toBe(false);
    });
  });

  describe(`isRgb`, () => {
    test(`returns true for valid RgbScalar`, () => {
      const rgb = Colour.SrgbSpace.scalar(0.5, 0.5, 0.5, 1);
      expect(isRgb(rgb)).toBe(true);
    });

    test(`returns true for valid Rgb8Bit`, () => {
      const rgb = Colour.SrgbSpace.eightBit(128, 128, 128, 255);
      expect(isRgb(rgb)).toBe(true);
    });

    test(`returns false for Hsl`, () => {
      const hsl = Colour.HslSpace.scalar(0.5, 0.5, 0.5, 1);
      expect(isRgb(hsl)).toBe(false);
    });

    test(`returns false for OkLch`, () => {
      const oklch = Colour.OklchSpace.scalar(0.5, 0.1, 0.2, 1);
      expect(isRgb(oklch)).toBe(false);
    });

    test(`returns false for string`, () => {
      expect(isRgb(`red`)).toBe(false);
    });

    test(`returns false for object missing r property`, () => {
      expect(isRgb({ g: 0.5, b: 0.5 })).toBe(false);
    });

    test(`returns false for object with wrong space`, () => {
      expect(isRgb({ r: 0.5, g: 0.5, b: 0.5, space: `hsl`, unit: `scalar` })).toBe(false);
    });
  });

  describe(`isOkLch`, () => {
    test(`returns true for valid OkLchScalar`, () => {
      const oklch = Colour.OklchSpace.scalar(0.5, 0.1, 0.2, 1);
      expect(isOkLch(oklch)).toBe(true);
    });

    test(`returns true for valid OkLchAbsolute`, () => {
      const oklch = Colour.OklchSpace.absolute(0.5, 0.1, 180, 1);
      expect(isOkLch(oklch)).toBe(true);
    });

    test(`returns false for Hsl`, () => {
      const hsl = Colour.HslSpace.scalar(0.5, 0.5, 0.5, 1);
      expect(isOkLch(hsl)).toBe(false);
    });

    test(`returns false for Srgb`, () => {
      const srgb = Colour.SrgbSpace.scalar(0.5, 0.5, 0.5, 1);
      expect(isOkLch(srgb)).toBe(false);
    });

    test(`returns false for string`, () => {
      expect(isOkLch(`red`)).toBe(false);
    });

    test(`returns false for object with lch space`, () => {
      expect(isOkLch({ l: 0.5, c: 0.1, h: 0.2, space: `lch`, unit: `scalar` })).toBe(true);
    });

    test(`returns false for object with oklch space`, () => {
      expect(isOkLch({ l: 0.5, c: 0.1, h: 0.2, space: `oklch`, unit: `scalar` })).toBe(true);
    });

    test(`returns false for object missing l property`, () => {
      expect(isOkLch({ c: 0.1, h: 0.2 })).toBe(false);
    });
  });

  describe(`isColourish`, () => {
    test(`returns true for string`, () => {
      expect(isColourish(`red`)).toBe(true);
    });

    test(`returns true for Hsl`, () => {
      const hsl = Colour.HslSpace.scalar(0.5, 0.5, 0.5, 1);
      expect(isColourish(hsl)).toBe(true);
    });

    test(`returns true for Rgb`, () => {
      const rgb = Colour.SrgbSpace.scalar(0.5, 0.5, 0.5, 1);
      expect(isColourish(rgb)).toBe(true);
    });

    test(`returns true for OkLch`, () => {
      const oklch = Colour.OklchSpace.scalar(0.5, 0.1, 0.2, 1);
      expect(isColourish(oklch)).toBe(true);
    });

    test(`returns false for number`, () => {
      expect(isColourish(123)).toBe(false);
    });

    test(`returns false for null`, () => {
      expect(() => isColourish(null)).toThrow();
    });

    test(`returns false for undefined`, () => {
      expect(isColourish(undefined)).toBe(false);
    });

    test(`returns false for plain object`, () => {
      expect(isColourish({})).toBe(false);
    });

    test(`returns false for object with random properties`, () => {
      expect(isColourish({ foo: `bar` })).toBe(false);
    });
  });

  describe(`tryParseObjectToRgb`, () => {
    test(`parses valid RGB scalar object`, () => {
      const result = tryParseObjectToRgb({ r: 0.5, g: 0.3, b: 0.2 });
      expect(result).toBeDefined();
      expect(result?.r).toBe(0.5);
      expect(result?.g).toBe(0.3);
      expect(result?.b).toBe(0.2);
      expect(result?.unit).toBe(`scalar`);
      expect(result?.space).toBe(`srgb`);
    });

    test(`parses valid RGB 8bit object`, () => {
      const result = tryParseObjectToRgb({ r: 128, g: 64, b: 32 });
      expect(result).toBeDefined();
      expect(result?.r).toBe(128);
      expect(result?.unit).toBe(`8bit`);
    });

    test(`parses RGB object without unit`, () => {
      const result = tryParseObjectToRgb({ r: 0.5, g: 0.5, b: 0.5 });
      expect(result?.unit).toBe(`scalar`);
    });

    test(`returns undefined for missing r property`, () => {
      const result = tryParseObjectToRgb({ g: 0.5, b: 0.5 });
      expect(result).toBeUndefined();
    });

    test(`returns undefined for missing g property`, () => {
      const result = tryParseObjectToRgb({ r: 0.5, b: 0.5 });
      expect(result).toBeUndefined();
    });

    test(`returns undefined for missing b property`, () => {
      const result = tryParseObjectToRgb({ r: 0.5, g: 0.5 });
      expect(result).toBeUndefined();
    });

    test(`throws for non-object input`, () => {
      expect(() => tryParseObjectToRgb(`red`)).toThrow();
    });

    test(`returns undefined when values exceed 255`, () => {
      const result = tryParseObjectToRgb({ r: 256, g: 0, b: 0 });
      expect(result).toBeUndefined();
    });

    test(`preserves existing unit`, () => {
      const result = tryParseObjectToRgb({ r: 0.5, g: 0.5, b: 0.5, unit: `8bit` });
      expect(result?.unit).toBe(`8bit`);
    });

    test(`preserves existing space`, () => {
      const result = tryParseObjectToRgb({ r: 0.5, g: 0.5, b: 0.5, space: `srgb` });
      expect(result?.space).toBe(`srgb`);
    });

    test(`handles opacity property`, () => {
      const result = tryParseObjectToRgb({ r: 0.5, g: 0.5, b: 0.5, opacity: 0.8 });
      expect(result?.opacity).toBe(0.8);
    });
  });

  describe(`tryParseObjectToHsl`, () => {
    test(`parses valid HslScalar object`, () => {
      const result = tryParseObjectToHsl({ h: 0.5, s: 0.5, l: 0.5 });
      expect(result).toBeDefined();
      expect(result?.h).toBe(0.5);
      expect(result?.s).toBe(0.5);
      expect(result?.l).toBe(0.5);
      expect(result?.unit).toBe(`scalar`);
      expect(result?.space).toBe(`hsl`);
    });

    test(`parses valid HslAbsolute object`, () => {
      const result = tryParseObjectToHsl({ h: 180, s: 50, l: 50 });
      expect(result).toBeDefined();
      expect(result?.unit).toBe(`absolute`);
    });

    test(`returns undefined for missing h property`, () => {
      const result = tryParseObjectToHsl({ s: 0.5, l: 0.5 });
      expect(result).toBeUndefined();
    });

    test(`returns undefined for missing s property`, () => {
      const result = tryParseObjectToHsl({ h: 0.5, l: 0.5 });
      expect(result).toBeUndefined();
    });

    test(`returns undefined for missing l property`, () => {
      const result = tryParseObjectToHsl({ h: 0.5, s: 0.5 });
      expect(result).toBeUndefined();
    });

    test(`returns undefined when saturation > 100`, () => {
      const result = tryParseObjectToHsl({ h: 0.5, s: 150, l: 0.5 });
      expect(result).toBeUndefined();
    });

    test(`returns undefined when lightness > 100`, () => {
      const result = tryParseObjectToHsl({ h: 0.5, s: 0.5, l: 150 });
      expect(result).toBeUndefined();
    });

    test(`preserves existing unit`, () => {
      const result = tryParseObjectToHsl({ h: 0.5, s: 0.5, l: 0.5, unit: `absolute` });
      expect(result?.unit).toBe(`absolute`);
    });

    test(`preserves existing space`, () => {
      const result = tryParseObjectToHsl({ h: 0.5, s: 0.5, l: 0.5, space: `hsl` });
      expect(result?.space).toBe(`hsl`);
    });

    test(`handles opacity property`, () => {
      const result = tryParseObjectToHsl({ h: 0.5, s: 0.5, l: 0.5, opacity: 0.8 });
      expect(result?.opacity).toBe(0.8);
    });
  });
});
