import { test, expect } from 'vitest';
import * as Rects from '../src/rect/index.js';

test(`guard - valid rect does not throw`, () => {
  expect(() => Rects.guard({ width: 10, height: 20 })).not.toThrow();
});

test(`guard - undefined throws`, () => {
  expect(() => Rects.guard(undefined as any)).toThrow();
});

test(`guard - NaN dimensions throw`, () => {
  expect(() => Rects.guard({ width: NaN, height: 10 })).toThrow();
  expect(() => Rects.guard({ width: 10, height: NaN })).toThrow();
});

test(`guard - negative dimensions throw`, () => {
  expect(() => Rects.guard({ width: -1, height: 10 })).toThrow();
  expect(() => Rects.guard({ width: 10, height: -1 })).toThrow();
});

test(`guardDim - undefined throws`, () => {
  expect(() => Rects.guardDim(undefined as any, `test`)).toThrow();
});

test(`guardDim - NaN throws`, () => {
  expect(() => Rects.guardDim(NaN, `test`)).toThrow();
});

test(`guardDim - negative throws`, () => {
  expect(() => Rects.guardDim(-1, `test`)).toThrow();
});

test(`isEmpty - returns true for zero dimensions`, () => {
  expect(Rects.isEmpty({ width: 0, height: 0 })).toBe(true);
  expect(Rects.isEmpty({ width: 0, height: 10 })).toBe(false);
  expect(Rects.isEmpty({ width: 10, height: 0 })).toBe(false);
});

test(`isPlaceholder - returns true for NaN dimensions`, () => {
  expect(Rects.isPlaceholder({ width: NaN, height: NaN })).toBe(true);
  expect(Rects.isPlaceholder({ width: 10, height: NaN })).toBe(false);
});

test(`isPositioned - detects position`, () => {
  expect(Rects.isPositioned({ x: 0, y: 0, width: 10, height: 10 })).toBe(true);
  expect(Rects.isPositioned({ width: 10, height: 10 })).toBe(false);
});

test(`isRect - validates rect structure`, () => {
  expect(Rects.isRect({ width: 10, height: 20 })).toBe(true);
  expect(Rects.isRect({ x: 0, y: 0, width: 10, height: 20 })).toBe(true);
  expect(Rects.isRect({ width: 10 })).toBe(false);
});

test(`isRectPositioned - validates positioned rect`, () => {
  expect(Rects.isRectPositioned({ x: 0, y: 0, width: 10, height: 20 })).toBe(true);
  expect(Rects.isRectPositioned({ width: 10, height: 20 })).toBe(false);
});

test(`getRectPositioned - returns positioned rect`, () => {
  const result = Rects.getRectPositioned({ width: 10, height: 20 }, { x: 5, y: 10 });
  expect(result.x).toBe(5);
  expect(result.y).toBe(10);
  expect(result.width).toBe(10);
  expect(result.height).toBe(20);
});

test(`getRectPositioned - throws for unpositioned without origin`, () => {
  expect(() => Rects.getRectPositioned({ width: 10, height: 20 })).toThrow();
});

test(`guardPositioned - throws for unpositioned`, () => {
  expect(() => Rects.guardPositioned({ width: 10, height: 20 })).toThrow();
  expect(() => Rects.guardPositioned({ x: 0, y: 0, width: 10, height: 20 })).not.toThrow();
});

test(`center - calculates center point`, () => {
  const rect = { x: 10, y: 20, width: 100, height: 50 };
  const center = Rects.center(rect);
  expect(center.x).toBe(60);
  expect(center.y).toBe(45);
});

test(`center - with origin parameter`, () => {
  const rect = { width: 100, height: 50 };
  const center = Rects.center(rect, { x: 5, y: 10 });
  expect(center.x).toBe(55);
  expect(center.y).toBe(35);
});

test(`center - assumes 0,0 for unpositioned`, () => {
  const rect = { width: 100, height: 50 };
  const center = Rects.center(rect);
  expect(center.x).toBe(50);
  expect(center.y).toBe(25);
});

test(`area - calculates area`, () => {
  expect(Rects.area({ width: 10, height: 20 })).toBe(200);
  expect(Rects.area({ x: 0, y: 0, width: 5, height: 5 })).toBe(25);
});

test(`perimeter - calculates perimeter`, () => {
  expect(Rects.perimeter({ width: 10, height: 20 })).toBe(60);
  expect(Rects.perimeter({ x: 0, y: 0, width: 5, height: 5 })).toBe(20);
});

test(`edges - returns four edge lines`, () => {
  const rect = { x: 10, y: 10, width: 20, height: 10 };
  const edges = Rects.edges(rect);
  expect(edges.length).toBe(4);
});

test(`getEdgeX - returns x coordinate for edges`, () => {
  const rect = { x: 10, y: 20, width: 100, height: 50 };
  expect(Rects.getEdgeX(rect, `top`)).toBe(10);
  expect(Rects.getEdgeX(rect, `bottom`)).toBe(10);
  expect(Rects.getEdgeX(rect, `left`)).toBe(20);
  expect(Rects.getEdgeX(rect, `right`)).toBe(110);
});

