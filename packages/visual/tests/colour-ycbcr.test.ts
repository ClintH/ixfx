import { expect, it } from 'vitest';
import * as Ycbcr from '../src/colour/ycbcr.js';

it(`eightBit and scalar constructors + guard`, () => {
  const c = Ycbcr.eightBit(100, 50, 200);
  expect(c).toMatchObject({ space: `ycbcr`, unit: `8bit`, y: 100, cb: 50, cr: 200, opacity: 255 });

  const s = Ycbcr.scalar(0.5, 0.1, 0.9, 0.5);
  expect(s).toMatchObject({ space: `ycbcr`, unit: `scalar`, y: 0.5, cb: 0.1, cr: 0.9, opacity: 0.5 });

  // Out-of-range values throw
  expect(() => Ycbcr.eightBit(300)).toThrow();
  expect(() => Ycbcr.scalar(1.5)).toThrow();
});

it(`rgb -> ycbcr -> rgb round-trip (8bit)`, () => {
  const rgb = { space: `srgb`, unit: `8bit`, r: 120, g: 80, b: 200, opacity: 255 } as const;
  const ycbcr = Ycbcr.fromSrgTo8bit(rgb);
  expect(ycbcr.space).toBe(`ycbcr`);

  // Standard BT.601 matrix (rounded to 8-bit)
  expect(ycbcr.y).toBeCloseTo(Math.round(0.299 * 120 + 0.587 * 80 + 0.114 * 200), 0);

  const back = Ycbcr.toSrgb8bit(ycbcr);
  // Approximate inverse (matrix is not exact); allow generous tolerance
  expect(Math.abs(back.r - 120)).toBeLessThan(30);
  expect(Math.abs(back.g - 80)).toBeLessThan(30);
  expect(Math.abs(back.b - 200)).toBeLessThan(30);
});

it(`to8bit converts scalar representation`, () => {
  const s = Ycbcr.scalar(0.5, 0.5, 0.5);
  const b = Ycbcr.to8bit(s);
  expect(b.unit).toBe(`8bit`);
  expect(b.y).toBeCloseTo(127.5);
  // Passes through 8bit input unchanged
  expect(Ycbcr.to8bit(b)).toBe(b);
});

it(`fromCss parses and converts`, () => {
  const c = Ycbcr.fromCss(`rgb(255, 0, 0)`);
  expect(c.space).toBe(`ycbcr`);
  // Pure red: Y = round(0.299*255) = 76, Cr clamps to 255
  expect(c.y).toBe(76);
  expect(c.cr).toBe(255);
  expect(c.cb).toBeLessThan(128);

  const scalarVersion = Ycbcr.fromCss(`rgb(255, 0, 0)`, { scalar: true });
  expect(scalarVersion.unit).toBe(`scalar`);
});

it(`toScalar and toHexString`, () => {
  const s = Ycbcr.toScalar(`rgb(255, 0, 0)`);
  expect(s.unit).toBe(`scalar`);
  expect(s.y).toBeCloseTo(76 / 255, 2);

  const hex = Ycbcr.toHexString(Ycbcr.eightBit(76, 85, 255));
  expect(hex).toMatch(/^#/);
});
