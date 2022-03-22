/* eslint-disable */
import * as Lines from '../../geometry/Line.js';

test(`joinPointsToLines`, () => {
  const ptA = {x:0, y:0};
  const ptB = {x:1, y:1};
  const ptC = {x:2, y:2};

  const lA = Lines.joinPointsToLines(ptA,ptB);
  expect(lA.length).toEqual(1);
  expect (lA[0].a).toEqual(ptA);
  expect (lA[0].b).toEqual(ptB);

  const lB = Lines.joinPointsToLines(ptA, ptB, ptC);
  expect(lB.length).toEqual(2);
  expect (lB[0].a).toEqual(ptA);
  expect (lB[0].b).toEqual(ptB);
  expect (lB[1].a).toEqual(ptB);
  expect (lB[1].b).toEqual(ptC);

});