test(`getEdgeX - with unpositioned rect`, () => {
  const rect = { width: 100, height: 50 };
  expect(Rects.getEdgeX(rect, `top`)).toBe(0);
  expect(Rects.getEdgeX(rect, `right`)).toBe(100);
});

test(`getEdgeY - returns y coordinate for edges`, () => {
  const rect = { x: 10, y: 20, width: 100, height: 50 };
  expect(Rects.getEdgeY(rect, `top`)).toBe(20);
  expect(Rects.getEdgeY(rect, `bottom`)).toBe(70);
  expect(Rects.getEdgeY(rect, `left`)).toBe(20);
  expect(Rects.getEdgeY(rect, `right`)).toBe(20);
});

test(`getEdgeY - with unpositioned rect`, () => {
  const rect = { width: 100, height: 50 };
  expect(Rects.getEdgeY(rect, `top`)).toBe(0);
  expect(Rects.getEdgeY(rect, `bottom`)).toBe(50);
});

test(`isEqualSize - compares dimensions only`, () => {
  expect(Rects.isEqualSize({ width: 10, height: 20 }, { width: 10, height: 20 })).toBe(true);
  expect(Rects.isEqualSize({ width: 10, height: 20 }, { width: 20, height: 10 })).toBe(false);
});

test(`isEqual - compares full rect`, () => {
  expect(Rects.isEqual({ x: 0, y: 0, width: 10, height: 20 }, { x: 0, y: 0, width: 10, height: 20 })).toBe(true);
  expect(Rects.isEqual({ x: 0, y: 0, width: 10, height: 20 }, { x: 5, y: 5, width: 10, height: 20 })).toBe(false);
});

test(`isEqual - handles mixed positioned/unpositioned`, () => {
  expect(Rects.isEqual({ width: 10, height: 20 }, { width: 10, height: 20 })).toBe(true);
  expect(Rects.isEqual({ width: 10, height: 20 }, { x: 0, y: 0, width: 10, height: 20 })).toBe(false);
});

test(`fromNumbers - creates rect from numbers`, () => {
  const rect = Rects.fromNumbers(10, 20, 100, 50);
  expect(rect).toEqual({ x: 10, y: 20, width: 100, height: 50 });
});

test(`fromCenter - creates rect from center and size`, () => {
  const rect = Rects.fromCenter({ x: 50, y: 50 }, 100, 60);
  expect(rect.x).toBe(0);
  expect(rect.y).toBe(20);
  expect(rect.width).toBe(100);
  expect(rect.height).toBe(60);
});

test(`fromTopLeft - creates rect from top-left and size`, () => {
  const rect = Rects.fromTopLeft({ x: 10, y: 20 }, 100, 50);
  expect(rect.x).toBe(10);
  expect(rect.y).toBe(20);
  expect(rect.width).toBe(100);
  expect(rect.height).toBe(50);
});

test(`toArray - converts to array`, () => {
  const arr = Rects.toArray({ x: 10, y: 20, width: 100, height: 50 });
  expect(arr).toEqual([10, 20, 100, 50]);
});

test(`initialisers - Empty rect`, () => {
  expect(Rects.Empty.width).toBe(0);
  expect(Rects.Empty.height).toBe(0);
});

test(`initialisers - Placeholder rect`, () => {
  expect(Number.isNaN(Rects.Placeholder.width)).toBe(true);
  expect(Number.isNaN(Rects.Placeholder.height)).toBe(true);
});

test(`encompass - expands to include point`, () => {
  const rect = { x: 0, y: 0, width: 10, height: 10 };
  const expanded = Rects.encompass(rect, { x: 20, y: 20 });
  expect(expanded.x).toBe(0);
  expect(expanded.y).toBe(0);
  expect(expanded.width).toBe(20);
  expect(expanded.height).toBe(20);
});

test(`encompass - multiple points`, () => {
  const rect = { x: 0, y: 0, width: 10, height: 10 };
  const expanded = Rects.encompass(rect, { x: 20, y: 20 }, { x: -5, y: -5 });
  expect(expanded.x).toBe(-5);
  expect(expanded.y).toBe(-5);
  expect(expanded.width).toBe(25);
  expect(expanded.height).toBe(25);
});

test(`corners - returns four corner points`, () => {
  const rect = { x: 10, y: 10, width: 20, height: 10 };
  const corners = Rects.corners(rect);
  expect(corners.length).toBe(4);
  expect(corners[0]).toEqual({ x: 10, y: 10 });
  expect(corners[1]).toEqual({ x: 30, y: 10 });
  expect(corners[2]).toEqual({ x: 30, y: 20 });
  expect(corners[3]).toEqual({ x: 10, y: 20 });
});

