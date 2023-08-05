import { expect, test } from '@jest/globals';
import { Scaler, Points, Rects } from '../../geometry/index.js';

const testBasic = (
  abs: boolean,
  scaler: Scaler.Scaler,
  input: Points.Point,
  expected: Points.Point
) => {
  const s = abs ? scaler.abs : scaler.rel;
  const t1 = s(input.x, input.y);
  const t2 = s({ x: input.x, y: input.y });

  if (!testEq(expected, t1)) return false;
  if (!testEq(expected, t2)) return false;

  return true;
};

const testEq = (expected: Points.Point, got: Points.Point) => {
  if (Points.isEqual(expected, got)) return true;
  console.log(
    `got: ${Points.toString(got)} expected: ${Points.toString(expected)}`
  );
  return false;
};

const testOverride = (
  abs: boolean,
  scaler: Scaler.Scaler,
  input: Points.Point,
  output: Rects.Rect,
  expected: Points.Point
) => {
  const s = abs ? scaler.abs : scaler.rel;
  const t1 = s(input.x, input.y, output.width, output.height);
  const t2 = s(input.x, input.y, output);

  const t3 = s(input, output.width, output.height);
  const t4 = s(input, output);

  if (!testEq(expected, t1)) return false;
  if (!testEq(expected, t2)) return false;
  if (!testEq(expected, t3)) return false;
  if (!testEq(expected, t4)) return false;

  return true;
};

