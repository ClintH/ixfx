import type { EventItem } from "../src/events/types.js";
import { describe, expect, it } from "vitest";
import * as E from '../src/events/events-fns.js';

it(`holepunch`, () => {
  const item1 = { start: 5, end: 10 };

  // Single item
  expect(E.holepunch([item1], { start: 5, end: 7 })).toStrictEqual([{ start: 7, end: 10 }]);
  expect(E.holepunch([item1], { start: 6, end: 8 })).toStrictEqual([{ start: 5, end: 6 }, { start: 8, end: 10 }]);
  expect(E.holepunch([item1], { start: 8, end: 10 })).toStrictEqual([{ start: 5, end: 8 }]);
  expect(E.holepunch([item1], { start: 5, end: 10 })).toStrictEqual([]);

  // Multiple items
  const items = [{ start: 0, end: 1 }, item1, { start: 10, end: 12 }, { start: 25, end: 30 }];
  // Other items left alone
  expect(E.holepunch(items, { start: 5, end: 7 })).toStrictEqual([{ start: 0, end: 1 }, { start: 7, end: 10 }, { start: 10, end: 12 }, { start: 25, end: 30 }]);

  // Hole crosses two events
  expect(E.holepunch(items, { start: 6, end: 11 })).toStrictEqual([{ start: 0, end: 1 }, { start: 5, end: 6 }, { start: 11, end: 12 }, { start: 25, end: 30 }]);

  // Crosses one and consumes another
  expect(E.holepunch(items, { start: 5, end: 12 })).toStrictEqual([{ start: 0, end: 1 }, { start: 25, end: 30 }]);
});

it(`translate`, () => {
  expect(E.translate({ start: 1, end: 3 }, 2)).toStrictEqual({ start: 3, end: 5 });
  expect(E.translate({ start: 1, end: 3 }, -2)).toStrictEqual({ start: -1, end: 1 });
  expect(E.translate({ start: 1, end: 3 }, 0)).toStrictEqual({ start: 1, end: 3 });
});

it(`applyToPositions`, () => {
  expect(E.applyToPositions({ start: 1, end: 3 }, v => v * 2)).toStrictEqual({ start: 2, end: 6 });
  expect(E.applyToPositions({ start: 1, end: 3 }, v => v - 1)).toStrictEqual({ start: 0, end: 2 });
  expect(E.applyToPositions({ start: 1, end: 3 }, v => v)).toStrictEqual({ start: 1, end: 3 });
});

it(`overlapping`, () => {
  const test: EventItem[] = [
    { start: 1, end: 3 },
    { start: 4, end: 6 },
    { start: 5, end: 7 },
    { start: 8, end: 10 },
  ];

  expect([...E.overlapping(test, 2)]).toStrictEqual([{ event: { start: 1, end: 3 }, index: 0 }]);
  // Inclusive start
  expect([...E.overlapping(test, 1, false, true)]).toStrictEqual([{ event: { start: 1, end: 3 }, index: 0 }]);
  // Exclusive start
  expect([...E.overlapping(test, 1, false, false)]).toStrictEqual([]);

  expect([...E.overlapping(test, 5)]).toStrictEqual([
    { event: { start: 4, end: 6 }, index: 1 },
    { event: { start: 5, end: 7 }, index: 2 },
  ]);
  expect([...E.overlapping(test, 6)]).toStrictEqual([{ event: { start: 5, end: 7 }, index: 2 }]);

  // Exclusive end
  expect([...E.overlapping(test, 10)]).toStrictEqual([]);
  // Inclusive end
  expect([...E.overlapping(test, 10, true)]).toStrictEqual([{ event: { start: 8, end: 10 }, index: 3 }]);

  expect([...E.overlapping(test, 0)]).toStrictEqual([]);
  expect([...E.overlapping(test, 11)]).toStrictEqual([]);
});

