import test from 'ava';
import * as Teq from '../../geometry/triangle/Equilateral.js';
import * as Tra from '../../geometry/triangle/Right.js';
import * as Tis from '../../geometry/triangle/Isosceles.js';
import { degreeToRadian } from '../../geometry/Angles.js';
import { closeTo } from '../Include.js';

test(`equilateral`, (tst) => {
  const t: Teq.TriangleEquilateral = {
    length: 10,
  };

  closeTo(tst, Teq.area(t), 43.301, 3);
  closeTo(tst, Teq.perimeter(t), 30);
  closeTo(tst, Teq.height(t), 8.660254037844386);
  closeTo(tst, Teq.circumcircle(t).radius, 5.773502691896257);
  closeTo(tst, Teq.incircle(t).radius, 2.8867513459481287);
});

test(`isosceles`, (tst) => {
  // https://rechneronline.de/pi/isosceles-triangle.php
  const t = { legs: 20, base: 10 };

  closeTo(tst, Tis.height(t), 19.365, 3);
  closeTo(tst, Tis.perimeter(t), 50, 3);
  closeTo(tst, Tis.area(t), 96.825, 3);
  closeTo(tst, Tis.apexAngle(t), degreeToRadian(28.955), 3);
  closeTo(tst, Tis.circumcircle(t).radius, 10.328, 4);
  closeTo(tst, Tis.incircle(t).radius, 3.873, 4);

  const medians = Tis.medians(t);
  closeTo(tst, medians[ 0 ], 12.2474, 3);
  closeTo(tst, medians[ 1 ], 12.2474, 3);
  closeTo(tst, medians[ 2 ], 19.365, 3);
});

test(`rightAngle`, (tst) => {
  // https://rechneronline.de/pi/right-triangle.php
  const t = { opposite: 10, adjacent: 15 };

  closeTo(tst, Tra.height(t), 8.321, 3);
  closeTo(tst, Tra.perimeter(t), 43.028, 3);
  closeTo(tst, Tra.area(t), 75, 3);
  closeTo(tst, Tra.angleAtPointA(t), 0.588, 3);
  closeTo(tst, Tra.angleAtPointB(t), 0.9827, 3);
  closeTo(tst, Tra.circumcircle(t).radius, 9.013878, 4);
  closeTo(tst, Tra.incircle(t).radius, 3.486122, 4);

  const hypoSegments = Tra.hypotenuseSegments(t);
  closeTo(tst, hypoSegments[ 0 ], 5.547002, 4);
  closeTo(tst, hypoSegments[ 1 ], 12.480754, 4);

  const medians = Tra.medians(t);
  closeTo(tst, medians[ 0 ], 15.811388, 4);
  closeTo(tst, medians[ 1 ], 12.5, 1);
  closeTo(tst, medians[ 2 ], 9.013878, 4);

  closeTo(tst, Tra.oppositeFromAdjacent(1, 10), 15.57408, 5);
  closeTo(tst, Tra.oppositeFromHypotenuse(1, 10), 8.41471, 5);

  closeTo(tst, Tra.adjacentFromHypotenuse(1, 10), 5.40302, 5);
  closeTo(tst, Tra.adjacentFromOpposite(1, 10), 6.42093, 5);

  closeTo(tst, Tra.hypotenuseFromOpposite(1, 10), 11.88395, 5);
  closeTo(tst, Tra.hypotenuseFromAdjacent(1, 10), 18.50816, 5);
});
