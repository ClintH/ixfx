import test from 'ava';

import * as Rects from '../../geometry/rect/index.js';
import { getRectPositionedParameter } from '../../geometry/rect/GetRectPositionedParameter.js';

test(`corners`, t => {
  const r1 = Rects.corners({ x: 10, y: 10, width: 20, height: 5 });
  const r2 = Rects.corners({ width: 20, height: 5 }, { x: 10, y: 10 });
  t.deepEqual(r1, r2);
  t.deepEqual(r1, [
    // ne, nw, sw, se
    { x: 10, y: 10 }, { x: 30, y: 10 }, { x: 30, y: 15 }, { x: 10, y: 15 }
  ])
});

test(`getRectPositionedParameter`, t => {

  // x,y,w,h
  const r1 = getRectPositionedParameter(1, 2, 3, 4);
  t.deepEqual(r1, { x: 1, y: 2, width: 3, height: 4 });

  // Point,w,h
  const r2 = getRectPositionedParameter({ x: 1, y: 2 }, 3, 4);
  t.deepEqual(r2, { x: 1, y: 2, width: 3, height: 4 });

  // Point,Rect
  const r3 = getRectPositionedParameter({ x: 1, y: 2 }, { width: 3, height: 4 });
  t.deepEqual(r3, { x: 1, y: 2, width: 3, height: 4 });

  // RectPositioned
  const r4 = getRectPositionedParameter({ x: 1, y: 2, width: 3, height: 4 });
  t.deepEqual(r4, { x: 1, y: 2, width: 3, height: 4 });

  // x,y,Rect
  const r5 = getRectPositionedParameter(1, 2, { width: 3, height: 4 });
  t.deepEqual(r5, { x: 1, y: 2, width: 3, height: 4 });

  // Rect,Point
  const r6 = getRectPositionedParameter({ width: 3, height: 4 }, { x: 1, y: 2 });
  t.deepEqual(r6, { x: 1, y: 2, width: 3, height: 4 });


})
test(`cardinal`, t => {

  const r = {
    x: 10,
    y: 20,
    width: 50,
    height: 200
  };

  t.like(Rects.cardinal(r, `nw`), {
    x: 10,
    y: 20
  });
  t.like(Rects.cardinal(r, `ne`), {
    x: 60,
    y: 20
  });
  t.like(Rects.cardinal(r, `n`), {
    x: 35,
    y: 20
  });
  t.like(Rects.cardinal(r, `center`), {
    x: 35,
    y: 120
  });
  t.like(Rects.cardinal(r, `w`), {
    x: 10,
    y: 120
  });
  t.like(Rects.cardinal(r, `e`), {
    x: 60,
    y: 120
  });
  t.like(Rects.cardinal(r, `s`), {
    x: 35,
    y: 220
  });
  t.like(Rects.cardinal(r, `sw`), {
    x: 10,
    y: 220
  });
  t.like(Rects.cardinal(r, `se`), {
    x: 60,
    y: 220
  });

  t.pass();
});