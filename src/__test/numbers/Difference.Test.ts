import test from "ava";
import { differenceFromLast, differenceFromFixed } from "../../numbers/Difference.js";
import { isApprox } from "../../numbers/IsApprox.js";

test(`differenceFromFixed`, t => {
  const d1 = differenceFromFixed(100, `absolute`);
  t.is(d1(100), 0);
  t.is(d1(150), 50);
  t.is(d1(50), 50);

  const d2 = differenceFromFixed(100, `numerical`);
  t.is(d2(100), 0);
  t.is(d2(150), 50);
  t.is(d2(50), -50);

  const d3 = differenceFromFixed(100, `relativeSigned`);
  t.is(d3(100), 0);
  t.is(d3(150), 0.50);
  t.is(d3(10), -0.90);

  const d4 = differenceFromFixed(100, `relative`);
  t.is(d4(100), 0);
  t.is(d4(150), 0.50);
  t.is(d4(10), 0.90);


});

test(`differenceFromLast`, t => {
  const approx = isApprox(0.1);

  const d1 = differenceFromLast(`absolute`);
  t.is(d1(10), 0);
  t.is(d1(11), 1);
  t.is(d1(10), 1);

  const d2 = differenceFromLast(`numerical`);
  t.is(d2(10), 0);
  t.is(d2(11), 1);
  t.is(d2(10), -1);

  const d3 = differenceFromLast(`relative`);
  t.is(d3(10), 0);
  t.true(approx(0.1, d3(11)));
  let x = d3(10);
  t.true(approx(0.1, x), `x: ${ x }`);

  const d4 = differenceFromLast(`relativeSigned`);
  t.is(d4(10), 0);
  t.is(d4(11), 0.1);
  t.true(approx(-0.1, d4(10)));

  const d5 = differenceFromLast(`absolute`, 10);
  t.is(d5(11), 1);

})