import test from 'ava';

import * as Rects from '../../geometry/rect/index.js';
import { getRectPositionedParameter } from '../../geometry/rect/GetRectPositionedParameter.js';

test(`encompass`, t => {
  t.deepEqual(Rects.encompass({ x: 0, y: 0, width: 0, height: 0 }, { x: 0, y: 0 }), { x: 0, y: 0, width: 0, height: 0 });

  t.deepEqual(Rects.encompass({ x: 0, y: 0, width: 0, height: 0 }, { x: 10, y: 0 }), { x: 0, y: 0, width: 10, height: 0 });
  t.deepEqual(Rects.encompass({ x: 0, y: 0, width: 0, height: 0 }, { x: 0, y: 10 }), { x: 0, y: 0, width: 0, height: 10 });
  t.deepEqual(Rects.encompass({ x: 0, y: 0, width: 0, height: 0 }, { x: -10, y: 0 }), { x: -10, y: 0, width: 10, height: 0 });
  t.deepEqual(Rects.encompass({ x: 0, y: 0, width: 0, height: 0 }, { x: 0, y: -10 }), { x: 0, y: -10, width: 0, height: 10 });

  t.deepEqual(Rects.encompass({ x: 10, y: 10, width: 10, height: 10 }, { x: 10, y: 10 }), { x: 10, y: 10, width: 10, height: 10 });
  t.deepEqual(Rects.encompass({ x: 10, y: 10, width: 10, height: 10 }, { x: 0, y: 0 }), { x: 0, y: 0, width: 20, height: 20 });

  t.deepEqual(Rects.encompass({ x: 10, y: 10, width: 10, height: 10 }, { x: 0, y: 0 }, { x: -10, y: -10 }), { x: -10, y: -10, width: 30, height: 30 });



});

test(`subtract`, t => {
  // Rectangle by w/h
  t.deepEqual(Rects.subtract({ width: 1, height: 8 }, 2, 4), { width: -1, height: 4 });

  // Rectangle by rectangle
  t.deepEqual(Rects.subtract({ width: 1, height: 8 }, { width: 2, height: 4 }), { width: -1, height: 4 });

  // Positioned rectangle by w/h
  t.deepEqual(Rects.subtract({ x: 100, y: 400, width: 1, height: 8 }, 2, 4), { x: 98, y: 396, width: -1, height: 4 });
  // Positioned rectangle by rect
  t.deepEqual(Rects.subtract({ x: 100, y: 400, width: 1, height: 8 }, { width: 2, height: 4 }), { x: 98, y: 396, width: -1, height: 4 });

  // x,y values of second parameter are ignored
  // @ts-ignore 
  t.deepEqual(Rects.subtract({ x: 100, y: 400, width: 1, height: 8 }, { x: 2000, y: 4000, width: 2, height: 4 }), { x: 98, y: 396, width: -1, height: 4 });

  // No height
  // @ts-ignore
  t.throws(() => Rects.subtract({ width: 1, height: 1 }, 10));
  // No second param
  // @ts-ignore
  t.throws(() => Rects.subtract({ width: 1, height: 1 }));

  // Second param not rect
  // @ts-ignore
  t.throws(() => Rects.subtract({ width: 1, height: 1 }, { a: 10, b: 20 }));

  t.deepEqual(Rects.subtractOffset({ width: 3, height: 4 }, { x: 100, y: 200, width: 300, height: 400 }), { x: -100, y: -200, width: -297, height: -396 });
  t.deepEqual(Rects.subtractOffset({ x: 1, y: 2, width: 3, height: 4 }, { width: 300, height: 400 }), { x: 1, y: 2, width: -297, height: -396 });
  t.deepEqual(Rects.subtractOffset({ x: 1, y: 2, width: 3, height: 4 }, { x: 100, y: 200, width: 300, height: 400 }), { x: -99, y: -198, width: -297, height: -396 });
});

test(`sum`, t => {
  // Rectangle by w/h
  t.deepEqual(Rects.sum({ width: 1, height: 8 }, 2, 4), { width: 3, height: 12 });

  // Rectangle by rectangle
  t.deepEqual(Rects.sum({ width: 1, height: 8 }, { width: 2, height: 4 }), { width: 3, height: 12 });

  // Positioned rectangle by w/h
  t.deepEqual(Rects.sum({ x: 100, y: 400, width: 1, height: 8 }, 2, 4), { x: 102, y: 404, width: 3, height: 12 });
  // Positioned rectangle by rect
  t.deepEqual(Rects.sum({ x: 100, y: 400, width: 1, height: 8 }, { width: 2, height: 4 }), { x: 102, y: 404, width: 3, height: 12 });

  // x,y values of second parameter are ignored
  // @ts-ignore 
  t.deepEqual(Rects.sum({ x: 100, y: 400, width: 1, height: 8 }, { x: 2000, y: 4000, width: 2, height: 4 }), { x: 102, y: 404, width: 3, height: 12 });

  // No height
  // @ts-ignore
  t.throws(() => Rects.sum({ width: 1, height: 1 }, 10));
  // No second param
  // @ts-ignore
  t.throws(() => Rects.sum({ width: 1, height: 1 }));

  // Second param not rect
  // @ts-ignore
  t.throws(() => Rects.sum({ width: 1, height: 1 }, { a: 10, b: 20 }));

  t.deepEqual(Rects.sumOffset({ width: 3, height: 4 }, { x: 100, y: 200, width: 300, height: 400 }), { x: 100, y: 200, width: 303, height: 404 });
  t.deepEqual(Rects.sumOffset({ x: 1, y: 2, width: 3, height: 4 }, { width: 300, height: 400 }), { x: 1, y: 2, width: 303, height: 404 });
  t.deepEqual(Rects.sumOffset({ x: 1, y: 2, width: 3, height: 4 }, { x: 100, y: 200, width: 300, height: 400 }), { x: 101, y: 202, width: 303, height: 404 });
});