it(`compareRange`, () => {
  expect(E.compareRange({ start: 2, end: 4 }, { start: 0, end: 1 })).toBe(`none`);
  expect(E.compareRange({ start: 2, end: 4 }, { start: 2, end: 4 })).toBe(`equal`);
  expect(E.compareRange({ start: 2, end: 4 }, { start: 3, end: 3 })).toBe(`full`);
  expect(E.compareRange({ start: 2, end: 4 }, { start: 3, end: 4 })).toBe(`full-border`);
  expect(E.compareRange({ start: 2, end: 4 }, { start: 1, end: 3 })).toBe(`partial`);
});
describe(`insertSpace`, () => {
  const items = E.createFromStarts([1, 5, 30, 100], 5, `t`);

  // insertSpace: ignore
  it(`ignore`, () => {
    // // Before any items
    // expect(E.insertSpace(items, 0, 3, `ignore`)).toStrictEqual([
    //   { start: 4, end: 9, id: `t-0` },
    //   { start: 8, end: 13, id: `t-1` },
    //   { start: 33, end: 38, id: `t-2` },
    //   { start: 103, end: 108, id: `t-3` },
    // ]);
    // // Before any events, different timing
    // expect(E.insertSpace(items, 0, 20, `ignore`)).toStrictEqual([
    //   { start: 21, end: 26, id: `t-0` },
    //   { start: 25, end: 30, id: `t-1` },
    //   { start: 50, end: 55, id: `t-2` },
    //   { start: 120, end: 125, id: `t-3` },
    // ]);

    // // After any items (doesn't make a difference)
    // expect(E.insertSpace(items, 101, 3, `ignore`)).toStrictEqual([
    //   { start: 1, end: 6, id: `t-0` },
    //   { start: 5, end: 10, id: `t-1` },
    //   { start: 30, end: 35, id: `t-2` },
    //   { start: 100, end: 105, id: `t-3` },
    // ]);

    // // Start point overlaps an existing event
    // expect(E.insertSpace(items, 31, 5, `ignore`)).toStrictEqual([
    //   { start: 1, end: 6, id: `t-0` },
    //   { start: 5, end: 10, id: `t-1` },
    //   { start: 30, end: 35, id: `t-2` }, // No change in duration
    //   { start: 105, end: 110, id: `t-3` }, // Shuffles this one down
    // ]);

    // // Start point coincides with (non exlusive) end point,
    // expect(E.insertSpace(items, 35, 5, `ignore`)).toStrictEqual([
    //   { start: 1, end: 6, id: `t-0` },
    //   { start: 5, end: 10, id: `t-1` },
    //   { start: 30, end: 35, id: `t-2` }, // No change, since not technically overlapping
    //   { start: 105, end: 110, id: `t-3` }, // Shuffle this one down
    // ]);

    // Start point coincides start point of existing event
    expect(E.insertSpace(items, 5, 10, `ignore`)).toStrictEqual([
      { start: 1, end: 6, id: `t-0` },
      { start: 15, end: 20, id: `t-1` },
      { start: 40, end: 45, id: `t-2` },
      { start: 110, end: 115, id: `t-3` }, // Shuffle this one down
    ]);
    expect(E.insertSpace([{ start: 5, end: 10 }], 5, 1, `ignore`)).toStrictEqual([{ start: 6, end: 11 }]);
    expect(E.insertSpace([{ start: 5, end: 10 }], 10, 1, `ignore`)).toStrictEqual([{ start: 5, end: 10 }]);
    expect(E.insertSpace([{ start: 5, end: 10 }], 6, 1, `ignore`)).toStrictEqual([{ start: 5, end: 10 }]);
    expect(E.insertSpace([{ start: 5, end: 10 }], 5, 1, `stretch`)).toStrictEqual([{ start: 6, end: 11 }]);
    expect(E.insertSpace([{ start: 5, end: 10 }], 6, 1, `stretch`)).toStrictEqual([{ start: 5, end: 11 }]);
  });

  // insertSpace: stretch
  it(`stretch`, () => {
    // const items = E.createFromStarts([1, 5, 30, 100], 5, `t`);
    // Between: stretch
    expect(E.insertSpace(items, 31, 5, `stretch`)).toStrictEqual([
      { start: 1, end: 6, id: `t-0` },
      { start: 5, end: 10, id: `t-1` },
      { start: 30, end: 40, id: `t-2` }, // stretched
      { start: 105, end: 110, id: `t-3` },
    ]);

    // Before: stretch (but with no overlap)
    expect(E.insertSpace(items, 0, 5, `stretch`)).toStrictEqual([
      { start: 6, end: 11, id: `t-0` },
      { start: 10, end: 15, id: `t-1` },
      { start: 35, end: 40, id: `t-2` },
      { start: 105, end: 110, id: `t-3` },
    ]);
    // Before: stretch with no overlap on t-1
    expect(E.insertSpace(items, 6, 5, `stretch`)).toStrictEqual([
      { start: 1, end: 6, id: `t-0` },
      { start: 5, end: 15, id: `t-1` }, // stretched
      { start: 35, end: 40, id: `t-2` },
      { start: 105, end: 110, id: `t-3` },
    ]);
    // Stretch: No overlap because 'start' is considered as exclusive
    expect(E.insertSpace(items, 30, 6, `stretch`)).toStrictEqual([
      { start: 1, end: 6, id: `t-0` },
      { start: 5, end: 10, id: `t-1` },
      { start: 36, end: 41, id: `t-2` },
      { start: 106, end: 111, id: `t-3` },
    ]);
    // Stretch: Overlap
    expect(E.insertSpace(items, 32, 6, `stretch`)).toStrictEqual([
      { start: 1, end: 6, id: `t-0` },
      { start: 5, end: 10, id: `t-1` },
      { start: 30, end: 41, id: `t-2` },
      { start: 106, end: 111, id: `t-3` },
    ]);
  });
}); // end insertSpace

