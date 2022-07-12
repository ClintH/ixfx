import * as Teq from '../../geometry/TriangleEquilateral';
import * as Tra from '../../geometry/TriangleRight.js';

test(`equilateral`, () => {
  const t:Teq.TriangleEquilateral = {
    length: 10
  };

  expect(Teq.area(t)).toBeCloseTo(43.301, 3);
  expect(Teq.perimeter(t)).toBe(30);
  expect(Teq.height(t)).toBe(8.660254037844386);
  expect(Teq.circumcircle(t).radius).toBe(5.773502691896257);
  expect(Teq.incircle(t).radius).toBe(2.8867513459481287);
});

test(`rightAngle`, () => {
  const t = { opposite: 10, adjacent: 15 };

  expect(Tra.height(t)).toBeCloseTo(8.321, 3);
  expect(Tra.perimeter(t)).toBeCloseTo(43.028, 3);
  expect(Tra.area(t)).toBeCloseTo(75, 3);
  expect(Tra.angleAtPointA(t)).toBeCloseTo(0.588, 3);
  expect(Tra.angleAtPointB(t)).toBeCloseTo(0.9827, 3);
  expect(Tra.circmcircle(t).radius).toBeCloseTo(9.013878, 4);
  expect(Tra.incircle(t).radius).toBeCloseTo(3.486122, 4);

  const hypoSegments = Tra.hypotenuseSegments(t);
  expect(hypoSegments[0]).toBeCloseTo(5.547002, 4);
  expect(hypoSegments[1]).toBeCloseTo(12.480754, 4);


  const medians = Tra.medians(t);
  expect(medians[0]).toBeCloseTo(15.811388, 4);
  expect(medians[1]).toBeCloseTo(12.5, 1);
  expect(medians[2]).toBeCloseTo(9.013878, 4);


  // expect(Tra.oppositeFromAdjacent(1, 10)).toBeCloseTo(15.57408, 5);
  // expect(Tra.oppositeFromHypotenuse(1, 10)).toBeCloseTo(8.41471, 5);

  // expect(Tra.adjacentFromHypotenuse(1, 10)).toBeCloseTo(5.40302, 5);
  // expect(Tra.adjacentFromOpposite(1, 10)).toBeCloseTo(6.42093, 5);

  // expect(Tra.hypotenuseFromOpposite(1, 10)).toBeCloseTo(11.88395, 5);
  // expect(Tra.hypotenuseFromAdjacent(1, 10)).toBeCloseTo(18.50816, 5);
});