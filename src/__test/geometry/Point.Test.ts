import test, { type ExecutionContext } from 'ava';

import * as Points from '../../geometry/Point.js';

function closeTo(t: ExecutionContext<unknown>, input: number, target: number, percent: number = 0.001) {
  const diff = (Math.abs(target - input) / target);
  if (target === input) return;
  if (diff <= percent) return;
  t.fail(`Value: ${ input } target: ${ target } diff%: ${ diff * 100 }`);
}

test(`withinRange`, t => {

  t.true(Points.withinRange({ x: -1, y: -1 }, Points.Empty, 1));
  t.true(Points.withinRange({ x: 1, y: 1 }, Points.Empty, 1));
  t.false(Points.withinRange({ x: 1, y: 1 }, Points.Empty, 0));
  t.false(Points.withinRange({ x: 2, y: 2 }, Points.Empty, 1));

  // Both coords have to be within range
  t.false(Points.withinRange({ x: 1, y: 1 }, { x: 100, y: 1 }, 1));
  t.false(Points.withinRange({ x: 1, y: 1 }, { x: 1, y: 100 }, 1));

  t.true(Points.withinRange({ x: 100, y: 100 }, { x: 101, y: 101 }, 1));
  t.true(Points.withinRange({ x: 100, y: 100 }, { x: 105, y: 101 }, { x: 5, y: 1 }));
  t.false(Points.withinRange({ x: 100, y: 100 }, { x: 105, y: 105 }, { x: 5, y: 1 }));

  // With point as range
  t.true(Points.withinRange(Points.Empty, Points.Empty, Points.Empty));
  t.true(Points.withinRange(Points.Empty, { x: 1, y: 100 }, { x: 1, y: 100 }));

  t.throws(() => Points.withinRange(Points.Empty, Points.Placeholder, 1));
  // @ts-expect-error
  t.throws(() => Points.withinRange(Points.Empty, Points.Empty, false));
  t.throws(() => Points.withinRange(Points.Empty, Points.Empty, Number.NaN));
  // @ts-expect-error
  t.throws(() => Points.withinRange({}, Points.Empty, 1));
  // @ts-expect-error
  t.throws(() => Points.withinRange(Points.Empty, {}, 1));


});

test(`normalise`, t => {
  // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
  t.like(Points.normalise({ x: 5, y: 2 }), { x: 0.9284766908852594, y: 0.3713906763541037 });
  t.like(Points.normalise({ x: -5, y: 2 }), { x: -0.9284766908852594, y: 0.3713906763541037 });
  t.like(Points.normalise({ x: 5, y: -2 }), { x: 0.9284766908852594, y: -0.3713906763541037 });
  t.pass();
});

test(`normaliseByRect`, t => {
  t.like(Points.normaliseByRect(100, 100, 100, 100), { x: 1, y: 1 });
  t.like(Points.normaliseByRect(0, 0, 100, 100), { x: 0, y: 0 });
  t.like(Points.normaliseByRect(50, 50, 100, 100), { x: 0.5, y: 0.5 });

  t.like(Points.normaliseByRect(200, 50, 100, 100), { x: 2, y: 0.5 });
  t.like(Points.normaliseByRect(50, 200, 100, 100), { x: 0.5, y: 2 });

  t.like(Points.normaliseByRect({ x: 100, y: 100 }, 100, 100), { x: 1, y: 1 });
  t.like(Points.normaliseByRect({ x: 0, y: 0 }, 100, 100), { x: 0, y: 0 });
  t.like(Points.normaliseByRect({ x: 50, y: 50 }, 100, 100), { x: 0.5, y: 0.5 });
});

test(`wrap`, t => {
  // Within range
  t.like(Points.wrap({ x: 0, y: 0 }, { x: 100, y: 100 }), { x: 0, y: 0 });

  t.like(Points.wrap({ x: 50, y: 50 }, { x: 100, y: 100 }), { x: 50, y: 50 });
  t.like(Points.wrap({ x: 99, y: 99 }, { x: 100, y: 100 }), { x: 99, y: 99 });

  // On the boundary
  t.like(Points.wrap({ x: 100, y: 100 }, { x: 100, y: 100 }), { x: 0, y: 0 });

  // Wrapped x
  t.like(Points.wrap({ x: 150, y: 99 }, { x: 100, y: 100 }), { x: 50, y: 99 });
  t.like(Points.wrap({ x: -50, y: 99 }, { x: 100, y: 100 }), { x: 50, y: 99 });

  // Wrapped y
  t.like(Points.wrap({ x: 50, y: 150 }, { x: 100, y: 100 }), { x: 50, y: 50 });
  t.like(Points.wrap({ x: 50, y: -50 }, { x: 100, y: 100 }), { x: 50, y: 50 });

  // Wrapped x & y
  t.like(Points.wrap({ x: 150, y: 150 }, { x: 100, y: 100 }), { x: 50, y: 50 });

});

