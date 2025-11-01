/* eslint-disable @typescript-eslint/no-unsafe-call */
import { expect, test } from 'vitest'
import { decodeRgbFrom16Bit565, decodeRgbFrom24Bit, encodeRgbTo16Bit565, encodeRgbTo24Bit } from '../src/colour/to-integer.js';


// https://www.dcode.fr/color-red-green-blue
const colours = [
  { name: `cyan`, hex: `#00FFFF`, rgb: { r: 0, g: 255, b: 255 }, bit24: 65535, bit565: 2047, rgb565: { r: 0, g: 252, b: 248 } },
  { name: `red`, hex: `ff0000`, rgb: { r: 255, g: 0, b: 0 }, bit24: 16711680, bit565: 63488, rgb565: { r: 248, g: 0, b: 0 } },
  { name: `blue`, hex: `0000ff`, rgb: { r: 0, g: 0, b: 255 }, bit24: 255, bit565: 31, rgb565: { r: 0, g: 0, b: 248 } },
  { name: `green`, hex: `00ff00`, rgb: { r: 0, g: 255, b: 0 }, bit24: 65280, bit565: 2016, rgb565: { r: 0, g: 252, b: 0 } },
  { name: `yellow`, hex: `#FFFF00`, rgb: { r: 255, g: 255, b: 0 }, bit24: 16776960, bit565: 65504, rgb565: { r: 248, g: 252, b: 0 } },
  { name: `fuschia`, hex: `#FF00FF`, rgb: { r: 255, g: 0, b: 255 }, bit24: 16711935, bit565: 63519, rgb565: { r: 248, g: 0, b: 248 } },
  { name: `black`, hex: `#000000`, rgb: { r: 0, g: 0, b: 0 }, bit24: 0, bit565: 0, rgb565: { r: 0, g: 0, b: 0 } },
  { name: `white`, hex: `#FFFFFF`, rgb: { r: 255, g: 255, b: 255 }, bit24: 16777215, bit565: 65535, rgb565: { r: 248, g: 252, b: 248 } },
  { name: `grey`, hex: `#7F7F7F`, rgb: { r: 127, g: 127, b: 127 }, bit24: 8355711, bit565: 31727, rgb565: { r: 120, g: 124, b: 120 } }
]

test(`rgb-coding-24`, () => {
  for (const c of colours) {
    const parsed = encodeRgbTo24Bit(c.rgb);
    expect(parsed).toBe(c.bit24);
  }

  for (const c of colours) {
    const parsed = decodeRgbFrom24Bit(c.bit24);
    expect(parsed).toStrictEqual(c.rgb);
  }
});

test(`rgb-coding-16-565`, () => {
  for (const c of colours) {
    const parsed = encodeRgbTo16Bit565(c.rgb);
    expect(parsed).toStrictEqual(c.bit565);
  }

  for (const c of colours) {
    const parsed = decodeRgbFrom16Bit565(c.bit565);
    expect(parsed).toStrictEqual(c.rgb565);
  }
});