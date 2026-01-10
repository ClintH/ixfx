import { test, expect } from 'vitest';
import * as Lines from '../src/line/index.js';
import { Empty, Placeholder, asPoints, isEmpty, isPlaceholder } from '../src/line/index.js';

test('basic', () => {
  expect(Empty).toEqual({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } });
  expect(isEmpty(Empty)).toBe(true);
  expect(Placeholder).toEqual(
    { a: { x: Number.NaN, y: Number.NaN }, b: { x: Number.NaN, y: Number.NaN } }
  );
  expect(isPlaceholder(Lines.Placeholder)).toBe(true);

  const l = {
    a: { x: 20, y: 20 },
    b: { x: 10, y: 10 }
  };
  const ll = {
    a: { x: 21, y: 21 },
    b: { x: 11, y: 11 }
  }

  expect(Lines.fromNumbers(20, 30, 40, 50)).toEqual({
    a: { x: 20, y: 30 }, b: { x: 40, y: 50 }
  });
  expect(Lines.fromFlatArray([ 20, 30, 40, 50 ])).toEqual({
    a: { x: 20, y: 30 }, b: { x: 40, y: 50 }
  });

  const a = { x: 1, y: 2 };
  const b = { x: 3, y: 4 };
  expect(Lines.fromPoints(a, b)).toEqual({
    a, b
  });
  const path = Lines.fromPointsToPath(a, b);
  expect(path.a).toEqual(a);
  expect(path.b).toEqual(b);
  expect(path.kind).toEqual('line');

  const pointsParam = Lines.getPointParameter(a, b);
  expect(pointsParam[ 0 ]).toEqual(a);
  expect(pointsParam[ 1 ]).toEqual(b);

  const pointsParam2 = Lines.getPointParameter(l);
  expect(pointsParam2[ 0 ]).toEqual(l.a);
  expect(pointsParam2[ 1 ]).toEqual(l.b);

  expect(Lines.isEqual(l, l)).toBe(true);
  expect(Lines.isEqual(l, ll)).toBe(false);

  expect([ ...asPoints([ l, ll ]) ]).toEqual([ l.a, l.b, ll.a, ll.b ]);


  // Divide
  expect(Lines.divide(l, { x: 2, y: 10 })).toEqual({
    a: { x: 10, y: 2 }, b: { x: 5, y: 1 }
  });
  expect(Lines.divide(l, { x: 1, y: 1 })).toEqual(l);
  expect(() => Lines.divide(l, { x: 0, y: 10 })).toThrow();
  expect(() => Lines.divide(l, { x: 2, y: 0 })).toThrow();

  // Multiply
  expect(Lines.multiply(l, { x: 2, y: 10 })).toEqual({
    a: { x: 40, y: 200 }, b: { x: 20, y: 100 }
  });
  expect(Lines.multiply(l, { x: 1, y: 1 })).toEqual(l);
  expect(Lines.multiply(l, { x: 2, y: 0 })).toEqual({
    a: { x: 40, y: 0 }, b: { x: 20, y: 0 }
  });
  expect(Lines.multiply(l, { x: 0, y: 10 })).toEqual({
    a: { x: 0, y: 200 }, b: { x: 0, y: 100 }
  });


});

test(`joinPointsToLines`, () => {
  const ptA = { x: 0, y: 0 };
  const ptB = { x: 1, y: 1 };
  const ptC = { x: 2, y: 2 };

  const lA = Lines.joinPointsToLines(ptA, ptB);
  expect(lA.length).toBe(1);
  expect(lA[ 0 ].a).toEqual(ptA);
  expect(lA[ 0 ].b).toEqual(ptB);

  const lB = Lines.joinPointsToLines(ptA, ptB, ptC);
  expect(lB.length).toEqual(2);
  expect(lB[ 0 ].a).toEqual(ptA);
  expect(lB[ 0 ].b).toEqual(ptB);
  expect(lB[ 1 ].a).toEqual(ptB);
  expect(lB[ 1 ].b).toEqual(ptC);

});