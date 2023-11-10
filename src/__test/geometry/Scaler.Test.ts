import test from 'ava';
import { Scaler, Points, Rects } from '../../geometry/index.js';
import type { Point } from '../../geometry/points/Types.js';

const testBasic = (
  abs: boolean,
  scaler: Scaler.Scaler,
  input: Point,
  expected: Point
) => {
  const s = abs ? scaler.abs : scaler.rel;
  const t1 = s(input.x, input.y);
  const t2 = s({ x: input.x, y: input.y });

  if (!testEq(expected, t1)) return false;
  if (!testEq(expected, t2)) return false;

  return true;
};

const testEq = (expected: Point, got: Point) => {
  if (Points.isEqual(expected, got)) return true;
  console.log(
    `got: ${ Points.toString(got) } expected: ${ Points.toString(expected) }`
  );
  return false;
};

const testOverride = (
  abs: boolean,
  scaler: Scaler.Scaler,
  input: Point,
  output: Rects.Rect,
  expected: Point
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

test(`height`, (t) => {
  const w = 800;
  const h = 600;

  const s = Scaler.scaler(`height`, { width: w, height: h });

  // Make relative
  t.true(testBasic(false, s, { x: 0, y: 0 }, { x: 0, y: 0 }));
  t.true(testBasic(false, s, { x: h, y: h }, { x: 1, y: 1 }));
  t.true(
    testBasic(false, s, { x: 2 * h, y: 2 * h }, { x: 2, y: 2 })
  );
  t.true(
    testBasic(false, s, { x: h / 2, y: h / 2 }, { x: 0.5, y: 0.5 })
  );

  t.true(
    testOverride(
      false,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  );
  t.true(
    testOverride(
      false,
      s,
      { x: 300, y: 300 },
      { width: 400, height: 300 },
      { x: 1, y: 1 }
    )
  );
  t.true(
    testOverride(
      false,
      s,
      { x: 150, y: 150 },
      { width: 400, height: 300 },
      { x: 0.5, y: 0.5 }
    )
  );

  // Make absolute
  t.true(testBasic(true, s, { x: 0, y: 0 }, { x: 0, y: 0 }));
  t.true(testBasic(true, s, { x: 1, y: 1 }, { x: h, y: h }));
  t.true(
    testBasic(true, s, { x: 0.5, y: 0.5 }, { x: h / 2, y: h / 2 })
  );
  t.true(
    testBasic(true, s, { x: 2, y: 2 }, { x: h * 2, y: h * 2 })
  );

  t.true(
    testOverride(
      true,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 1, y: 1 },
      { width: 400, height: 300 },
      { x: 300, y: 300 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 0.5, y: 0.5 },
      { width: 400, height: 300 },
      { x: 150, y: 150 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 2, y: 2 },
      { width: 400, height: 300 },
      { x: 600, y: 600 }
    )
  );
});

test(`min`, (t) => {
  const w = 800;
  const h = 600;

  const s = Scaler.scaler(`min`, { width: w, height: h });

  // Make relative
  t.true(testBasic(false, s, { x: 0, y: 0 }, { x: 0, y: 0 }));
  t.true(testBasic(false, s, { x: h, y: h }, { x: 1, y: 1 }));
  t.true(
    testBasic(false, s, { x: 2 * h, y: 2 * h }, { x: 2, y: 2 })
  );
  t.true(
    testBasic(false, s, { x: h / 2, y: h / 2 }, { x: 0.5, y: 0.5 })
  );

  t.true(
    testOverride(
      false,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  );
  t.true(
    testOverride(
      false,
      s,
      { x: 300, y: 300 },
      { width: 400, height: 300 },
      { x: 1, y: 1 }
    )
  );
  t.true(
    testOverride(
      false,
      s,
      { x: 150, y: 150 },
      { width: 400, height: 300 },
      { x: 0.5, y: 0.5 }
    )
  );

  // Make absolute
  t.true(testBasic(true, s, { x: 0, y: 0 }, { x: 0, y: 0 }));
  t.true(testBasic(true, s, { x: 1, y: 1 }, { x: h, y: h }));
  t.true(
    testBasic(true, s, { x: 0.5, y: 0.5 }, { x: h / 2, y: h / 2 })
  );
  t.true(
    testBasic(true, s, { x: 2, y: 2 }, { x: h * 2, y: h * 2 })
  );

  t.true(
    testOverride(
      true,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 1, y: 1 },
      { width: 400, height: 300 },
      { x: 300, y: 300 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 0.5, y: 0.5 },
      { width: 400, height: 300 },
      { x: 150, y: 150 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 2, y: 2 },
      { width: 400, height: 300 },
      { x: 600, y: 600 }
    )
  );
});

test(`max`, (t) => {
  const w = 800;
  const h = 600;

  const s = Scaler.scaler(`max`, { width: w, height: h });

  // Make relative
  t.true(testBasic(false, s, { x: 0, y: 0 }, { x: 0, y: 0 }));
  t.true(testBasic(false, s, { x: w, y: w }, { x: 1, y: 1 }));
  t.true(
    testBasic(false, s, { x: 2 * w, y: 2 * w }, { x: 2, y: 2 })
  );
  t.true(
    testBasic(false, s, { x: w / 2, y: w / 2 }, { x: 0.5, y: 0.5 })
  );

  t.true(
    testOverride(
      false,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  );
  t.true(
    testOverride(
      false,
      s,
      { x: 400, y: 400 },
      { width: 400, height: 300 },
      { x: 1, y: 1 }
    )
  );
  t.true(
    testOverride(
      false,
      s,
      { x: 200, y: 200 },
      { width: 400, height: 300 },
      { x: 0.5, y: 0.5 }
    )
  );

  // Make absolute
  t.true(testBasic(true, s, { x: 0, y: 0 }, { x: 0, y: 0 }));
  t.true(testBasic(true, s, { x: 1, y: 1 }, { x: w, y: w }));
  t.true(
    testBasic(true, s, { x: 0.5, y: 0.5 }, { x: w / 2, y: w / 2 })
  );
  t.true(
    testBasic(true, s, { x: 2, y: 2 }, { x: w * 2, y: w * 2 })
  );

  t.true(
    testOverride(
      true,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 1, y: 1 },
      { width: 400, height: 300 },
      { x: 400, y: 400 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 0.5, y: 0.5 },
      { width: 400, height: 300 },
      { x: 200, y: 200 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 2, y: 2 },
      { width: 400, height: 300 },
      { x: 800, y: 800 }
    )
  );
});

test(`width`, (t) => {
  const w = 800;
  const h = 600;

  const s = Scaler.scaler(`width`, { width: w, height: h });

  // Make relative
  t.true(testBasic(false, s, { x: 0, y: 0 }, { x: 0, y: 0 }));
  t.true(testBasic(false, s, { x: w, y: w }, { x: 1, y: 1 }));
  t.true(
    testBasic(false, s, { x: 2 * w, y: 2 * w }, { x: 2, y: 2 })
  );
  t.true(
    testBasic(false, s, { x: w / 2, y: w / 2 }, { x: 0.5, y: 0.5 })
  );

  t.true(
    testOverride(
      false,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  );
  t.true(
    testOverride(
      false,
      s,
      { x: 400, y: 400 },
      { width: 400, height: 300 },
      { x: 1, y: 1 }
    )
  );
  t.true(
    testOverride(
      false,
      s,
      { x: 200, y: 200 },
      { width: 400, height: 300 },
      { x: 0.5, y: 0.5 }
    )
  );

  // Make absolute
  t.true(testBasic(true, s, { x: 0, y: 0 }, { x: 0, y: 0 }));
  t.true(testBasic(true, s, { x: 1, y: 1 }, { x: w, y: w }));
  t.true(
    testBasic(true, s, { x: 0.5, y: 0.5 }, { x: w / 2, y: w / 2 })
  );
  t.true(
    testBasic(true, s, { x: 2, y: 2 }, { x: w * 2, y: w * 2 })
  );

  t.true(
    testOverride(
      true,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 1, y: 1 },
      { width: 400, height: 300 },
      { x: 400, y: 400 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 0.5, y: 0.5 },
      { width: 400, height: 300 },
      { x: 200, y: 200 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 2, y: 2 },
      { width: 400, height: 300 },
      { x: 800, y: 800 }
    )
  );
});

test(`both`, (t) => {
  const w = 800;
  const h = 600;

  const s = Scaler.scaler(`both`, { width: w, height: h });

  // Make relative
  t.true(testBasic(false, s, { x: 0, y: 0 }, { x: 0, y: 0 }));
  t.true(testBasic(false, s, { x: w, y: h }, { x: 1, y: 1 }));
  t.true(
    testBasic(false, s, { x: 2 * w, y: 2 * h }, { x: 2, y: 2 })
  );
  t.true(
    testBasic(false, s, { x: w / 2, y: h / 2 }, { x: 0.5, y: 0.5 })
  );

  t.true(
    testOverride(
      false,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  );
  t.true(
    testOverride(
      false,
      s,
      { x: 400, y: 300 },
      { width: 400, height: 300 },
      { x: 1, y: 1 }
    )
  );
  t.true(
    testOverride(
      false,
      s,
      { x: 200, y: 150 },
      { width: 400, height: 300 },
      { x: 0.5, y: 0.5 }
    )
  );

  // Make absolute
  t.true(testBasic(true, s, { x: 0, y: 0 }, { x: 0, y: 0 }));
  t.true(testBasic(true, s, { x: 1, y: 1 }, { x: w, y: h }));
  t.true(
    testBasic(true, s, { x: 0.5, y: 0.5 }, { x: w / 2, y: h / 2 })
  );
  t.true(
    testBasic(true, s, { x: 2, y: 2 }, { x: w * 2, y: h * 2 })
  );

  t.true(
    testOverride(
      true,
      s,
      { x: 0, y: 0 },
      { width: 400, height: 300 },
      { x: 0, y: 0 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 1, y: 1 },
      { width: 400, height: 300 },
      { x: 400, y: 300 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 0.5, y: 0.5 },
      { width: 400, height: 300 },
      { x: 200, y: 150 }
    )
  );
  t.true(
    testOverride(
      true,
      s,
      { x: 2, y: 2 },
      { width: 400, height: 300 },
      { x: 800, y: 600 }
    )
  );
});