test(`divide`, t => {
  // Rectangle by w/h
  t.deepEqual(Rects.divide({ width: 1, height: 8 }, 2, 4), { width: 0.5, height: 2 });

  // Rectangle by rectangle
  t.deepEqual(Rects.divide({ width: 1, height: 8 }, { width: 2, height: 4 }), { width: 0.5, height: 2 });

  // Positioned rectangle by w/h
  t.deepEqual(Rects.divide({ x: 100, y: 400, width: 1, height: 8 }, 2, 4), { x: 50, y: 100, width: 0.5, height: 2 });
  // Positioned rectangle by rect
  t.deepEqual(Rects.divide({ x: 100, y: 400, width: 1, height: 8 }, { width: 2, height: 4 }), { x: 50, y: 100, width: 0.5, height: 2 });

  // x,y values of second parameter are ignored
  // @ts-ignore 
  t.deepEqual(Rects.divide({ x: 100, y: 400, width: 1, height: 8 }, { x: 2000, y: 4000, width: 2, height: 4 }), { x: 50, y: 100, width: 0.5, height: 2 });

  // No height
  // @ts-ignore
  t.throws(() => Rects.divide({ width: 1, height: 1 }, 10));
  // No second param
  // @ts-ignore
  t.throws(() => Rects.divide({ width: 1, height: 1 }));

  // Second param not rect
  // @ts-ignore
  t.throws(() => Rects.divide({ width: 1, height: 1 }, { a: 10, b: 20 }));

  t.deepEqual(Rects.divideScalar({ width: 2, height: 4 }, 2), { width: 1, height: 2 });
  t.deepEqual(Rects.divideScalar({ x: 10, y: 20, width: 2, height: 4 }, 2), { x: 5, y: 10, width: 1, height: 2 });
  t.deepEqual(Rects.divideDim({ x: 10, y: 20, width: 2, height: 4 }, 2), { x: 10, y: 20, width: 1, height: 2 });
});

test(`multiply`, t => {
  // Rectangle by w/h
  t.deepEqual(Rects.multiply({ width: 1, height: 2 }, 2, 4), { width: 2, height: 8 });

  // Rectangle by rectangle
  t.deepEqual(Rects.multiply({ width: 1, height: 2 }, { width: 2, height: 4 }), { width: 2, height: 8 });

  // Positioned rectangle by w/h
  t.deepEqual(Rects.multiply({ x: 100, y: 200, width: 1, height: 2 }, 2, 4), { x: 200, y: 800, width: 2, height: 8 });
  // Positioned rectangle by rect
  t.deepEqual(Rects.multiply({ x: 100, y: 200, width: 1, height: 2 }, { width: 2, height: 4 }), { x: 200, y: 800, width: 2, height: 8 });

  // x,y values of second parameter are ignored
  // @ts-ignore 
  t.deepEqual(Rects.multiply({ x: 100, y: 200, width: 1, height: 2 }, { x: 2000, y: 4000, width: 2, height: 4 }), { x: 200, y: 800, width: 2, height: 8 });

  // No height
  // @ts-ignore
  t.throws(() => Rects.multiply({ width: 1, height: 1 }, 10));
  // No second param
  // @ts-ignore
  t.throws(() => Rects.multiply({ width: 1, height: 1 }));

  // Second param not rect
  // @ts-ignore
  t.throws(() => Rects.multiply({ width: 1, height: 1 }, { a: 10, b: 20 }));

  t.deepEqual(Rects.multiplyScalar({ width: 2, height: 4 }, 2), { width: 4, height: 8 });
  t.deepEqual(Rects.multiplyScalar({ x: 10, y: 20, width: 2, height: 4 }, 2), { x: 20, y: 40, width: 4, height: 8 });
  t.deepEqual(Rects.multiplyDim({ x: 10, y: 20, width: 2, height: 4 }, 2), { x: 10, y: 20, width: 4, height: 8 });
});

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