import test from 'ava';

import * as Shape from '../../geometry/shape/index.js';
import { Circles, Rects } from 'src/geometry/index.js';

test(`random-point`, t => {
  // @ts-expect-error
  t.throws(Shape.randomPoint({ x: 10, y: 20 }));

  const shape1 = { x: 10, y: 10, radius: 10 };
  const r1 = Shape.randomPoint(shape1);
  t.true(Shape.isIntersecting(shape1, r1));

  const shape2 = { x: 10, y: 10, width: 5, height: 5 };
  const r2 = Shape.randomPoint(shape2);
  t.true(Shape.isIntersecting(shape2, r2));
});

test(`center`, t => {
  const shape1 = { x: 10, y: 10, radius: 10 };
  const r1 = Shape.center(shape1);
  t.deepEqual(Circles.center(shape1), r1);

  const shape2 = { x: 10, y: 10, width: 5, height: 5 };
  const r2 = Shape.center(shape2);
  t.deepEqual(Rects.center(shape2), r2);

});

test(`corners`, t => {

  // Rectangle -> Point
  t.true(Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 100, y: 100 }));
  t.true(Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 101, y: 101 }));
  t.false(Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 99, y: 99 }));

  // Rectangle -> Circle
  t.true(Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 100, y: 100, radius: 5 }));
  t.true(Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 101, y: 101, radius: 5 }));
  t.true(Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 99, y: 99, radius: 5 }));
  t.false(Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 90, y: 90, radius: 5 }));

  // Circle -> Point
  t.true(Shape.isIntersecting({ x: 100, y: 100, radius: 5 }, { x: 100, y: 100 }));
  t.true(Shape.isIntersecting({ x: 100, y: 100, radius: 5 }, { x: 101, y: 101 }));
  t.true(Shape.isIntersecting({ x: 100, y: 100, radius: 5 }, { x: 99, y: 99 }));
  t.false(Shape.isIntersecting({ x: 100, y: 100, radius: 5 }, { x: 90, y: 90 }));

  // @ts-expect-error
  t.throws(() => Shape.isIntersecting(null, null));
  // @ts-expect-error
  t.throws(() => Shape.isIntersecting({ width: 10, height: 20 }, { x: 10, y: 20 }));

});