it (`itemsWithStart`, () => {
  const a1 = [
    { start: 1, end: 3 },
    { start: 4, end: 10 },
    { start: 6, end: 9 },
    { start: 10, end: 11 },
  ];
  expect([...E.itemsWithStart(a1, 2)]).toStrictEqual([]);
  expect([...E.itemsWithStart(a1, 0)]).toStrictEqual([]);
  expect([...E.itemsWithStart(a1, 5)]).toStrictEqual([]);
  expect([...E.itemsWithStart(a1, 11)]).toStrictEqual([]);

  expect([...E.itemsWithStart(a1, 1)]).toStrictEqual([{ event: { start: 1, end: 3 }, index: 0 }]);
  expect([...E.itemsWithStart(a1, 4)]).toStrictEqual([{ event: { start: 4, end: 10 }, index: 1 }]);
  expect([...E.itemsWithStart(a1, 6)]).toStrictEqual([{ event: { start: 6, end: 9 }, index: 2 }]);
  expect([...E.itemsWithStart(a1, 10)]).toStrictEqual([{ event: { start: 10, end: 11 }, index: 3 }]);

  expect([...E.itemsWithStart([
    { start: 1, end: 3 },
    { start: 2, end: 4 },
    { start: 2, end: 5 },
    { start: 3, end: 6 },
  ], 2)]).toStrictEqual([
    { event: { start: 2, end: 4 }, index: 1 },
    { event: { start: 2, end: 5 }, index: 2 },
  ]);
});

it (`itemsWithEnd`, () => {
  const a1 = E.sortByEnd([
    { start: 1, end: 3 },
    { start: 6, end: 9 },
    { start: 4, end: 10 },
    { start: 10, end: 11 },
  ]);
  expect([...E.itemsWithEnd(a1, 2)]).toStrictEqual([]);
  expect([...E.itemsWithEnd(a1, 0)]).toStrictEqual([]);
  expect([...E.itemsWithEnd(a1, 5)]).toStrictEqual([]);
  expect([...E.itemsWithEnd(a1, 12)]).toStrictEqual([]);

  expect([...E.itemsWithEnd(a1, 3)]).toStrictEqual([{ event: { start: 1, end: 3 }, index: 0 }]);
  expect([...E.itemsWithEnd(a1, 9)]).toStrictEqual([{ event: { start: 6, end: 9 }, index: 1 }]);
  expect([...E.itemsWithEnd(a1, 10)]).toStrictEqual([{ event: { start: 4, end: 10 }, index: 2 }]);
  expect([...E.itemsWithEnd(a1, 11)]).toStrictEqual([{ event: { start: 10, end: 11 }, index: 3 }]);

  const result = [...E.itemsWithEnd([
    { start: 1, end: 3 },
    { start: 2, end: 4 },
    { start: 3, end: 4 },
    { start: 3, end: 6 },
  ], 4)];
  expect(result).toStrictEqual([
    { event: { end: 4, start: 2 }, index: 1 },
    { event: { start: 3, end: 4 }, index: 2 },
  ]);
});
it(`arrayFromItems`, () => {
  const g = () => E.itemsWithStart([
    { start: 1, end: 3 },
    { start: 2, end: 4 },
    { start: 2, end: 5 },
    { start: 3, end: 6 },
  ], 2);
  const items = E.arrayFromItems(g());
  expect(items).toEqual([
    undefined, // since item at start:1 is skipped over
    { start: 2, end: 4 },
    { start: 2, end: 5 },
  ]);

  // ignoreIndexes
  const items2 = E.arrayFromItems(g(), true);
  expect(items2).toStrictEqual([
    { start: 2, end: 4 },
    { start: 2, end: 5 },
  ]);
});