test(`height`, () => {
  const w = 800;
  const h = 600;

  const s = Scaler.scaler(`height`, { width: w, height: h });

  // Make relative
  expect(testBasic(false, s, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeTruthy();
  expect(testBasic(false, s, { x: h, y: h }, { x: 1, y: 1 })).toBeTruthy();
  expect(
    testBasic(false, s, { x: 2 * h, y: 2 * h }, { x: 2, y: 2 })
  ).toBeTruthy();
  expect(
    testBasic(false, s, { x: h / 2, y: h / 2 }, { x: 0.5, y: 0.5 })
  ).toBeTruthy();

  expect(
    testOverride(
      false,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      false,
      s,
      { x: 300, y: 300 },
      { width: 400, height: 300 },
      { x: 1, y: 1 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      false,
      s,
      { x: 150, y: 150 },
      { width: 400, height: 300 },
      { x: 0.5, y: 0.5 }
    )
  ).toBeTruthy();

  // Make absolute
  expect(testBasic(true, s, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeTruthy();
  expect(testBasic(true, s, { x: 1, y: 1 }, { x: h, y: h })).toBeTruthy();
  expect(
    testBasic(true, s, { x: 0.5, y: 0.5 }, { x: h / 2, y: h / 2 })
  ).toBeTruthy();
  expect(
    testBasic(true, s, { x: 2, y: 2 }, { x: h * 2, y: h * 2 })
  ).toBeTruthy();

  expect(
    testOverride(
      true,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 1, y: 1 },
      { width: 400, height: 300 },
      { x: 300, y: 300 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 0.5, y: 0.5 },
      { width: 400, height: 300 },
      { x: 150, y: 150 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 2, y: 2 },
      { width: 400, height: 300 },
      { x: 600, y: 600 }
    )
  ).toBeTruthy();
});

test(`min`, () => {
  const w = 800;
  const h = 600;

  const s = Scaler.scaler(`min`, { width: w, height: h });

  // Make relative
  expect(testBasic(false, s, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeTruthy();
  expect(testBasic(false, s, { x: h, y: h }, { x: 1, y: 1 })).toBeTruthy();
  expect(
    testBasic(false, s, { x: 2 * h, y: 2 * h }, { x: 2, y: 2 })
  ).toBeTruthy();
  expect(
    testBasic(false, s, { x: h / 2, y: h / 2 }, { x: 0.5, y: 0.5 })
  ).toBeTruthy();

  expect(
    testOverride(
      false,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      false,
      s,
      { x: 300, y: 300 },
      { width: 400, height: 300 },
      { x: 1, y: 1 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      false,
      s,
      { x: 150, y: 150 },
      { width: 400, height: 300 },
      { x: 0.5, y: 0.5 }
    )
  ).toBeTruthy();

  // Make absolute
  expect(testBasic(true, s, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeTruthy();
  expect(testBasic(true, s, { x: 1, y: 1 }, { x: h, y: h })).toBeTruthy();
  expect(
    testBasic(true, s, { x: 0.5, y: 0.5 }, { x: h / 2, y: h / 2 })
  ).toBeTruthy();
  expect(
    testBasic(true, s, { x: 2, y: 2 }, { x: h * 2, y: h * 2 })
  ).toBeTruthy();

  expect(
    testOverride(
      true,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 1, y: 1 },
      { width: 400, height: 300 },
      { x: 300, y: 300 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 0.5, y: 0.5 },
      { width: 400, height: 300 },
      { x: 150, y: 150 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 2, y: 2 },
      { width: 400, height: 300 },
      { x: 600, y: 600 }
    )
  ).toBeTruthy();
});

test(`max`, () => {
  const w = 800;
  const h = 600;

  const s = Scaler.scaler(`max`, { width: w, height: h });

  // Make relative
  expect(testBasic(false, s, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeTruthy();
  expect(testBasic(false, s, { x: w, y: w }, { x: 1, y: 1 })).toBeTruthy();
  expect(
    testBasic(false, s, { x: 2 * w, y: 2 * w }, { x: 2, y: 2 })
  ).toBeTruthy();
  expect(
    testBasic(false, s, { x: w / 2, y: w / 2 }, { x: 0.5, y: 0.5 })
  ).toBeTruthy();

  expect(
    testOverride(
      false,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      false,
      s,
      { x: 400, y: 400 },
      { width: 400, height: 300 },
      { x: 1, y: 1 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      false,
      s,
      { x: 200, y: 200 },
      { width: 400, height: 300 },
      { x: 0.5, y: 0.5 }
    )
  ).toBeTruthy();

  // Make absolute
  expect(testBasic(true, s, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeTruthy();
  expect(testBasic(true, s, { x: 1, y: 1 }, { x: w, y: w })).toBeTruthy();
  expect(
    testBasic(true, s, { x: 0.5, y: 0.5 }, { x: w / 2, y: w / 2 })
  ).toBeTruthy();
  expect(
    testBasic(true, s, { x: 2, y: 2 }, { x: w * 2, y: w * 2 })
  ).toBeTruthy();

  expect(
    testOverride(
      true,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 1, y: 1 },
      { width: 400, height: 300 },
      { x: 400, y: 400 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 0.5, y: 0.5 },
      { width: 400, height: 300 },
      { x: 200, y: 200 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 2, y: 2 },
      { width: 400, height: 300 },
      { x: 800, y: 800 }
    )
  ).toBeTruthy();
});

test(`width`, () => {
  const w = 800;
  const h = 600;

  const s = Scaler.scaler(`width`, { width: w, height: h });

  // Make relative
  expect(testBasic(false, s, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeTruthy();
  expect(testBasic(false, s, { x: w, y: w }, { x: 1, y: 1 })).toBeTruthy();
  expect(
    testBasic(false, s, { x: 2 * w, y: 2 * w }, { x: 2, y: 2 })
  ).toBeTruthy();
  expect(
    testBasic(false, s, { x: w / 2, y: w / 2 }, { x: 0.5, y: 0.5 })
  ).toBeTruthy();

  expect(
    testOverride(
      false,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      false,
      s,
      { x: 400, y: 400 },
      { width: 400, height: 300 },
      { x: 1, y: 1 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      false,
      s,
      { x: 200, y: 200 },
      { width: 400, height: 300 },
      { x: 0.5, y: 0.5 }
    )
  ).toBeTruthy();

  // Make absolute
  expect(testBasic(true, s, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeTruthy();
  expect(testBasic(true, s, { x: 1, y: 1 }, { x: w, y: w })).toBeTruthy();
  expect(
    testBasic(true, s, { x: 0.5, y: 0.5 }, { x: w / 2, y: w / 2 })
  ).toBeTruthy();
  expect(
    testBasic(true, s, { x: 2, y: 2 }, { x: w * 2, y: w * 2 })
  ).toBeTruthy();

  expect(
    testOverride(
      true,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 1, y: 1 },
      { width: 400, height: 300 },
      { x: 400, y: 400 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 0.5, y: 0.5 },
      { width: 400, height: 300 },
      { x: 200, y: 200 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 2, y: 2 },
      { width: 400, height: 300 },
      { x: 800, y: 800 }
    )
  ).toBeTruthy();
});

test(`both`, () => {
  const w = 800;
  const h = 600;

  const s = Scaler.scaler(`both`, { width: w, height: h });

  // Make relative
  expect(testBasic(false, s, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeTruthy();
  expect(testBasic(false, s, { x: w, y: h }, { x: 1, y: 1 })).toBeTruthy();
  expect(
    testBasic(false, s, { x: 2 * w, y: 2 * h }, { x: 2, y: 2 })
  ).toBeTruthy();
  expect(
    testBasic(false, s, { x: w / 2, y: h / 2 }, { x: 0.5, y: 0.5 })
  ).toBeTruthy();

  expect(
    testOverride(
      false,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      false,
      s,
      { x: 400, y: 300 },
      { width: 400, height: 300 },
      { x: 1, y: 1 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      false,
      s,
      { x: 200, y: 150 },
      { width: 400, height: 300 },
      { x: 0.5, y: 0.5 }
    )
  ).toBeTruthy();

  // Make absolute
  expect(testBasic(true, s, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeTruthy();
  expect(testBasic(true, s, { x: 1, y: 1 }, { x: w, y: h })).toBeTruthy();
  expect(
    testBasic(true, s, { x: 0.5, y: 0.5 }, { x: w / 2, y: h / 2 })
  ).toBeTruthy();
  expect(
    testBasic(true, s, { x: 2, y: 2 }, { x: w * 2, y: h * 2 })
  ).toBeTruthy();

  expect(
    testOverride(
      true,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 1, y: 1 },
      { width: 400, height: 300 },
      { x: 400, y: 300 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 0.5, y: 0.5 },
      { width: 400, height: 300 },
      { x: 200, y: 150 }
    )
  ).toBeTruthy();
  expect(
    testOverride(
      true,
      s,
      { x: 2, y: 2 },
      { width: 400, height: 300 },
      { x: 800, y: 600 }
    )
  ).toBeTruthy();
});
