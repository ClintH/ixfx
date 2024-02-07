import test from 'ava';
import { Points } from '../../geometry/index.js';
import * as Polar from '../../geometry/Polar.js';
import { degreeToRadian } from '../../geometry/Angles.js';

const closeEnough = (a: Points.Point, b: Points.Point): boolean => {
  a = Points.apply(a, Math.round);
  b = Points.apply(b, Math.round);
  const v = (Points.isEqual(a, b));
  if (!v) {
    console.log(`a: ${ JSON.stringify(a) }`);
    console.log(`b: ${ JSON.stringify(b) }`);
  }
  return v;
};

test(`conversion`, (t) => {

  // Test results via
  // https://keisan.casio.com/exec/system/1223527679
  t.true(closeEnough(
    Polar.toCartesian(5, degreeToRadian(60)),
    { x: 2.5, y: 4.33 }
  ));

  t.true(closeEnough(
    Polar.toCartesian(5, degreeToRadian(0)),
    { x: 5, y: 0 }
  ));

  t.true(closeEnough(
    Polar.toCartesian(5, degreeToRadian(360)),
    { x: 5, y: 0 }
  ));

  t.true(closeEnough(
    Polar.toCartesian(5, degreeToRadian(60)),
    { x: 2.5, y: 4.33 }
  ));

  t.true(closeEnough(
    Polar.toCartesian(5, degreeToRadian(100)),
    { x: -0.862, y: 4.924 }
  ));

  t.true(closeEnough(
    Polar.toCartesian(5, degreeToRadian(-100)),
    { x: -0.862, y: -4.924 }
  ));

  t.true(closeEnough(
    Polar.toCartesian(5, degreeToRadian(130)),
    { x: -3.213, y: 3.8302 }
  ));

  t.true(closeEnough(
    Polar.toCartesian(5, degreeToRadian(180)),
    { x: -5, y: 0 }
  ));

  t.true(closeEnough(
    Polar.toCartesian(5, degreeToRadian(200)),
    { x: -4.69, y: -1.71 }
  ));

  t.true(closeEnough(
    Polar.toCartesian(5, degreeToRadian(280)),
    { x: 0.868, y: -4.924 }
  ));

  t.true(closeEnough(
    Polar.toCartesian(5, degreeToRadian(-280)),
    { x: 0.868, y: 4.924 }
  ));
});