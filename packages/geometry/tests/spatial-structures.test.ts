import type { Point } from '../src/point/point-type.js';
import { expect, it, vi } from 'vitest';
import { GridSelection } from '../src/grid/cursor.js';
import { rows } from '../src/grid/enumerators/rows.js';
import { toArray2d } from '../src/grid/to-array.js';
import { convexHull } from '../src/point/convex-hull.js';
import { PointTracker } from '../src/point/point-tracker.js';
import { poissonDisk } from '../src/poisson-disk.js';

it(`poissonDisk: points respect minimum distance and bounds`, () => {
  // Small area: the neighbour search is O(grid), so keep the grid tiny
  const rect = { x: 0, y: 0, width: 30, height: 30 };
  const radius = 8;
  const points = poissonDisk(rect, { radius, limit: 20 });

  expect(points.length).toBeGreaterThan(1);
  for (const p of points) {
    // Within bounds
    expect(p.x).toBeGreaterThanOrEqual(rect.x);
    expect(p.x).toBeLessThanOrEqual(rect.x + rect.width);
    expect(p.y).toBeGreaterThanOrEqual(rect.y);
    expect(p.y).toBeLessThanOrEqual(rect.y + rect.height);
  }

  // All pairs at least `radius` apart (with a small epsilon for float wobble)
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(radius - 0.001);
    }
  }
});

it(`convexHull`, () => {
  // Square: hull is the four corners
  const square: Point[] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
    // Interior point does not appear
    { x: 5, y: 5 },
  ];
  const hull = convexHull(...square);
  expect(hull.length).toBe(4);
  for (const corner of square.slice(0, 4)) {
    expect(hull.some(p => p.x === corner.x && p.y === corner.y)).toBe(true);
  }

  // Single point
  expect(convexHull({ x: 1, y: 2 })).toEqual([{ x: 1, y: 2 }]);

  // Collinear points: degenerate hull
  const line = convexHull({ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 10 });
  expect(line.length).toBeLessThanOrEqual(2);
});

it(`pointTracker tracks relations between seen points`, () => {
  vi.useFakeTimers();
  const t = new PointTracker();

  const first = t.seen({ x: 0, y: 0 });
  // Tracker stamps values with `at`, so compare coordinates
  expect(t.initial?.x).toBe(0);
  expect(t.initial?.y).toBe(0);
  expect(first.fromInitial.distanceFromStart).toBe(0);

  vi.advanceTimersByTime(100);
  const second = t.seen({ x: 3, y: 4 });
  // 3-4-5 triangle
  expect(second.fromInitial.distanceFromStart).toBe(5);
  expect(second.fromLast.distanceFromLast).toBe(5);
  // Speed: 5px over 100ms -> 0.05 px/ms (2d)
  expect(second.fromLast.speed).toBeCloseTo(0.05);
  expect(t.last?.x).toBe(3);
  expect(t.last?.y).toBe(4);

  // Polyline built from stored points
  expect(t.line.length).toBe(1);
  expect(t.distanceFromStart(true)).toBe(5);
  expect(t.lengthTotal(true)).toBeCloseTo(5);

  // Marking: relation to the marked position
  t.mark();
  vi.advanceTimersByTime(100);
  const third = t.seen({ x: 6, y: 4 });
  expect(third.fromMark).toBeDefined();
  expect(third.fromMark?.distanceFromStart).toBeCloseTo(3);

  // Reset clears everything
  t.reset();
  expect(t.values.length).toBe(0);
  expect(t.distanceFromStart()).toBe(0);
  vi.useRealTimers();
});

it(`gridSelection`, () => {
  const grid = { rows: 4, cols: 4, size: 10 };
  const sel = new GridSelection(grid);
  expect(sel.cursor).toEqual({ x: 0, y: 0 });

  // Cursor moves wrap within bounds
  const moved = sel.moveCursorByVector({ x: 2, y: 1 });
  expect(moved).toEqual({ x: 2, y: 1 });
  expect(sel.moveCursorByVector({ x: -5, y: 0 })).toEqual({ x: 1, y: 1 });

  // Contiguous selection extends while dragging
  sel.setCursor({ x: 1, y: 1 }, `contiguous`);
  expect(sel.selectionInProgress).toEqual({ start: { x: 1, y: 1 }, end: { x: 1, y: 1 }, kind: `contiguous` });
  sel.extendContiguous({ x: 3, y: 1 });
  expect(sel.selectionInProgress).toEqual({ start: { x: 1, y: 1 }, end: { x: 3, y: 1 }, kind: `contiguous` });

  // Cancel clears any in-progress selection
  sel.setCursor({ x: 0, y: 0 }, `cancel`);
  expect(sel.selectionInProgress).toBeUndefined();

  // NB: the constructor validates that start is a well-formed cell, but
  // not that it is inside the grid
});

it(`grid toArray2d and rows`, () => {
  const grid = { rows: 2, cols: 3, size: 1 };
  const cells = toArray2d<string>(grid, `x`);
  expect(cells).toEqual([
    [`x`, `x`, `x`],
    [`x`, `x`, `x`],
  ]);

  const allRows = [...rows(grid)];
  expect(allRows.length).toBe(2);
  expect(allRows[0]).toEqual([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]);

  // Row range
  expect([...rows(grid, 1, 1)]).toEqual([[{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }]]);
});
