import { test, expect, describe } from 'vitest';
import { 
  encodeRgbTo24Bit, 
  decodeRgbFrom24Bit,
  encodeRgbTo16Bit565,
  decodeRgbFrom16Bit565
} from '../src/colour/to-integer.js';
import type { Rgb8Bit } from '../src/colour/types.js';

describe('to-integer', () => {
  describe('24-bit encoding/decoding', () => {
    test('encodes white to 24-bit', () => {
      const white: Rgb8Bit = { r: 255, g: 255, b: 255, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo24Bit(white);
      expect(encoded).toBe(0xFFFFFF); // 16,777,215
    });

    test('encodes black to 24-bit', () => {
      const black: Rgb8Bit = { r: 0, g: 0, b: 0, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo24Bit(black);
      expect(encoded).toBe(0);
    });

    test('encodes red to 24-bit', () => {
      const red: Rgb8Bit = { r: 255, g: 0, b: 0, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo24Bit(red);
      expect(encoded).toBe(0xFF0000);
    });

    test('encodes green to 24-bit', () => {
      const green: Rgb8Bit = { r: 0, g: 255, b: 0, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo24Bit(green);
      expect(encoded).toBe(0x00FF00);
    });

    test('encodes blue to 24-bit', () => {
      const blue: Rgb8Bit = { r: 0, g: 0, b: 255, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo24Bit(blue);
      expect(encoded).toBe(0x0000FF);
    });

    test('decodes 24-bit to white', () => {
      const decoded = decodeRgbFrom24Bit(0xFFFFFF);
      expect(decoded.r).toBe(255);
      expect(decoded.g).toBe(255);
      expect(decoded.b).toBe(255);
    });

    test('decodes 24-bit to black', () => {
      const decoded = decodeRgbFrom24Bit(0);
      expect(decoded.r).toBe(0);
      expect(decoded.g).toBe(0);
      expect(decoded.b).toBe(0);
    });

    test('decodes 24-bit to red', () => {
      const decoded = decodeRgbFrom24Bit(0xFF0000);
      expect(decoded.r).toBe(255);
      expect(decoded.g).toBe(0);
      expect(decoded.b).toBe(0);
    });

    test('round-trip encoding and decoding', () => {
      const original: Rgb8Bit = { r: 100, g: 150, b: 200, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo24Bit(original);
      const decoded = decodeRgbFrom24Bit(encoded);
      
      expect(decoded.r).toBe(original.r);
      expect(decoded.g).toBe(original.g);
      expect(decoded.b).toBe(original.b);
    });

    test('throws on out of range 24-bit value', () => {
      expect(() => decodeRgbFrom24Bit(16_777_216)).toThrow('out of range');
    });
  });

  describe('16-bit RGB565 encoding/decoding', () => {
    test('encodes white to 16-bit RGB565', () => {
      const white: Rgb8Bit = { r: 255, g: 255, b: 255, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo16Bit565(white);
      expect(encoded).toBe(0xFFFF); // All bits set
    });

    test('encodes black to 16-bit RGB565', () => {
      const black: Rgb8Bit = { r: 0, g: 0, b: 0, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo16Bit565(black);
      expect(encoded).toBe(0);
    });

    test('encodes red to 16-bit RGB565', () => {
      const red: Rgb8Bit = { r: 255, g: 0, b: 0, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo16Bit565(red);
      expect(encoded).toBe(0xF800); // 5 bits for red
    });

    test('encodes green to 16-bit RGB565', () => {
      const green: Rgb8Bit = { r: 0, g: 255, b: 0, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo16Bit565(green);
      expect(encoded).toBe(0x07E0); // 6 bits for green
    });

    test('encodes blue to 16-bit RGB565', () => {
      const blue: Rgb8Bit = { r: 0, g: 0, b: 255, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo16Bit565(blue);
      expect(encoded).toBe(0x001F); // 5 bits for blue
    });

    test('decodes 16-bit RGB565 to approximate white', () => {
      const decoded = decodeRgbFrom16Bit565(0xFFFF);
      // RGB565 white is 0b11111_111111_11111
      expect(decoded.r).toBe(248); // 31 << 3 = 248
      expect(decoded.g).toBe(252); // 63 << 2 = 252
      expect(decoded.b).toBe(248); // 31 << 3 = 248
    });

    test('decodes 16-bit RGB565 to black', () => {
      const decoded = decodeRgbFrom16Bit565(0);
      expect(decoded.r).toBe(0);
      expect(decoded.g).toBe(0);
      expect(decoded.b).toBe(0);
    });

    test('round-trip encoding and decoding (approximate)', () => {
      const original: Rgb8Bit = { r: 100, g: 150, b: 200, unit: '8bit', space: 'srgb' };
      const encoded = encodeRgbTo16Bit565(original);
      const decoded = decodeRgbFrom16Bit565(encoded);
      
      // RGB565 loses precision due to fewer bits
      // R and B have 5 bits (loss of 3 bits), G has 6 bits (loss of 2 bits)
      expect(decoded.r).toBeCloseTo(original.r, -3); // Within 8 units
      expect(decoded.g).toBeCloseTo(original.g, -2); // Within 4 units
      expect(decoded.b).toBeCloseTo(original.b, -3); // Within 8 units
    });

    test('throws on out of range 16-bit RGB565 value', () => {
      expect(() => decodeRgbFrom16Bit565(65_536)).toThrow('out of range');
    });
  });
});