test(`clamp`, t => {
  // Within range
  t.like(Points.clamp({ x: 50, y: 50 }, 0, 100), { x: 50, y: 50 });
  t.like(Points.clamp(50, 50, 0, 100), { x: 50, y: 50 });

  t.like(Points.clamp({ x: 100, y: 100 }, 0, 100), { x: 100, y: 100 });
  t.like(Points.clamp(100, 100, 0, 100), { x: 100, y: 100 });

  // Out of range x
  t.like(Points.clamp({ x: 101, y: 100 }, 0, 100), { x: 100, y: 100 });
  t.like(Points.clamp({ x: -1, y: 100 }, 0, 100), { x: 0, y: 100 });

  // Out of range y
  t.like(Points.clamp({ x: 100, y: 101 }, 0, 100), { x: 100, y: 100 });
  t.like(Points.clamp({ x: 100, y: -1 }, 0, 100), { x: 100, y: 0 });

});

test(`clampMagnitude`, t => {
  const pt = { x: 100, y: 100 };
  const distance = Points.distance(pt);

  t.like(Points.clampMagnitude(pt, distance), pt);

  const half = Points.clampMagnitude(pt, distance / 2);
  t.is(Points.distance(half), distance / 2);


  const double = Points.clampMagnitude(pt, distance * 2, distance * 2);
  t.is(Points.distance(double), distance * 2);


});
test(`length`, t => {
  // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
  closeTo(t, Points.distance({ x: 5, y: 2 }), 5.385164807134504);
  closeTo(t, Points.distance({ x: -5, y: 2 }), 5.385164807134504);
  closeTo(t, Points.distance({ x: 5, y: -2 }), 5.385164807134504);
  t.pass();
});

test(`angle`, t => {
  // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
  closeTo(t, Points.angle({ x: 0, y: 10 }), 1.5708); // 90 degrees
  closeTo(t, Points.angle({ x: 10, y: 0 }), 0); // 0 degrees
  closeTo(t, Points.angle({ x: 2, y: 5 }), 1.190290375284613456); // 68 degrees
  t.pass();
});

test(`divide`, t => {
  t.like(Points.divide({ x: 5, y: 10 }, 2), { x: 2.5, y: 5 });
  t.like(Points.divide({ x: 10, y: 5 }, { x: 5, y: 2 }), { x: 2, y: 2.5 });
  t.like(Points.divide({ x: 10, y: 5 }, 5, 2), { x: 2, y: 2.5 });

  // A contains 0
  t.like(Points.divide({ x: 0, y: 5 }, { x: 5, y: 2 }), { x: 0, y: 2.5 });
  t.like(Points.divide({ x: 10, y: 0 }, 5, 2), { x: 2, y: 0 });

  // Should not throw if a contains a zero
  // expect(() => Points.divide({x: 0, y: 5}, 1, 11)).toThrow();
  // expect(() => Points.divide({x: 10, y: 0}, 1, 1)).toThrow();

  // B contains zero
  t.like(Points.divide({ x: 10, y: 5 }, { x: 0, y: 10 }), { x: Infinity, y: 0.5 });
  t.like(Points.divide({ x: 10, y: 5 }, { x: 10, y: 0 }), { x: 1, y: Infinity });
  t.throws(() => Points.divide({ x: 10, y: 5 }, 0, 10));
  t.throws(() => Points.divide({ x: 10, y: 5 }, 10, 0));

  // B contains NaN
  t.throws(() => Points.divide({ x: 10, y: 5 }, NaN, 2));
  t.throws(() => Points.divide({ x: 10, y: 5 }, 2, NaN));
  t.pass();
});


test(`multiply`, t => {
  t.like(Points.multiply({ x: 5, y: 10 }, 2), { x: 10, y: 20 });

  t.like(Points.multiply({ x: 2, y: 3 }, { x: 0.5, y: 2 }), { x: 1, y: 6 });
  t.like(Points.multiply({ x: 2, y: 3 }, 0.5, 2), { x: 1, y: 6 });

  t.like(Points.multiply({ x: 2, y: 3 }, 0, 2), { x: 0, y: 6 });
  t.like(Points.multiply({ x: 2, y: 3 }, 2, 0), { x: 4, y: 0 });

  t.throws(() => Points.multiply({ x: 10, y: 5 }, NaN, 2));
  t.throws(() => Points.multiply({ x: 10, y: 5 }, 2, NaN));
  t.pass();
});

