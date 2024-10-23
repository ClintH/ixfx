import test from 'ava';
import { degreeToRadian, radianToDegree, degreeArc, degreesSum, radiansSum } from '../../geometry/Angles.js';


test(`degreeArc`, t => {
  // From zero CW
  t.is(degreeArc(0, 90, true), 270);
  t.is(degreeArc(0, 180, true), 180);
  t.is(degreeArc(0, 270, true), 90);
  t.is(degreeArc(0, 360, true), 0);

  // From zero CCW
  t.is(degreeArc(0, 90, false), 90);
  t.is(degreeArc(0, 180, false), 180);
  t.is(degreeArc(0, 270, false), 270);
  t.is(degreeArc(0, 360, false), 0);

  // Cross over pre zero
  t.is(degreeArc(45, 315, true), 90);
  t.is(degreeArc(45, 225, true), 180);
  t.is(degreeArc(45, 135, true), 270);
  t.is(degreeArc(45, 45, true), 0);

  // Cross over post zero
  t.is(degreeArc(315, 315, false), 0);
  t.is(degreeArc(315, 225, false), 270);
  t.is(degreeArc(315, 135, false), 180);
  t.is(degreeArc(315, 45, false), 90);

});

test(`radiansSum`, t => {
  t.is(radiansSum(3.14, 1.57, false), 1.57);


  // From zero CCW
  t.is(degreesSum(0, 90, false), 270);
  t.is(degreesSum(0, 180, false), 180);
  t.is(degreesSum(0, 270, false), 90);
  t.is(degreesSum(0, 360, false), 0);

  // From zero CW
  t.is(degreesSum(0, 90, true), 90);
  t.is(degreesSum(0, 180, true), 180);
  t.is(degreesSum(0, 270, true), 270);
  t.is(degreesSum(0, 360, true), 0);

  // Pre zero CCW
  t.is(degreesSum(45, 45, false), 0);
  t.is(degreesSum(45, 90, false), 315);
  t.is(degreesSum(45, 180, false), 225);
  t.is(degreesSum(45, 270, false), 135);
  t.is(degreesSum(45, 360, false), 45);

  // Post zero CW
  t.is(degreesSum(315, 45, true), 0);
  t.is(degreesSum(315, 90, true), 45);
  t.is(Math.ceil(degreesSum(315, 180, true)), 135);
  t.is(Math.floor(degreesSum(315, 270, true)), 225);
  t.is(Math.ceil(degreesSum(315, 360, true)), 315);


});

test(`degreeToRadian`, (t) => {
  t.is(degreeToRadian(30).toPrecision(4), '0.5236');
  t.is(degreeToRadian(45).toPrecision(4), '0.7854');
  t.is(degreeToRadian(60).toPrecision(4), '1.047');
  t.is(degreeToRadian(90).toPrecision(4), '1.571');
  t.is(degreeToRadian(120).toPrecision(4), '2.094');
  t.is(degreeToRadian(135).toPrecision(4), '2.356');
  t.is(degreeToRadian(150).toPrecision(4), '2.618');
  t.is(degreeToRadian(180).toPrecision(4), '3.142');
  t.is(degreeToRadian(200).toPrecision(4), '3.491');
  t.is(degreeToRadian(270).toPrecision(4), '4.712');
  t.is(degreeToRadian(360).toPrecision(4), '6.283');
});

test(`radianToDegree`, (t) => {
  t.is(radianToDegree(0), 0);
  t.is(Math.round(radianToDegree(0.5235)), 30);
  t.is(Math.round(radianToDegree(0.7853)), 45);
  t.is(Math.round(radianToDegree(1.047)), 60);
  t.is(Math.round(radianToDegree(1.5707)), 90);
  t.is(Math.round(radianToDegree(2.0943)), 120);
  t.is(Math.round(radianToDegree(3.1415)), 180);
  t.is(Math.round(radianToDegree(4.7123)), 270);
  t.is(Math.round(radianToDegree(6.2831)), 360);
});
