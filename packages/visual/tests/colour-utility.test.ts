import { test, expect, describe } from 'vitest';
import { calculateHueDistance, libraryRgbToHexString, wrapScalarHue } from '../src/colour/utility.js';

describe(`utility`, () => {
  describe(`calculateHueDistance`, () => {
    test(`returns correct values for different hues`, () => {
      const result = calculateHueDistance(0.2, 0.8);
      expect(typeof result.long).toBe(`number`);
      expect(typeof result.short).toBe(`number`);
      expect(typeof result.forward).toBe(`number`);
      expect(typeof result.backward).toBe(`number`);
    });

    test(`handles wrap-around correctly`, () => {
      const result = calculateHueDistance(0.9, 0.1);
      expect(result.short).toBeCloseTo(0.2);
    });

    test(`handles wrap-around with different limit`, () => {
      const result = calculateHueDistance(0.9, 0.1, 1);
      expect(result.short).toBeCloseTo(0.2);
    });

    test(`returns symmetric results for reversed inputs`, () => {
      const forward = calculateHueDistance(0.2, 0.8);
      const backward = calculateHueDistance(0.8, 0.2);
      expect(Math.abs(forward.short)).toBeCloseTo(Math.abs(backward.short));
    });
  });

  describe(`libraryRgbToHexString`, () => {
    test(`converts rgb to hex without alpha`, () => {
      const result = libraryRgbToHexString({ r: 255, g: 0, b: 0 });
      expect(result).toBe(`#ff0000`);
    });

    test(`converts rgb to hex with all zeros`, () => {
      const result = libraryRgbToHexString({ r: 0, g: 0, b: 0 });
      expect(result).toBe(`#000000`);
    });

    test(`converts rgb to hex with all max`, () => {
      const result = libraryRgbToHexString({ r: 255, g: 255, b: 255 });
      expect(result).toBe(`#ffffff`);
    });

    test(`includes alpha when opacity < 255`, () => {
      const result = libraryRgbToHexString({ r: 255, g: 0, b: 0, alpha: 128 });
      expect(result).toBe(`#ff000080`);
    });

    test(`does not include alpha when opacity is 255`, () => {
      const result = libraryRgbToHexString({ r: 255, g: 0, b: 0, alpha: 255 });
      expect(result).toBe(`#ff0000`);
    });

    test(`handles fractional rgb values`, () => {
      const result = libraryRgbToHexString({ r: 127.5, g: 63.75, b: 31.875 });
      expect(result).toBe(`#7f3f1f`);
    });

    test(`handles green component`, () => {
      const result = libraryRgbToHexString({ r: 0, g: 255, b: 0 });
      expect(result).toBe(`#00ff00`);
    });

    test(`handles blue component`, () => {
      const result = libraryRgbToHexString({ r: 0, g: 0, b: 255 });
      expect(result).toBe(`#0000ff`);
    });

    test(`handles hex conversion of purple`, () => {
      const result = libraryRgbToHexString({ r: 128, g: 0, b: 128 });
      expect(result).toBe(`#800080`);
    });
  });

  describe(`wrapScalarHue`, () => {
    test(`wraps value 0.5 to 0.5`, () => {
      expect(wrapScalarHue(0.5)).toBe(0.5);
    });

    test(`wraps value 1 to 0`, () => {
      expect(wrapScalarHue(1)).toBe(0);
    });

    test(`wraps value 2 to 0`, () => {
      expect(wrapScalarHue(2)).toBe(0);
    });

    test(`wraps value 1.5 to 0.5`, () => {
      expect(wrapScalarHue(1.5)).toBe(0.5);
    });

    test(`wraps negative value to positive`, () => {
      expect(wrapScalarHue(-0.5)).toBe(0.5);
    });

    test(`wraps value -1 to 0`, () => {
      const result = wrapScalarHue(-1);
      expect(result).toBeCloseTo(0);
    });

    test(`wraps value -1.5 to 0.5`, () => {
      expect(wrapScalarHue(-1.5)).toBe(0.5);
    });

    test(`handles very large positive values`, () => {
      expect(wrapScalarHue(100.5)).toBe(0.5);
    });

    test(`handles very large negative values`, () => {
      expect(wrapScalarHue(-100.5)).toBe(0.5);
    });

    test(`handles exact integer values`, () => {
      expect(wrapScalarHue(3)).toBeCloseTo(0);
      expect(wrapScalarHue(-2)).toBeCloseTo(0);
    });

    test(`handles fractional values near 1`, () => {
      expect(wrapScalarHue(0.999)).toBeCloseTo(0.999);
      expect(wrapScalarHue(1.001)).toBeCloseTo(0.001);
    });
  });
});
