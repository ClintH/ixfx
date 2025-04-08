import expect from 'expect';
import { degreeToRadian, radianToDegree, degreeArc, degreesSum, radiansSum } from '../../geometry/Angles.js';


test(`degreeArc`, () => {
  // From zero CW
  expect(degreeArc(0, 90, true)).toBe(270);
  expect(degreeArc(0, 180, true)).toBe(180);
  expect(degreeArc(0, 270, true)).toBe(90);
  expect(degreeArc(0, 360, true)).toBe(0);

  // From zero CCW
  expect(degreeArc(0, 90, false)).toBe(90);
  expect(degreeArc(0, 180, false)).toBe(180);
  expect(degreeArc(0, 270, false)).toBe(270);
  expect(degreeArc(0, 360, false)).toBe(0);

  // Cross over pre zero
  expect(degreeArc(45, 315, true)).toBe(90);
  expect(degreeArc(45, 225, true)).toBe(180);
  expect(degreeArc(45, 135, true)).toBe(270);
  expect(degreeArc(45, 45, true)).toBe(0);

  // Cross over post zero
  expect(degreeArc(315, 315, false)).toBe(0);
  expect(degreeArc(315, 225, false)).toBe(270);
  expect(degreeArc(315, 135, false)).toBe(180);
  expect(degreeArc(315, 45, false)).toBe(90);

});

test(`radiansSum`, () => {
  expect(radiansSum(3.14, 1.57, false)).toBe(1.57);


  // From zero CCW
  expect(degreesSum(0, 90, false)).toBe(270);
  expect(degreesSum(0, 180, false)).toBe(180);
  expect(degreesSum(0, 270, false)).toBe(90);
  expect(degreesSum(0, 360, false)).toBe(0);

  // From zero CW
  expect(degreesSum(0, 90, true)).toBe(90);
  expect(degreesSum(0, 180, true)).toBe(180);
  expect(degreesSum(0, 270, true)).toBe(270);
  expect(degreesSum(0, 360, true)).toBe(0);

  // Pre zero CCW
  expect(degreesSum(45, 45, false)).toBe(0);
  expect(degreesSum(45, 90, false)).toBe(315);
  expect(degreesSum(45, 180, false)).toBe(225);
  expect(degreesSum(45, 270, false)).toBe(135);
  expect(degreesSum(45, 360, false)).toBe(45);

  // Post zero CW
  expect(degreesSum(315, 45, true)).toBe(0);
  expect(degreesSum(315, 90, true)).toBe(45);
  expect(Math.ceil(degreesSum(315, 180, true))).toBe(135);
  expect(Math.floor(degreesSum(315, 270, true))).toBe(225);
  expect(Math.ceil(degreesSum(315, 360, true))).toBe(315);


});

test(`degreeToRadian`, () => {
  expect(degreeToRadian(30).toPrecision(4)).toBe('0.5236');
  expect(degreeToRadian(45).toPrecision(4)).toBe('0.7854');
  expect(degreeToRadian(60).toPrecision(4)).toBe('1.047');
  expect(degreeToRadian(90).toPrecision(4)).toBe('1.571');
  expect(degreeToRadian(120).toPrecision(4)).toBe('2.094');
  expect(degreeToRadian(135).toPrecision(4)).toBe('2.356');
  expect(degreeToRadian(150).toPrecision(4)).toBe('2.618');
  expect(degreeToRadian(180).toPrecision(4)).toBe('3.142');
  expect(degreeToRadian(200).toPrecision(4)).toBe('3.491');
  expect(degreeToRadian(270).toPrecision(4)).toBe('4.712');
  expect(degreeToRadian(360).toPrecision(4)).toBe('6.283');
});

test(`radianToDegree`, () => {
  expect(radianToDegree(0)).toBe(0);
  expect(Math.round(radianToDegree(0.5235))).toBe(30);
  expect(Math.round(radianToDegree(0.7853))).toBe(45);
  expect(Math.round(radianToDegree(1.047))).toBe(60);
  expect(Math.round(radianToDegree(1.5707))).toBe(90);
  expect(Math.round(radianToDegree(2.0943))).toBe(120);
  expect(Math.round(radianToDegree(3.1415))).toBe(180);
  expect(Math.round(radianToDegree(4.7123))).toBe(270);
  expect(Math.round(radianToDegree(6.2831))).toBe(360);
});
