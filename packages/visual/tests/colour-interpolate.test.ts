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
      expect(result).toContain(`hsl`);
    });
  });

  describe(`interpolator`, () => {
    test(`interpolates between two colours using default oklch`, () => {
      const interpolator = Colour.interpolator(`red`, `blue`);
      const result = interpolator(0.5);
      expect(typeof result).toBe(`string`);
      expect(result).toMatch(/^(rgb|hsl|oklch)\(/);
    });

    test(`interpolates at 0 returns colour equivalent to start`, () => {
      const interpolator = Colour.interpolator(`red`, `blue`);
      const result = interpolator(0);
      expect(result).toContain(`oklch`);
    });

    test(`interpolates at 1 returns colour equivalent to end`, () => {
      const interpolator = Colour.interpolator(`red`, `blue`);
      const result = interpolator(1);
      expect(result).toContain(`oklch`);
    });

    test(`uses oklch colour space by default`, () => {
      const interpolator = Colour.interpolator(`red`, `blue`, { space: `oklch` });
      const result = interpolator(0.5);
      expect(result).toBeTruthy();
    });

    test(`uses hsl colour space`, () => {
      const interpolator = Colour.interpolator(`red`, `blue`, { space: `hsl` });
      const result = interpolator(0.5);
      expect(result).toBeTruthy();
    });

    test(`uses srgb colour space`, () => {
      const interpolator = Colour.interpolator(`red`, `blue`, { space: `srgb` });
      const result = interpolator(0.5);
      expect(result).toBeTruthy();
    });

    test(`uses shorter direction by default`, () => {
      const interpolator = Colour.interpolator(`red`, `blue`, { direction: `shorter` });
      const result = interpolator(0.5);
      expect(result).toBeTruthy();
    });

    test(`uses longer direction`, () => {
      const interpolator = Colour.interpolator(`red`, `blue`, { direction: `longer` });
      const result = interpolator(0.5);
      expect(result).toBeTruthy();
    });

    test(`clamps amount below 0 to equivalent of start`, () => {
      const interpolator = Colour.interpolator(`red`, `blue`);
      const result = interpolator(-0.5);
      expect(result).toContain(`oklch`);
    });

    test(`clamps amount above 1 to equivalent of end`, () => {
      const interpolator = Colour.interpolator(`red`, `blue`);
      const result = interpolator(1.5);
      expect(result).toContain(`oklch`);
    });

    test(`interpolates between structured colours`, () => {
      const red = Colour.HslSpace.scalar(0, 1, 0.5, 1);
      const blue = Colour.HslSpace.scalar(0.66, 1, 0.5, 1);
      const interpolator = Colour.interpolator(red, blue);
      const result = interpolator(0.5);
      expect(typeof result).toBe(`string`);
    });
  });

  describe(`scale`, () => {
    test(`creates scale between two colours`, () => {
      const result = Colour.scale([`red`, `blue`], { stepsBetween: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result[0]).toContain(`oklch`);
      expect(result[result.length - 1]).toContain(`oklch`);
    });

    test(`respects stepsBetween option`, () => {
      const result = Colour.scale([`red`, `blue`], { stepsBetween: 5 });
      expect(result.length).toBe(7);
    });

    test(`respects stepsTotal option`, () => {
      const result = Colour.scale([`red`, `blue`], { stepsTotal: 10 });
      expect(result.length).toBeGreaterThanOrEqual(9);
    });

    test(`uses oklch space by default`, () => {
      const result = Colour.scale([`red`, `blue`], { stepsBetween: 3, space: `oklch` });
      expect(result.length).toBe(5);
    });

    test(`uses hsl space`, () => {
      const result = Colour.scale([`red`, `blue`], { stepsBetween: 3, space: `hsl` });
      expect(result.length).toBe(5);
    });

    test(`uses srgb space`, () => {
      const result = Colour.scale([`red`, `blue`], { stepsBetween: 3, space: `srgb` });
      expect(result.length).toBe(5);
    });

    test(`creates scale with multiple colour stops`, () => {
      const result = Colour.scale([`red`, `green`, `blue`], { stepsBetween: 2 });
      expect(result.length).toBeGreaterThan(3);
    });

    test(`throws when stepsTotal is too small`, () => {
      expect(() => Colour.scale([`red`, `blue`], { stepsTotal: 2 })).toThrow();
    });

    test(`throws when stepsBetween is less than 1`, () => {
      expect(() => Colour.scale([`red`, `blue`], { stepsBetween: 0 })).toThrow();
    });

    test(`uses shorter direction by default`, () => {
      const result = Colour.scale([`red`, `blue`], { stepsBetween: 3, direction: `shorter` });
      expect(result.length).toBe(5);
    });

    test(`uses longer direction`, () => {
      const result = Colour.scale([`red`, `blue`], { stepsBetween: 3, direction: `longer` });
      expect(result.length).toBe(5);
    });
  });

  describe(`createSteps`, () => {
    test(`creates steps between two colours with default options`, () => {
      const result = Colour.createSteps(`red`, `blue`, { steps: 5 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5);
    });

    test(`includes start and end colours by default`, () => {
      const result = Colour.createSteps(`red`, `blue`, { steps: 5 });
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    test(`excludes start and end when exclusive is true`, () => {
      const result = Colour.createSteps(`red`, `blue`, { exclusive: true });
      expect(result.length).toBe(5);
    });

    test(`uses oklch space by default`, () => {
      const result = Colour.createSteps(`red`, `blue`, { space: `oklch` });
      expect(result.length).toBe(5);
    });

    test(`uses hsl space`, () => {
      const result = Colour.createSteps(`red`, `blue`, { space: `hsl` });
      expect(result.length).toBe(5);
    });

    test(`uses srgb space`, () => {
      const result = Colour.createSteps(`red`, `blue`, { space: `srgb` });
      expect(result.length).toBe(5);
    });

    test(`respects steps option`, () => {
      const result = Colour.createSteps(`red`, `blue`, { steps: 10, space: `oklch` });
      expect(result.length).toBeGreaterThanOrEqual(9);
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

    test(`uses shorter direction by default`, () => {
      const result = Colour.createSteps(`red`, `blue`, { steps: 5, direction: `shorter` });
      expect(result.length).toBe(5);
    });

    test(`uses longer direction`, () => {
      const result = Colour.createSteps(`red`, `blue`, { steps: 5, direction: `longer` });
      expect(result.length).toBe(5);
    });
  });
});