it(`sortByStart`, () => {
  //  Returns 0 if a and b are have same start & end. Returns positive if B is before A. Returns negative if B is after A.
  expect(E.CompareByStart({ start: 3, end: 10 }, { start: 3, end: 10 })).toBe(0);
  expect(E.CompareByStart({ start: 3, end: 10 }, { start: 4, end: 1 })).toBeLessThan(0);
  expect(E.CompareByStart({ start: 3, end: 10 }, { start: 3, end: 1 })).toBeGreaterThan(0);
  expect(E.CompareByStart({ start: 3, end: 10 }, { start: 3, end: 15 })).toBeLessThan(0);
  expect(E.CompareByStart({ start: 3, end: 10 }, { start: 2, end: 15 })).toBeGreaterThan(0);

  const items = E.createFromStarts([0, 5, 10, 100], 5, `t`);
  expect(E.sortByStart(items)).toStrictEqual(items);
  expect(E.sortByStart(items.toReversed())).toStrictEqual(items);

  // Items with same start are sorted secondarily based on end time
  const items2 = [{ start: 0, end: 2 }, { start: 5, end: 100 }, { start: 4, end: 5 }, { start: 5, end: 3 }];
  expect(E.sortByStart(items2)).toStrictEqual([{ start: 0, end: 2 }, { start: 4, end: 5 }, { start: 5, end: 3 }, { start: 5, end: 100 }]);
});

it(`sortByEnd`, () => {
  //  Returns 0 if a and b are have same start & end. Returns positive if B is before A. Returns negative if B is after A.
  expect(E.CompareByEnd({ start: 3, end: 10 }, { start: 3, end: 10 })).toBe(0);
  expect(E.CompareByEnd({ start: 3, end: 10 }, { start: 3, end: 11 })).toBeLessThan(0);
  expect(E.CompareByEnd({ start: 3, end: 10 }, { start: 5, end: 10 })).toBeLessThan(0);
  expect(E.CompareByEnd({ start: 3, end: 10 }, { start: 1, end: 10 })).toBeGreaterThan(0);
  expect(E.CompareByEnd({ start: 3, end: 10 }, { start: 2, end: 9 })).toBeGreaterThan(0);

  // Input is already sorted by end
  const items1 = [{ end: 60, start: 10 }, { end: 90, start: 80 }, { end: 115, start: 100 }];
  expect(E.sortByEnd(items1)).toStrictEqual(items1);
  expect(E.sortByEnd(items1.toReversed())).toStrictEqual(items1);

  // Items with same end are sorted secondarily based on start time
  const items2 = [{ end: 115, start: 100 }, { end: 60, start: 10 }, { end: 90, start: 80 }, { end: 115, start: 90 }];
  expect(E.sortByEnd(items2)).toStrictEqual([{ end: 60, start: 10 }, { end: 90, start: 80 }, { end: 115, start: 90 }, { end: 115, start: 100 }]);
});

