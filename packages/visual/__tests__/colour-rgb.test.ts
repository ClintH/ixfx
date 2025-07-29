import { expect, test } from 'vitest';
import * as Rgb from '../src/colour/srgb.js';

const purple8Bit = Rgb.eightBit(102, 51, 153);
const purple8BitOpacity = Rgb.eightBit(102, 51, 153, 127.5);
const purpleScalar = Rgb.scalar(0.4, 0.2, 0.6);
const purpleScalarOpacity = Rgb.scalar(0.4, 0.2, 0.6, 0.5);


test(`parse`, () => {

  // Scalar
  expect(Rgb.parseCssRgbFunction("rgb(40% 20% 60%)")).toEqual(purpleScalar);
  expect(Rgb.parseCssRgbFunction("rgb(40%, 20%, 60%)")).toEqual(purpleScalar);
  expect(Rgb.parseCssRgbFunction("rgb(40%, 20%, 60% / 50%)")).toEqual(purpleScalarOpacity);
  expect(Rgb.parseCssRgbFunction("rgb(40%, 20%, 60% / 0.5)")).toEqual(purpleScalarOpacity);
  expect(Rgb.parseCssRgbFunction("rgb(102 20% 60%)")).toEqual(purpleScalar);
  expect(Rgb.parseCssRgbFunction("rgb(40% 51 60%)")).toEqual(purpleScalar);
  expect(Rgb.parseCssRgbFunction("rgb(40% 20% 153)")).toEqual(purpleScalar);

  // 8bit
  expect(Rgb.parseCssRgbFunction("rgb(102 51 153)")).toEqual(purple8Bit);
  expect(Rgb.parseCssRgbFunction("rgb(102, 51, 153)")).toEqual(purple8Bit);
  expect(Rgb.parseCssRgbFunction("rgb(102 51 153 / 50%)")).toEqual(purple8BitOpacity);
  expect(Rgb.parseCssRgbFunction("rgb(102 51 153 / 0.5)")).toEqual(purple8BitOpacity);

  expect(Rgb.parseCssRgbFunction("rgb(102 20% 153)")).toEqual(purple8Bit);
  expect(Rgb.parseCssRgbFunction("rgb(102 51 60%)")).toEqual(purple8Bit);
  expect(Rgb.parseCssRgbFunction("rgb(40%,51,153)")).toEqual(purple8Bit);

})

test(`conversion`, () => {
  // Same colours
  const purple = [
    `rebeccapurple`,
    `rgb(40% 20% 60%)`,
    `rgb(102, 51, 153)`,
    "rgb(40%, 20%, 60% / 100%)",
    "#639",
    "oklch(44.027% 0.1603 303.37)"
  ]

  for (const p of purple) {
    expect(Rgb.fromCss(p, { scalar: false })).toStrictEqual(purple8Bit);
    expect(Rgb.fromCss(p, { scalar: true })).toStrictEqual(purpleScalar);
  }

  expect(Rgb.fromCss(`hsl(100,100%,50%)`, { scalar: false })).toEqual({ r: 85, g: 255, b: 0, opacity: 255, space: `srgb`, unit: `8bit` });

});