test(`cardinal - returns cardinal points`, () => {
  const rect = { x: 10, y: 20, width: 50, height: 200 };
  expect(Rects.cardinal(rect, `nw`)).toEqual({ x: 10, y: 20 });
  expect(Rects.cardinal(rect, `ne`)).toEqual({ x: 60, y: 20 });
  expect(Rects.cardinal(rect, `center`)).toEqual({ x: 35, y: 120 });
  expect(Rects.cardinal(rect, `se`)).toEqual({ x: 60, y: 220 });
});

test(`Intersects - point inside rect`, () => {
  const rect = { x: 0, y: 0, width: 100, height: 100 };
  expect(Rects.intersectsPoint(rect, { x: 50, y: 50 })).toBe(true);
  expect(Rects.intersectsPoint(rect, { x: 0, y: 0 })).toBe(true);
  expect(Rects.intersectsPoint(rect, { x: 100, y: 100 })).toBe(true);
  expect(Rects.intersectsPoint(rect, { x: 101, y: 50 })).toBe(false);
});

test(`divideScalar - divides dimensions by scalar`, () => {
  const rect = { x: 10, y: 20, width: 100, height: 50 };
  const divided = Rects.divideScalar(rect, 10);
  expect(divided.x).toBe(1);
  expect(divided.y).toBe(2);
  expect(divided.width).toBe(10);
  expect(divided.height).toBe(5);
});

test(`divideDim - divides width/height only`, () => {
  const rect = { x: 10, y: 20, width: 100, height: 50 };
  const divided = Rects.divideDim(rect, 10);
  expect(divided.x).toBe(10);
  expect(divided.y).toBe(20);
  expect(divided.width).toBe(10);
  expect(divided.height).toBe(5);
});

test(`multiplyScalar - multiplies dimensions by scalar`, () => {
  const rect = { x: 10, y: 20, width: 100, height: 50 };
  const multiplied = Rects.multiplyScalar(rect, 2);
  expect(multiplied.x).toBe(20);
  expect(multiplied.y).toBe(40);
  expect(multiplied.width).toBe(200);
  expect(multiplied.height).toBe(100);
});

test(`multiplyDim - multiplies width/height only`, () => {
  const rect = { x: 10, y: 20, width: 100, height: 50 };
  const multiplied = Rects.multiplyDim(rect, 2);
  expect(multiplied.x).toBe(10);
  expect(multiplied.y).toBe(20);
  expect(multiplied.width).toBe(200);
  expect(multiplied.height).toBe(100);
});

test(`divide - by w/h`, () => {
  expect(Rects.divide({ width: 1, height: 8 }, 2, 4)).toEqual({ width: 0.5, height: 2 });
});

test(`divide - by rect`, () => {
  expect(Rects.divide({ width: 1, height: 8 }, { width: 2, height: 4 })).toEqual({ width: 0.5, height: 2 });
});

test(`multiply - by w/h`, () => {
  expect(Rects.multiply({ width: 1, height: 2 }, 2, 4)).toEqual({ width: 2, height: 8 });
});

test(`multiply - by rect`, () => {
  expect(Rects.multiply({ width: 1, height: 2 }, { width: 2, height: 4 })).toEqual({ width: 2, height: 8 });
});

test(`sum - by w/h`, () => {
  expect(Rects.sum({ width: 1, height: 8 }, 2, 4)).toEqual({ width: 3, height: 12 });
});

test(`sum - by rect`, () => {
  expect(Rects.sum({ width: 1, height: 8 }, { width: 2, height: 4 })).toEqual({ width: 3, height: 12 });
});

test(`subtract - by w/h`, () => {
  expect(Rects.subtract({ width: 1, height: 8 }, 2, 4)).toEqual({ width: -1, height: 4 });
});

test(`subtract - by rect`, () => {
  expect(Rects.subtract({ width: 1, height: 8 }, { width: 2, height: 4 })).toEqual({ width: -1, height: 4 });
});

test(`centerOrigin - creates centered origin object`, () => {
  const r1 = { x: 5, y: 5, width: 20, height: 20 };
  const co1 = Rects.centerOrigin(r1);
  expect(co1.relativeToAbsolute({ x: 0, y: 0 })).toEqual({ x: 15, y: 15 });
  expect(co1.absoluteToRelative({ x: 15, y: 15 })).toEqual({ x: 0, y: 0 });
});

test(`getRectPositionedParameter - various signatures`, () => {
  expect(Rects.getRectPositionedParameter(1, 2, 3, 4)).toEqual({ x: 1, y: 2, width: 3, height: 4 });
  expect(Rects.getRectPositionedParameter({ x: 1, y: 2 }, 3, 4)).toEqual({ x: 1, y: 2, width: 3, height: 4 });
  expect(Rects.getRectPositionedParameter({ width: 3, height: 4 }, { x: 1, y: 2 })).toEqual({ x: 1, y: 2, width: 3, height: 4 });
});
