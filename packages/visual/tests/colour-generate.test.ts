import { test, expect, describe } from 'vitest';
import { goldenAngleColour, randomHue } from '../src/colour/generate.js';

describe(`generate`, () => {
  describe(`goldenAngleColour`, () => {
    test(`default parameters`, () => {
      const result = goldenAngleColour(0);
      expect(result).toMatch(/^hsl\([\d.]+deg [\d.]+% [\d.]+%\)$/);
    });

    test(`with index`, () => {
      const result = goldenAngleColour(10);
      expect(result).toMatch(/^hsl\([\d.]+deg 50% 75%\)$/);
    });

    test(`with custom saturation`, () => {
      const result = goldenAngleColour(5, 0.8);
      expect(result).toMatch(/^hsl\([\d.]+deg 80% 75%\)$/);
    });

    test(`with custom lightness`, () => {
      const result = goldenAngleColour(5, 0.5, 0.6);
      expect(result).toMatch(/^hsl\([\d.]+deg 50% 60%\)$/);
    });

    test(`with alpha`, () => {
      const result = goldenAngleColour(5, 0.5, 0.75, 0.5);
      expect(result).toMatch(/^hsl\([\d.]+deg 50% 75% \/ 50%\)$/);
    });

    test(`with alpha of 1`, () => {
      const result = goldenAngleColour(5, 0.5, 0.75, 1);
      expect(result).toMatch(/^hsl\([\d.]+deg 50% 75%\)$/);
    });

    test(`produces consistent results`, () => {
      const result1 = goldenAngleColour(100);
      const result2 = goldenAngleColour(100);
      expect(result1).toBe(result2);
    });

    test(`throws on negative index`, () => {
      expect(() => goldenAngleColour(-1)).toThrow();
    });

    test(`throws on saturation > 1`, () => {
      expect(() => goldenAngleColour(0, 1.5)).toThrow();
    });

    test(`throws on lightness > 1`, () => {
      expect(() => goldenAngleColour(0, 0.5, 1.5)).toThrow();
    });

    test(`throws on alpha > 1`, () => {
      expect(() => goldenAngleColour(0, 0.5, 0.75, 1.5)).toThrow();
    });

    test(`throws on negative saturation`, () => {
      expect(() => goldenAngleColour(0, -0.1)).toThrow();
    });

    test(`throws on negative lightness`, () => {
      expect(() => goldenAngleColour(0, 0.5, -0.1)).toThrow();
    });

    test(`throws on negative alpha`, () => {
      expect(() => goldenAngleColour(0, 0.5, 0.75, -0.1)).toThrow();
    });
  });

  describe(`randomHue`, () => {
    test(`returns value between 0 and 360`, () => {
      const mockRandom = () => 0.5;
      const result = randomHue(mockRandom);
      expect(result).toBe(180);
    });

    test(`returns 0 for random 0`, () => {
      const mockRandom = () => 0;
      const result = randomHue(mockRandom);
      expect(result).toBe(0);
    });

    test(`returns 359.999 for random almost 1`, () => {
      const mockRandom = () => 0.999999;
      const result = randomHue(mockRandom);
      expect(result).toBeCloseTo(360, -3);
    });

    test(`uses default Math.random`, () => {
      const result = randomHue();
      expect(typeof result).toBe(`number`);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    });

    test(`consistent with seeded random`, () => {
      const seededRandom = () => 0.12345;
      const result1 = randomHue(seededRandom);
      const result2 = randomHue(seededRandom);
      expect(result1).toBe(result2);
    });
  });
});
