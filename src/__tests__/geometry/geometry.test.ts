import { expect, test } from '@jest/globals';
import { degreeToRadian, radianToDegree } from '../../geometry/index.js';
/* eslint-disable */

test(`degreeToRadian`, () => {
  expect(degreeToRadian(30).toPrecision(4)).toEqual("0.5236");
  expect(degreeToRadian(45).toPrecision(4)).toEqual("0.7854");
  expect(degreeToRadian(60).toPrecision(4)).toEqual("1.047");
  expect(degreeToRadian(90).toPrecision(4)).toEqual("1.571");
  expect(degreeToRadian(120).toPrecision(4)).toEqual("2.094");
  expect(degreeToRadian(135).toPrecision(4)).toEqual("2.356");
  expect(degreeToRadian(150).toPrecision(4)).toEqual("2.618");
  expect(degreeToRadian(180).toPrecision(4)).toEqual("3.142");
  expect(degreeToRadian(200).toPrecision(4)).toEqual("3.491");
  expect(degreeToRadian(270).toPrecision(4)).toEqual("4.712");
  expect(degreeToRadian(360).toPrecision(4)).toEqual("6.283")
});

test(`radianToDegree`, () => {
  expect(radianToDegree(0)).toEqual(0);
  
  expect(Math.round(radianToDegree(0.5235))).toEqual(30);
  expect(Math.round(radianToDegree(0.7853))).toEqual(45);
  expect(Math.round(radianToDegree(1.047))).toEqual(60);
  expect(Math.round(radianToDegree(1.5707))).toEqual(90);
  expect(Math.round(radianToDegree(2.0943))).toEqual(120);
  expect(Math.round(radianToDegree(3.1415))).toEqual(180);
  expect(Math.round(radianToDegree(4.7123))).toEqual(270);
  expect(Math.round(radianToDegree(6.2831))).toEqual(360);


});