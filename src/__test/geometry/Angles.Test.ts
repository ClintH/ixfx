import test from 'ava';
import { degreeToRadian, radianToDegree } from '../../geometry/index.js';
/* eslint-disable */

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
