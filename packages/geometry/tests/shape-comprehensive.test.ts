import { test, expect } from 'vitest';
import * as Shape from '../src/shape/index.js';

test(`center - undefined returns default`, () => {
  const center = Shape.center(undefined);
  expect(center.x).toBe(0.5);
  expect(center.y).toBe(0.5);
});

test(`center - rectangle`, () => {
  const shape = { x: 0, y: 0, width: 100, height: 100 };
  const center = Shape.center(shape);
  expect(center.x).toBe(50);
  expect(center.y).toBe(50);
});

test(`center - circle`, () => {
  const shape = { x: 50, y: 50, radius: 25 };
  const center = Shape.center(shape);
  expect(center.x).toBe(50);
  expect(center.y).toBe(50);
});

test(`center - triangle`, () => {
  const shape = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 5, y: 10 } };
  const center = Shape.center(shape);
  expect(center.x).toBeCloseTo(5, 1);
  expect(center.y).toBeCloseTo(3.33, 1);
});

test(`randomPoint - circle`, () => {
  const circle = { x: 50, y: 50, radius: 25 };
  const pt = Shape.randomPoint(circle);
  const dist = Math.hypot(pt.x - 50, pt.y - 50);
  expect(dist).toBeLessThanOrEqual(25);
});

test(`randomPoint - rectangle`, () => {
  const rect = { x: 0, y: 0, width: 100, height: 100 };
  const pt = Shape.randomPoint(rect);
  expect(pt.x).toBeGreaterThanOrEqual(0);
  expect(pt.x).toBeLessThan(100);
  expect(pt.y).toBeGreaterThanOrEqual(0);
  expect(pt.y).toBeLessThan(100);
});

test(`randomPoint - throws for unknown shape`, () => {
  expect(() => Shape.randomPoint({ width: 100, height: 100 } as any)).toThrow();
});

test(`isIntersecting - circle with point inside`, () => {
  const circle = { x: 50, y: 50, radius: 25 };
  expect(Shape.isIntersecting(circle, { x: 50, y: 50 })).toBe(true);
  expect(Shape.isIntersecting(circle, { x: 50, y: 75 })).toBe(true);
  expect(Shape.isIntersecting(circle, { x: 50, y: 80 })).toBe(false);
});

test(`isIntersecting - rectangle with point inside`, () => {
  const rect = { x: 0, y: 0, width: 100, height: 100 };
  expect(Shape.isIntersecting(rect, { x: 50, y: 50 })).toBe(true);
  expect(Shape.isIntersecting(rect, { x: 0, y: 0 })).toBe(true);
  expect(Shape.isIntersecting(rect, { x: 100, y: 100 })).toBe(true);
  expect(Shape.isIntersecting(rect, { x: 101, y: 50 })).toBe(false);
});

test(`isIntersecting - circle with circle`, () => {
  const circle1 = { x: 50, y: 50, radius: 25 };
  const circle2 = { x: 60, y: 60, radius: 25 };
  const circle3 = { x: 200, y: 200, radius: 10 };
  expect(Shape.isIntersecting(circle1, circle2)).toBe(true);
  expect(Shape.isIntersecting(circle1, circle3)).toBe(false);
});

test(`isIntersecting - rectangle with circle`, () => {
  const rect = { x: 0, y: 0, width: 100, height: 100 };
  const circle = { x: 50, y: 50, radius: 25 };
  expect(Shape.isIntersecting(rect, circle)).toBe(true);
  const circleOutside = { x: 150, y: 150, radius: 10 };
  expect(Shape.isIntersecting(rect, circleOutside)).toBe(false);
});

test(`isIntersecting - throws for unknown shape`, () => {
  expect(() => Shape.isIntersecting({ width: 100 } as any, { x: 50, y: 50 })).toThrow();
});

test(`starburst - default 5 points`, () => {
  const pts = Shape.starburst(100);
  expect(pts.length).toBeGreaterThan(0);
  expect(pts[0].x).not.toBe(pts[0].y);
});

test(`starburst - 4 points`, () => {
  const pts = Shape.starburst(100, 4);
  expect(pts.length).toBeGreaterThan(0);
});

test(`starburst - with origin`, () => {
  const origin = { x: 50, y: 50 };
  const pts = Shape.starburst(100, 5, 50, origin);
  expect(pts.length).toBeGreaterThan(0);
});

test(`starburst - with initial angle`, () => {
  const opts = { initialAngleRadian: 0 };
  const pts = Shape.starburst(100, 5, 50, undefined, opts);
  expect(pts.length).toBeGreaterThan(0);
});

test(`arrow - tip`, () => {
  const arrow = Shape.arrow({ x: 100, y: 100 }, `tip`, {});
  expect(Array.isArray(arrow)).toBe(true);
  expect(arrow.length).toBeGreaterThan(0);
});

test(`arrow - tail`, () => {
  const arrow = Shape.arrow({ x: 100, y: 100 }, `tail`, {});
  expect(Array.isArray(arrow)).toBe(true);
  expect(arrow.length).toBeGreaterThan(0);
});

test(`arrow - middle`, () => {
  const arrow = Shape.arrow({ x: 100, y: 100 }, `middle`, {});
  expect(Array.isArray(arrow)).toBe(true);
  expect(arrow.length).toBeGreaterThan(0);
});

test(`arrow - with options`, () => {
  const arrow = Shape.arrow({ x: 100, y: 100 }, `tip`, {
    tailLength: 20,
    arrowSize: 30,
    tailThickness: 10,
    angleRadian: Math.PI / 4
  });
  expect(Array.isArray(arrow)).toBe(true);
  expect(arrow.length).toBeGreaterThan(0);
});
