/* eslint-disable */
import {Points, degreeToRadian} from '../../geometry/index.js';
import * as Polar from '../../geometry/Polar.js';

const closeEnough = (a:Points.Point, b:Points.Point):boolean => {
  a = Points.apply(a, Math.round);
  b = Points.apply(b, Math.round);
  const v = (Points.equals(a, b));
  if (!v) {
    console.log(`a: ${JSON.stringify(a)}`);
    console.log(`b: ${JSON.stringify(b)}`);
  }
  return v;
};

test(`conversion`, () => {

 // Test results via
 // https://keisan.casio.com/exec/system/1223527679
  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(60)),
      {x:2.5, y:4.33}
  )).toBeTruthy();

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(0)),
      {x:5, y:0}
  )).toBeTruthy();

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(360)),
      {x:5, y:0}
  )).toBeTruthy();
  
  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(60)),
      {x:2.5, y:4.33}
  )).toBeTruthy();
  
  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(100)),
      {x:-0.862, y:4.924}
  )).toBeTruthy();

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(-100)),
      {x:-0.862, y:-4.924}
  )).toBeTruthy();

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(130)),
      {x:-3.213, y:3.8302}
  )).toBeTruthy();
  
  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(180)),
      {x:-5, y:0}
  )).toBeTruthy();
  
  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(200)),
      {x:-4.69, y:-1.71}
  )).toBeTruthy();
  
  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(280)),
      {x:0.868, y:-4.924}
  )).toBeTruthy();

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(-280)),
      {x:0.868, y:4.924}
  )).toBeTruthy();
});