import { test, expect } from "vitest";
import { differenceFromLast, differenceFromFixed } from "../src/difference.js";
import { isApprox } from "../src/is-approx.js";

test(`differenceFromFixed`, () => {
  const d1 = differenceFromFixed(100, `absolute`);
  expect(d1(100)).eq(0);
  expect(d1(150)).eq(50);
  expect(d1(50)).eq(50);

  const d2 = differenceFromFixed(100, `numerical`);
  expect(d2(100)).eq(0);
  expect(d2(150)).eq(50);
  expect(d2(50)).eq(-50);

  const d3 = differenceFromFixed(100, `relativeSigned`);
  expect(d3(100)).eq(0);
  expect(d3(150)).eq(0.50);
  expect(d3(10)).eq(-0.90);

  const d4 = differenceFromFixed(100, `relative`);
  expect(d4(100)).eq(0);
  expect(d4(150)).eq(0.50);
  expect(d4(10)).eq(0.90);


});

test(`differenceFromLast`, () => {
  const approx = isApprox(0.1);

  const d1 = differenceFromLast(`absolute`);
  expect(d1(10)).eq(0);
  expect(d1(11)).eq(1);
  expect(d1(10)).eq(1);

  const d2 = differenceFromLast(`numerical`);
  expect(d2(10)).eq(0);
  expect(d2(11)).eq(1);
  expect(d2(10)).eq(-1);

  const d3 = differenceFromLast(`relative`);
  expect(d3(10)).eq(0);
  expect(approx(0.1, d3(11))).toBeTruthy();

  let x = d3(10);
  expect(approx(0.1, x), `x: ${ x }`).toBeTruthy();

  const d4 = differenceFromLast(`relativeSigned`);
  expect(d4(10)).eq(0);
  expect(d4(11)).eq(0.1);
  expect(approx(-0.1, d4(10))).toBeTruthy();

  const d5 = differenceFromLast(`absolute`, 10);
  expect(d5(11)).eq(1);

})