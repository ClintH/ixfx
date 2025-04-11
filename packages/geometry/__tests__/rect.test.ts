import { test, expect, assert } from 'vitest';

import * as Rects from '../src/rect/index.js';
import { getRectPositionedParameter } from '../src/rect/get-rect-positionedparameter.js';

test(`encompass`, () => {
  expect(Rects.encompass({ x: 0, y: 0, width: 0, height: 0 }, { x: 0, y: 0 })).toEqual({ x: 0, y: 0, width: 0, height: 0 });

  expect(Rects.encompass({ x: 0, y: 0, width: 0, height: 0 }, { x: 10, y: 0 })).toEqual({ x: 0, y: 0, width: 10, height: 0 });
  expect(Rects.encompass({ x: 0, y: 0, width: 0, height: 0 }, { x: 0, y: 10 })).toEqual({ x: 0, y: 0, width: 0, height: 10 });
  expect(Rects.encompass({ x: 0, y: 0, width: 0, height: 0 }, { x: -10, y: 0 })).toEqual({ x: -10, y: 0, width: 10, height: 0 });
  expect(Rects.encompass({ x: 0, y: 0, width: 0, height: 0 }, { x: 0, y: -10 })).toEqual({ x: 0, y: -10, width: 0, height: 10 });

  expect(Rects.encompass({ x: 10, y: 10, width: 10, height: 10 }, { x: 10, y: 10 })).toEqual({ x: 10, y: 10, width: 10, height: 10 });
  expect(Rects.encompass({ x: 10, y: 10, width: 10, height: 10 }, { x: 0, y: 0 })).toEqual({ x: 0, y: 0, width: 20, height: 20 });

  expect(
    Rects.encompass({ x: 10, y: 10, width: 10, height: 10 }, { x: 0, y: 0 }, { x: -10, y: -10 })
  ).toEqual({ x: -10, y: -10, width: 30, height: 30 });



});

test(`subtract`, () => {
  // Rectangle by w/h
  expect(Rects.subtract({ width: 1, height: 8 }, 2, 4)).toEqual({ width: -1, height: 4 });

  // Rectangle by rectangle
  expect(Rects.subtract({ width: 1, height: 8 }, { width: 2, height: 4 })).toEqual({ width: -1, height: 4 });

  // Positioned rectangle by w/h
  expect(Rects.subtract({ x: 100, y: 400, width: 1, height: 8 }, 2, 4)).toEqual({ x: 98, y: 396, width: -1, height: 4 });
  // Positioned rectangle by rect
  expect(
    Rects.subtract({ x: 100, y: 400, width: 1, height: 8 }, { width: 2, height: 4 })
  ).toEqual({ x: 98, y: 396, width: -1, height: 4 });

  // x,y values of second parameter are ignored
  expect(
    Rects.subtract({ x: 100, y: 400, width: 1, height: 8 }, { x: 2000, y: 4000, width: 2, height: 4 })
  ).toEqual({ x: 98, y: 396, width: -1, height: 4 });

  // No height
  // @ts-ignore
  expect(() => Rects.subtract({ width: 1, height: 1 }, 10)).toThrow();
  // No second param
  // @ts-ignore
  expect(() => Rects.subtract({ width: 1, height: 1 })).toThrow();

  // Second param not rect
  // @ts-ignore
  expect(() => Rects.subtract({ width: 1, height: 1 }, { a: 10, b: 20 })).toThrow();

  expect(
    Rects.subtractOffset({ width: 3, height: 4 }, { x: 100, y: 200, width: 300, height: 400 })
  ).toEqual({ x: -100, y: -200, width: -297, height: -396 });
  expect(
    Rects.subtractOffset({ x: 1, y: 2, width: 3, height: 4 }, { width: 300, height: 400 })
  ).toEqual({ x: 1, y: 2, width: -297, height: -396 });
  expect(
    Rects.subtractOffset({ x: 1, y: 2, width: 3, height: 4 }, { x: 100, y: 200, width: 300, height: 400 })
  ).toEqual({ x: -99, y: -198, width: -297, height: -396 });
});

