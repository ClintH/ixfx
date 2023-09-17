import test from 'ava';
/* eslint-disable */
import * as Lines from '../../geometry/Line.js';

test('basic', (t) => {
  t.deepEqual(Lines.Empty, { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } });
  t.true(Lines.isEmpty(Lines.Empty));
  t.deepEqual(Lines.Placeholder, { a: { x: Number.NaN, y: Number.NaN }, b: { x: Number.NaN, y: Number.NaN } });
  t.true(Lines.isPlaceholder(Lines.Placeholder));

  const l = {
    a: { x: 20, y: 20 },
    b: { x: 10, y: 10 }
  };
  const ll = {
    a: { x: 21, y: 21 },
    b: { x: 11, y: 11 }
  }

  t.deepEqual(Lines.fromNumbers(20, 30, 40, 50), {
    a: { x: 20, y: 30 }, b: { x: 40, y: 50 }
  });
  t.deepEqual(Lines.fromFlatArray([ 20, 30, 40, 50 ]), {
    a: { x: 20, y: 30 }, b: { x: 40, y: 50 }
  });

  const a = { x: 1, y: 2 };
  const b = { x: 3, y: 4 };
  t.deepEqual(Lines.fromPoints(a, b), {
    a, b
  });
  const path = Lines.fromPointsToPath(a, b);
  t.deepEqual(path.a, a);
  t.deepEqual(path.b, b);
  t.deepEqual(path.kind, 'line');

  const pointsParam = Lines.getPointParameter(a, b);
  t.deepEqual(pointsParam[ 0 ], a);
  t.deepEqual(pointsParam[ 1 ], b);

  const pointsParam2 = Lines.getPointParameter(l);
  t.deepEqual(pointsParam2[ 0 ], l.a);
  t.deepEqual(pointsParam2[ 1 ], l.b);

  t.true(Lines.isEqual(l, l));
  t.false(Lines.isEqual(l, ll));

  t.deepEqual([ ...Lines.asPoints([ l, ll ]) ], [ l.a, l.b, ll.a, ll.b ]);


  // Divide
  t.deepEqual(Lines.divide(l, { x: 2, y: 10 }), {
    a: { x: 10, y: 2 }, b: { x: 5, y: 1 }
  });
  t.deepEqual(Lines.divide(l, { x: 1, y: 1 }), l);
  t.deepEqual(Lines.divide(l, { x: 0, y: 10 }), {
    a: { x: Number.POSITIVE_INFINITY, y: 2 }, b: { x: Number.POSITIVE_INFINITY, y: 1 }
  });
  t.deepEqual(Lines.divide(l, { x: 2, y: 0 }), {
    a: { x: 10, y: Number.POSITIVE_INFINITY }, b: { x: 5, y: Number.POSITIVE_INFINITY }
  });

  // Multiply
  t.deepEqual(Lines.multiply(l, { x: 2, y: 10 }), {
    a: { x: 40, y: 200 }, b: { x: 20, y: 100 }
  });
  t.deepEqual(Lines.multiply(l, { x: 1, y: 1 }), l);
  t.deepEqual(Lines.multiply(l, { x: 2, y: 0 }), {
    a: { x: 40, y: 0 }, b: { x: 20, y: 0 }
  });
  t.deepEqual(Lines.multiply(l, { x: 0, y: 10 }), {
    a: { x: 0, y: 200 }, b: { x: 0, y: 100 }
  });


});

test(`joinPointsToLines`, (t) => {
  const ptA = { x: 0, y: 0 };
  const ptB = { x: 1, y: 1 };
  const ptC = { x: 2, y: 2 };

  const lA = Lines.joinPointsToLines(ptA, ptB);
  t.is(lA.length, 1);
  t.deepEqual(lA[ 0 ].a, ptA);
  t.deepEqual(lA[ 0 ].b, ptB);

  const lB = Lines.joinPointsToLines(ptA, ptB, ptC);
  t.deepEqual(lB.length, 2);
  t.deepEqual(lB[ 0 ].a, ptA);
  t.deepEqual(lB[ 0 ].b, ptB);
  t.deepEqual(lB[ 1 ].a, ptB);
  t.deepEqual(lB[ 1 ].b, ptC);

});