it(`remove`, () => {
  const items = E.createFromStarts([0, 5, 30, 100], 5, `t`);
  expect(E.remove(items, { start: 5, end: 10 }, `nothing`)).toStrictEqual([
    { start: 0, end: 5, id: `t-0` },
    { start: 30, end: 35, id: `t-2` },
    { start: 100, end: 105, id: `t-3` },
  ]);
  expect(E.remove(items, { start: 5, end: 10 }, `shuffle-following`)).toStrictEqual([
    { start: 0, end: 5, id: `t-0` },
    { start: 25, end: 30, id: `t-2` },
    { start: 95, end: 100, id: `t-3` },
  ]);
  expect(E.remove(items, { start: 5, end: 10 }, `slice-following`)).toStrictEqual([
    { start: 0, end: 5, id: `t-0` },
    { start: 5, end: 10, id: `t-2` },
    { start: 75, end: 80, id: `t-3` },
  ]);

  expect(E.remove(items, { start: 5, end: 10 }, `shuffle-leading`)).toStrictEqual([
    { start: 5, end: 10, id: `t-0` },
    { start: 30, end: 35, id: `t-2` },
    { start: 100, end: 105, id: `t-3` },
  ]);
  expect(E.remove(items, { start: 30, end: 35 }, `slice-leading`)).toStrictEqual([
    { start: 25, end: 30, id: `t-0` },
    { start: 30, end: 35, id: `t-1` },
    { start: 100, end: 105, id: `t-3` },
  ]);
});

it(`sumDuration`, () => {
  expect(E.sumDuration([{ start: 1, end: 3 }, { start: 4, end: 6 }])).toBe(4);
  expect(E.sumDuration([{ start: 1, end: 3 }, { start: 2, end: 5 }])).toBe(5);
  expect(E.sumDuration([{ start: 1, end: 3 }, { start: 3, end: 5 }])).toBe(4);
});

it(`getRange`, () => {
  expect(E.computeRange([{ start: 1, end: 3 }, { start: 4, end: 6 }])).toStrictEqual({ start: 1, end: 6 });
  expect(E.computeRange([{ start: 1, end: 3 }, { start: 2, end: 5 }])).toStrictEqual({ start: 1, end: 5 });
  expect(E.computeRange([{ start: 1, end: 3 }, { start: 1, end: 1 }])).toStrictEqual({ start: 1, end: 3 });
  expect(E.computeRange([{ start: 1, end: 3 }, { start: 1, end: 5 }])).toStrictEqual({ start: 1, end: 5 });
});

it(`intervals`, () => {
  const items = E.createFromStarts([0, 5, 10, 100], 5, `t`);
  expect([...E.intervals(items)]).toStrictEqual([
    { startInterval: 5, endInterval: 5, betweenInterval: 0, indexA: 0, indexB: 1, a: { start: 0, end: 5, id: `t-0` }, b: { start: 5, end: 10, id: `t-1` } },
    { startInterval: 5, endInterval: 5, betweenInterval: 0, indexA: 1, indexB: 2, a: { start: 5, end: 10, id: `t-1` }, b: { start: 10, end: 15, id: `t-2` } },
    { startInterval: 90, endInterval: 90, betweenInterval: 85, indexA: 2, indexB: 3, b: { start: 100, end: 105, id: `t-3` }, a: { start: 10, end: 15, id: `t-2` } },
  ]);

  const items2 = E.createFromStarts([5, 8, 20], 10, `t`);
  expect([...E.intervals(items2)]).toStrictEqual([
    { startInterval: 3, endInterval: 3, betweenInterval: -7, indexA: 0, indexB: 1, a: { start: 5, end: 15, id: `t-0` }, b: { start: 8, end: 18, id: `t-1` } },
    { startInterval: 12, endInterval: 12, betweenInterval: 2, indexA: 1, indexB: 2, a: { start: 8, end: 18, id: `t-1` }, b: { start: 20, end: 30, id: `t-2` } },
  ]);
});

it(`defragment`, () => {
  const items = E.createFromStarts([0, 5, 10, 100], 5, `t`);
  expect(E.defragment(items)).toStrictEqual([
    { start: 0, end: 5, id: `t-0` },
    { start: 5, end: 10, id: `t-1` },
    { start: 10, end: 15, id: `t-2` },
    { start: 15, end: 20, id: `t-3` },
  ]);
  expect(E.defragment(items, { gap: 5 })).toStrictEqual([
    { start: 0, end: 5, id: `t-0` },
    { start: 10, end: 15, id: `t-1` },
    { start: 20, end: 25, id: `t-2` },
    { start: 30, end: 35, id: `t-3` },
  ]);
  expect(E.defragment(items, { startAt: 5 })).toStrictEqual([
    { start: 5, end: 10, id: `t-0` },
    { start: 10, end: 15, id: `t-1` },
    { start: 15, end: 20, id: `t-2` },
    { start: 20, end: 25, id: `t-3` },
  ]);
});
