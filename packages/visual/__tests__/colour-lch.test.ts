import { expect, test } from 'vitest';
import * as Lch from '../src/colour/oklch.js';

const purpleScalar = Lch.scalar(0.44027, 0.40072499999999994, 0.8427078055555556, 1);
const purpleScalar1 = Lch.scalar(0.44027, 0.40075, 0.8426944444444444, 1);
const purpleScalarTrans = Lch.scalar(0.44027, 0.40075, 0.8426944444444444, 0.5);

const purpleAbs = Lch.absolute(0.44027, 0.16029, 303.37481, 1);
const purpleAbs1 = Lch.absolute(0.44027, 0.1603, 303.37, 1);
const purpleAbsTrans = Lch.absolute(0.44027, 0.1603, 303.37, 0.5);

const blackScalar = Lch.scalar(0, 0, 0, 1)
const blackAbs = Lch.absolute(0, 0, 0, 1);

test(`from-css`, () => {
  expect(Lch.fromCss(`rebeccapurple`, { scalar: false })).toEqual(purpleAbs);
  expect(Lch.fromCss(`rgb(40% 20% 60%)`, { scalar: false })).toEqual(purpleAbs);
  expect(Lch.fromCss(`#639`, { scalar: false })).toEqual(purpleAbs);
  expect(Lch.fromCss(`oklch(44.027% 0.1603 303.37)`, { scalar: false })).toEqual(purpleAbs1);

  expect(Lch.fromCss(`black`, { scalar: false })).toEqual(Lch.absolute(0, 0, 0, 1));

  expect(Lch.fromCss(`rebeccapurple`, { scalar: true })).toEqual(purpleScalar);
  expect(Lch.fromCss(`rgb(40% 20% 60%)`, { scalar: true })).toEqual(purpleScalar);
  expect(Lch.fromCss(`#639`, { scalar: true })).toEqual(purpleScalar);
  expect(Lch.fromCss(`oklch(44.027% 0.1603 303.37)`, { scalar: true })).toEqual(purpleScalar1);

  expect(Lch.fromCss(`black`, { scalar: true })).toEqual(blackScalar);

});

test(`to-css`, () => {
  // Default precision
  expect(Lch.toCssString(Lch.fromCss(`oklch(44.027% 0.1603 303.37)`, { scalar: false }))).toEqual(`oklch(44.027% 0.160 303.370)`);

  expect(Lch.toCssString(purpleScalar)).toEqual(`oklch(0.440 0.160 303.375)`);
  expect(Lch.toCssString(purpleScalarTrans)).toEqual(`oklch(0.440 0.160 303.370 / 0.500)`);

  expect(Lch.toCssString(purpleAbsTrans)).toEqual(`oklch(44.027% 0.160 303.370 / 0.500)`);
  expect(Lch.toCssString(purpleAbs)).toEqual(`oklch(44.027% 0.160 303.375)`);

  expect(Lch.toCssString(blackScalar)).toEqual(`oklch(0.000 0.000 0.000)`);
  expect(Lch.toCssString(blackAbs)).toEqual(`oklch(0.000% 0.000 0.000)`);

  // Custom precision
  expect(Lch.toCssString(Lch.fromCss(`oklch(44.027% 0.1603 303.37)`, { scalar: false }), 0)).toEqual(`oklch(44% 0 303)`);
});

test(`to-scalar`, () => {

  expect(Lch.toScalar(`rebeccapurple`)).toEqual(purpleScalar);
  expect(Lch.toScalar(`rgb(40% 20% 60%)`)).toEqual(purpleScalar);
  expect(Lch.toScalar(`#639`)).toEqual(purpleScalar);
  expect(Lch.toScalar(`oklch(44.027% 0.1603 303.37)`)).toEqual(purpleScalar1);
  expect(Lch.toScalar(`black`)).toEqual(blackScalar);

  // Round-tripping
  expect(Lch.toScalar(purpleScalar)).toEqual(purpleScalar);
  expect(Lch.toScalar(purpleAbs)).toEqual(purpleScalar);


});

test(`to-absolute`, () => {
  expect(Lch.toAbsolute(`rebeccapurple`)).toEqual(purpleAbs);
  expect(Lch.toAbsolute(`rgb(40% 20% 60%)`)).toEqual(purpleAbs);
  expect(Lch.toAbsolute(`#639`)).toEqual(purpleAbs);
  expect(Lch.toAbsolute(`oklch(44.027% 0.1603 303.37)`)).toEqual(purpleAbs1);
  expect(Lch.toAbsolute(`black`)).toEqual(blackAbs);

  // Round-tripping
  expect(Lch.toAbsolute(purpleScalar)).toEqual(purpleAbs);
  expect(Lch.toAbsolute(purpleAbs)).toEqual(purpleAbs);

});