test(`sum`, () => {
  // Rectangle by w/h
  expect(Rects.sum({ width: 1, height: 8 }, 2, 4)).toEqual({ width: 3, height: 12 });

  // Rectangle by rectangle
  expect(Rects.sum({ width: 1, height: 8 }, { width: 2, height: 4 })).toEqual({ width: 3, height: 12 });

  // Positioned rectangle by w/h
  expect(Rects.sum({ x: 100, y: 400, width: 1, height: 8 }, 2, 4)).toEqual({ x: 102, y: 404, width: 3, height: 12 });
  // Positioned rectangle by rect
  expect(
    Rects.sum({ x: 100, y: 400, width: 1, height: 8 }, { width: 2, height: 4 })
  ).toEqual({ x: 102, y: 404, width: 3, height: 12 });

  // x,y values of second parameter are ignored
  expect(
    Rects.sum({ x: 100, y: 400, width: 1, height: 8 }, { x: 2000, y: 4000, width: 2, height: 4 })
  ).toEqual({ x: 102, y: 404, width: 3, height: 12 });

  // No height
  // @ts-ignore
  expect(() => Rects.sum({ width: 1, height: 1 }, 10)).toThrow();
  // No second param
  // @ts-ignore
  expect(() => Rects.sum({ width: 1, height: 1 })).toThrow();

  // Second param not rect
  // @ts-ignore
  expect(() => Rects.sum({ width: 1, height: 1 }, { a: 10, b: 20 })).toThrow();

  expect(
    Rects.sumOffset({ width: 3, height: 4 }, { x: 100, y: 200, width: 300, height: 400 })
  ).toEqual({ x: 100, y: 200, width: 303, height: 404 });
  expect(
    Rects.sumOffset({ x: 1, y: 2, width: 3, height: 4 }, { width: 300, height: 400 })
  ).toEqual({ x: 1, y: 2, width: 303, height: 404 });
  expect(
    Rects.sumOffset({ x: 1, y: 2, width: 3, height: 4 }, { x: 100, y: 200, width: 300, height: 400 })
  ).toEqual({ x: 101, y: 202, width: 303, height: 404 });
});

test(`divide`, () => {
  // Rectangle by w/h
  expect(Rects.divide({ width: 1, height: 8 }, 2, 4)).toEqual({ width: 0.5, height: 2 });

  // Rectangle by rectangle
  expect(Rects.divide({ width: 1, height: 8 }, { width: 2, height: 4 })).toEqual({ width: 0.5, height: 2 });

  // Positioned rectangle by w/h
  expect(Rects.divide({ x: 100, y: 400, width: 1, height: 8 }, 2, 4)).toEqual({ x: 50, y: 100, width: 0.5, height: 2 });
  // Positioned rectangle by rect
  expect(
    Rects.divide({ x: 100, y: 400, width: 1, height: 8 }, { width: 2, height: 4 })
  ).toEqual({ x: 50, y: 100, width: 0.5, height: 2 });

  // x,y values of second parameter are ignored
  // @ts-ignore 
  expect(
    Rects.divide({ x: 100, y: 400, width: 1, height: 8 }, { x: 2000, y: 4000, width: 2, height: 4 })
  ).toEqual({ x: 50, y: 100, width: 0.5, height: 2 });

  // No height
  // @ts-ignore
  expect(() => Rects.divide({ width: 1, height: 1 }, 10)).toThrow();
  // No second param
  // @ts-ignore
  expect(() => Rects.divide({ width: 1, height: 1 })).toThrow();

  // Second param not rect
  // @ts-ignore
  expect(() => Rects.divide({ width: 1, height: 1 }, { a: 10, b: 20 })).toThrow();

  expect(Rects.divideScalar({ width: 2, height: 4 }, 2)).toEqual({ width: 1, height: 2 });
  expect(Rects.divideScalar({ x: 10, y: 20, width: 2, height: 4 }, 2)).toEqual({ x: 5, y: 10, width: 1, height: 2 });
  expect(Rects.divideDim({ x: 10, y: 20, width: 2, height: 4 }, 2)).toEqual({ x: 10, y: 20, width: 1, height: 2 });
});