test(`sum`, t => {
  t.like(Points.sum({ x: 5, y: 10 }, 1), { x: 6, y: 11 });

  t.like(Points.sum(5, 10, 1, 2), { x: 6, y: 12 });
  t.like(Points.sum(1, 2, 0, 0), { x: 1, y: 2 });

  t.like(Points.sum({ x: 5, y: 10 }, -1, -2), { x: 4, y: 8 });
  t.like(Points.sum({ x: 5, y: 10 }, { x: 1, y: 2 }), { x: 6, y: 12 });


  t.throws(() => Points.sum(NaN, 2, 0, 0));
  t.throws(() => Points.sum(1, NaN, 0, 0));
  t.throws(() => Points.sum(1, 2, NaN, 0));
  t.throws(() => Points.sum(1, 2, 0, NaN));
  t.pass();
});

test(`compareByX`, t => {
  t.true(Points.compareByX({ x: 100, y: 0 }, { x: 50, y: 0 }) > 0);
  t.true(Points.compareByX({ x: 10, y: 0 }, { x: 10, y: 0 }) === 0);
  t.true(Points.compareByX({ x: 60, y: 0 }, { x: 50, y: 0 }) > 0);
  t.true(Points.compareByX({ x: -100, y: 0 }, { x: 50, y: 0 }) < 0);
  t.true(Points.compareByX({ x: 0, y: 0 }, { x: 50, y: 0 }) < 0);

  t.pass();
});

test(`subtract`, t => {
  t.like(Points.subtract({ x: 5, y: 10 }, 1), { x: 4, y: 9 });

  t.like(Points.subtract(5, 10, 1, 2), { x: 4, y: 8 });
  t.like(Points.subtract(1, 2, 0, 0), { x: 1, y: 2 });

  t.like(Points.subtract({ x: 5, y: 10 }, -1, -2), { x: 6, y: 12 });
  t.like(Points.subtract({ x: 5, y: 10 }, { x: 1, y: 2 }), { x: 4, y: 8 });

  t.throws(() => Points.subtract(NaN, 2, 0, 0));
  t.throws(() => Points.subtract(1, NaN, 0, 0));
  t.throws(() => Points.subtract(1, 2, NaN, 0));
  t.throws(() => Points.subtract(1, 2, 0, NaN));
  t.pass();
});


test('divideFn', t => {
  let f = Points.divider(100, 200);
  t.like(f(50, 100), { x: 0.5, y: 0.5 });
  t.like(f({ x: 50, y: 100 }), { x: 0.5, y: 0.5 });
  t.like(f([ 50, 100 ]), { x: 0.5, y: 0.5 });

  f = Points.divider([ 100, 200 ]);
  t.like(f(50, 100), { x: 0.5, y: 0.5 });
  t.like(f({ x: 50, y: 100 }), { x: 0.5, y: 0.5 });
  t.like(f([ 50, 100 ]), { x: 0.5, y: 0.5 });

  f = Points.divider({ x: 100, y: 200 });
  t.like(f(50, 100), { x: 0.5, y: 0.5 });
  t.like(f({ x: 50, y: 100 }), { x: 0.5, y: 0.5 });
  t.like(f([ 50, 100 ]), { x: 0.5, y: 0.5 });

  // Empty array == {x:0, y:0}
  t.like(f([]), { x: 0, y: 0 });

  // Dodgy input
  t.throws(() => Points.divider(0, 1));
  t.throws(() => Points.divider(1, 0));
  t.throws(() => Points.divider(1, 1, 0));
  t.throws(() => Points.divider({ x: 1, y: 0 }));
  t.throws(() => Points.divider({ x: 0, y: 1 }));
  t.throws(() => Points.divider(Number.NaN, Number.NaN));

  // Incorrect array length
  t.throws(() => Points.divider([]));
  t.throws(() => Points.divider([ 1, 2, 3, 4 ]));


  const f2 = Points.divider({ x: 100, y: 200 });

  t.throws(() => f2(Number.NaN));
  t.throws(() => f2([ 1, 2, 3, 4 ]));

  // @ts-ignore
  t.throws(() => f2({ x: 0, b: 2 }));

  t.pass();
});