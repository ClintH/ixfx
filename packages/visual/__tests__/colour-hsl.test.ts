import { expect, test } from 'vitest';
import * as HslSpace from '../src/colour/hsl.js';


test(`from-css`, () => {
  // Same colours
  const purple = [
    `rebeccapurple`,
    `rgb(40% 20% 60%)`,
    `rgb(102, 51, 153)`,
    `hsl(270 50% 40%)`,
    `hsl(270deg 50% 40%)`,
    "#639",
    "oklch(44.027% 0.1603 303.37)"
  ]

  const purpleTrans = [
    `rgb(102, 51, 153 / 0.5)`,
    `hsl(270deg 50% 40% / 50%)`,
    `hsl(270deg 50% 40% / 0.5)`,
    `hsl(270 50% 40% / 50%)`,
    `hsl(270 50% 40% / 0.5)`,
    `rgb(40% 20% 60% / 50%)`,
  ];
  const purpleScalar = HslSpace.scalar(0.75, 0.5, 0.4, 1);
  const purpleScalarTrans = HslSpace.scalar(0.75, 0.5, 0.4, 0.5);
  const purpleAbs = HslSpace.absolute(270, 50, 40, 100);
  const purpleAbsTrans = HslSpace.absolute(270, 50, 40, 50);

  for (const p of purple) {
    expect(HslSpace.fromCss(p, { scalar: true })).toStrictEqual(purpleScalar);
    expect(HslSpace.fromCss(p, { scalar: false })).toStrictEqual(purpleAbs);
  }

  for (const pTrans of purpleTrans) {
    expect(HslSpace.fromCss(pTrans, { scalar: true })).toStrictEqual(purpleScalarTrans);
    expect(HslSpace.fromCss(pTrans, { scalar: false })).toStrictEqual(purpleAbsTrans);

  }
  expect(HslSpace.fromCss(`hsl(150deg 30% 60%)`, { scalar: true })).toStrictEqual(HslSpace.scalar(150 / 360, 0.3, 0.6));
});

test(`parse-css`, () => {
  expect(HslSpace.parseCssHslFunction(`hsl(270 50% 40%)`)).toEqual(HslSpace.scalar(270 / 360, 0.5, 0.4));
  expect(HslSpace.parseCssHslFunction(`hsl(270 50% 40% / 50%)`)).toEqual(HslSpace.scalar(270 / 360, 0.5, 0.4, 0.5));
  expect(HslSpace.parseCssHslFunction(`hsl(270 50% 40% / 0.5)`)).toEqual(HslSpace.scalar(270 / 360, 0.5, 0.4, 0.5));

  // Transparency
  expect(HslSpace.parseCssHslFunction(`hsl(270deg 50% 40%)`)).toEqual(HslSpace.scalar(270 / 360, 0.5, 0.4));
  expect(HslSpace.parseCssHslFunction(`hsl(270deg 50% 40% / 50%)`)).toEqual(HslSpace.scalar(270 / 360, 0.5, 0.4, 0.5));
  expect(HslSpace.parseCssHslFunction(`hsl(270deg 50% 40% / 0.5)`)).toEqual(HslSpace.scalar(270 / 360, 0.5, 0.4, 0.5));
  expect(HslSpace.parseCssHslFunction(`hsl(270 50% 40% / 50%)`)).toEqual(HslSpace.scalar(270 / 360, 0.5, 0.4, 0.5));
  expect(HslSpace.parseCssHslFunction(`hsl(270 50% 40% / 0.5)`)).toEqual(HslSpace.scalar(270 / 360, 0.5, 0.4, 0.5));


  // Units optional
  expect(HslSpace.parseCssHslFunction(`hsl(270 50 40)`)).toEqual(HslSpace.absolute(270, 50, 40));
  expect(HslSpace.parseCssHslFunction(`hsl(270 50 40 / 60%)`)).toEqual(HslSpace.absolute(270, 50, 40, 60));
  expect(HslSpace.parseCssHslFunction(`hsl(none 75% 25%)`)).toEqual(HslSpace.scalar(0, 0.75, .25));


});

