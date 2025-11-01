import type { Rgb8Bit, RgbBase } from "./types.js";

/**
 * Encode 8-bit RGB values into a 24-bit value (0...16_777_215)
 * 
 * Assumes RGB values are within 0..255 range
 * @param rgb 
 * @returns 
 */
export function encodeRgbTo24Bit(rgb: Rgb8Bit | RgbBase) {
  return (rgb.r << 16) | (rgb.g << 8) | rgb.b;
}

/**
 * Decode a 24-bit number (0...16_777_215) into 8-bit RGB
 * @param colour 
 * @returns 
 */
export function decodeRgbFrom24Bit(colour: number): Rgb8Bit {
  if (colour > 16_777_215) throw new TypeError(`Param 'colour' is out of range. Expected max value of 16_777_215, got ${ colour }`)
  return {
    r: (colour >> 16) & 0xff,
    g: (colour >> 8) & 0xff,
    b: colour & 0xff,
    unit: `8bit`,
    space: `srgb`
  }
}

/**
 * Encodes 8-bit RGB value into 16-bit RGB565 (0..65_535)
 * 5-bit are used for R & B channels, 6 bits for G
 * 
 * Read more: https://rgbcolorpicker.com/565
 * @param rgb 
 * @returns 
 */
export function encodeRgbTo16Bit565(rgb: Rgb8Bit | RgbBase) {
  const r = (rgb.r >> 3) & 0x1F;   // 5 bits
  const g = (rgb.g >> 2) & 0x3F; // 6 bits
  const b = (rgb.b >> 3) & 0x1F;  // 5 bits

  return (r << 11) | (g << 5) | b;
}

/**
 * Decodes 8-bit RGB value from a 16-bit RGB565 value (0...65_535)
 * Read more: https://rgbcolorpicker.com/565
 * @param colour 
 * @returns 
 */
export function decodeRgbFrom16Bit565(colour: number): Rgb8Bit {
  if (colour > 65_535) throw new TypeError(`Param 'colour' is out of range. Expected max: 65_535. Got: ${ colour }`);
  const r = ((colour >> 11) & 0x1F) << 3;
  const g = ((colour >> 5) & 0x3F) << 2;
  const b = (colour & 0x1F) << 3;
  return { r, g, b, unit: `8bit`, space: `srgb` };
}