test(`multiply`, () => {
  // Rectangle by w/h
  expect(Rects.multiply({ width: 1, height: 2 }, 2, 4)).toEqual({ width: 2, height: 8 });

  // Rectangle by rectangle
  expect(Rects.multiply({ width: 1, height: 2 }, { width: 2, height: 4 })).toEqual({ width: 2, height: 8 });

  // Positioned rectangle by w/h
  expect(Rects.multiply({ x: 100, y: 200, width: 1, height: 2 }, 2, 4)).toEqual({ x: 200, y: 800, width: 2, height: 8 });
  // Positioned rectangle by rect
  expect(
    Rects.multiply({ x: 100, y: 200, width: 1, height: 2 }, { width: 2, height: 4 })
  ).toEqual({ x: 200, y: 800, width: 2, height: 8 });

  // x,y values of second parameter are ignored
  expect(
    Rects.multiply({ x: 100, y: 200, width: 1, height: 2 }, { x: 2000, y: 4000, width: 2, height: 4 })
  ).toEqual({ x: 200, y: 800, width: 2, height: 8 });

  // No height
  // @ts-ignore
  expect(() => Rects.multiply({ width: 1, height: 1 }, 10)).toThrow();
  // No second param
  // @ts-ignore
  expect(() => Rects.multiply({ width: 1, height: 1 })).toThrow();

  // Second param not rect
  // @ts-ignore
  expect(() => Rects.multiply({ width: 1, height: 1 }, { a: 10, b: 20 })).toThrow();

  expect(Rects.multiplyScalar({ width: 2, height: 4 }, 2)).toEqual({ width: 4, height: 8 });
  expect(Rects.multiplyScalar({ x: 10, y: 20, width: 2, height: 4 }, 2)).toEqual({ x: 20, y: 40, width: 4, height: 8 });
  expect(Rects.multiplyDim({ x: 10, y: 20, width: 2, height: 4 }, 2)).toEqual({ x: 10, y: 20, width: 4, height: 8 });
});

test(`corners`, () => {
  const r1 = Rects.corners({ x: 10, y: 10, width: 20, height: 5 });
  const r2 = Rects.corners({ width: 20, height: 5 }, { x: 10, y: 10 });
  expect(r1).toEqual(r2);
  expect(r1).toEqual([
    // ne, nw, sw, se
    { x: 10, y: 10 }, { x: 30, y: 10 }, { x: 30, y: 15 }, { x: 10, y: 15 }
  ])
});

test(`getRectPositionedParameter`, () => {

  // x,y,w,h
  const r1 = getRectPositionedParameter(1, 2, 3, 4);
  expect(r1).toEqual({ x: 1, y: 2, width: 3, height: 4 });

  // Point,w,h
  const r2 = getRectPositionedParameter({ x: 1, y: 2 }, 3, 4);
  expect(r2).toEqual({ x: 1, y: 2, width: 3, height: 4 });

  // Point,Rect
  const r3 = getRectPositionedParameter({ x: 1, y: 2 }, { width: 3, height: 4 });
  expect(r3).toEqual({ x: 1, y: 2, width: 3, height: 4 });

  // RectPositioned
  const r4 = getRectPositionedParameter({ x: 1, y: 2, width: 3, height: 4 });
  expect(r4).toEqual({ x: 1, y: 2, width: 3, height: 4 });

  // x,y,Rect
  const r5 = getRectPositionedParameter(1, 2, { width: 3, height: 4 });
  expect(r5).toEqual({ x: 1, y: 2, width: 3, height: 4 });

  // Rect,Point
  const r6 = getRectPositionedParameter({ width: 3, height: 4 }, { x: 1, y: 2 });
  expect(r6).toEqual({ x: 1, y: 2, width: 3, height: 4 });


})
test(`cardinal`, () => {
  const r = {
    x: 10,
    y: 20,
    width: 50,
    height: 200
  };

  assert.deepEqual(Rects.cardinal(r, `nw`), {
    x: 10,
    y: 20
  });
  assert.deepEqual(Rects.cardinal(r, `ne`), {
    x: 60,
    y: 20
  });
  assert.deepEqual(Rects.cardinal(r, `n`), {
    x: 35,
    y: 20
  });
  assert.deepEqual(Rects.cardinal(r, `center`), {
    x: 35,
    y: 120
  });
  assert.deepEqual(Rects.cardinal(r, `w`), {
    x: 10,
    y: 120
  });
  assert.deepEqual(Rects.cardinal(r, `e`), {
    x: 60,
    y: 120
  });
  assert.deepEqual(Rects.cardinal(r, `s`), {
    x: 35,
    y: 220
  });
  assert.deepEqual(Rects.cardinal(r, `sw`), {
    x: 10,
    y: 220
  });
  assert.deepEqual(Rects.cardinal(r, `se`), {
    x: 60,
    y: 220
  });
});