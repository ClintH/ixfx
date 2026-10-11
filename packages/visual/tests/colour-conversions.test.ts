import { expect, it } from 'vitest';
import { cssDefinedHexColours, fromCssColour, resolveCss } from '../src/colour/css-colours.js';
import * as Hsl from '../src/colour/hsl.js';
import * as Srgb from '../src/colour/srgb.js';

it(`srgb hex parsing round-trips`, () => {
  const c = Srgb.fromHexString(`#FF8040`, false);
  expect(c).toMatchObject({ space: `srgb`, unit: `8bit`, r: 255, g: 128, b: 64 });
  expect(Srgb.toHexString(c).toUpperCase()).toBe(`#FF8040`);

  const scalarVersion = Srgb.fromHexString(`#FF8040`, true);
  expect(scalarVersion.unit).toBe(`scalar`);
  expect(scalarVersion.r).toBeCloseTo(1);
  expect(scalarVersion.g).toBeCloseTo(128 / 255, 2);
});

it(`srgb css parsing`, () => {
  const c = Srgb.fromCss(`rgb(10, 20, 30)`, { scalar: false });
  expect(c).toMatchObject({ r: 10, g: 20, b: 30, unit: `8bit` });

  const named = Srgb.fromCss(`red`, { scalar: false });
  expect(named).toMatchObject({ r: 255, g: 0, b: 0 });

  // toCssString emits a usable css colour
  expect(Srgb.toCssString({ space: `srgb`, unit: `8bit`, r: 255, g: 0, b: 0, opacity: 255 })).toMatch(/255/);
});

it(`hsl parsing and round-trip`, () => {
  const c = Hsl.fromCss(`hsl(120, 100%, 50%)`);
  expect(c.space).toBe(`hsl`);
  // 'absolute' unit: h in degrees, s/l in percent
  expect(c.unit).toBe(`absolute`);
  expect(Math.round(c.h)).toBe(120);
  expect(c.s).toBe(100);
  expect(c.l).toBe(50);

  const hex = Hsl.toHexString(c);
  const back = Hsl.fromHexString(hex, { scalar: false });
  // Hue round-trips within a degree via 8-bit rgb; s/l exactly
  expect(Math.abs(back.h - 120)).toBeLessThan(1.5);
  expect(back.s).toBe(100);
  expect(back.l).toBe(50);
});

it(`hsl scalar conversions`, () => {
  const s = Hsl.toScalar(`hsl(0, 100%, 50%)`);
  expect(s.unit).toBe(`scalar`);
  expect(s.l).toBeCloseTo(0.5, 2);
  expect(s.s).toBeCloseTo(1, 2);

  // generateScalar produces a scalar hsl from an angle
  const g = Hsl.generateScalar(180);
  expect(g.unit).toBe(`scalar`);
  expect(g.l).toBeCloseTo(0.5, 2);
});

it(`hsl guard rejects out-of-range values`, () => {
  expect(() => Hsl.guard({ space: `hsl`, unit: `scalar`, hue: -1, saturation: 1, lightness: 0.5, opacity: 1 })).toThrow();
  expect(() => Hsl.guard({ space: `hsl`, unit: `scalar`, hue: 10, saturation: 2, lightness: 0.5, opacity: 1 })).toThrow();
});

it(`css colour name resolution`, () => {
  expect(resolveCss(`red`)).toBe(cssDefinedHexColours.red);

  // NB: unknown names are passed through unchanged (no fallback substitution)
  expect(resolveCss(`definitely-not-a-colour`, `#000000`)).toBe(`definitely-not-a-colour`);

  // fromCssColour parses names to scalar rgb
  expect(fromCssColour(`red`)).toMatchObject({ space: `srgb`, r: 1, g: 0, b: 0 });
});
