import test, { type ExecutionContext } from 'ava';

import * as Points from '../../geometry/point/index.js';
import { divide, divider } from '../../geometry/point/Divider.js';
import { isApprox } from '../../numbers/IsApprox.js';
import { radianToDegree } from '../../geometry/Angles.js';

function closeTo(t: ExecutionContext<unknown>, input: number, target: number, percent: number = 0.001) {
  const diff = (Math.abs(target - input) / target);
  if (target === input) return;
  if (diff <= percent) return;
  t.fail(`Value: ${ input } target: ${ target } diff%: ${ diff * 100 }`);
}

test(`angleRadianCircle`, t => {
  t.is(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: 1, y: 1 })), 45);
  t.is(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: -1, y: -1 })), 225);
  t.is(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: 1, y: 0 })), 0);
  t.is(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: -1, y: 1 })), 135);
  t.is(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: 1, y: -1 })), 315);
  t.is(radianToDegree(Points.angleRadianCircle({ x: 0, y: 0 }, { x: 0, y: 1 })), 90);


});


test(`abs`, t => {
  t.deepEqual(Points.abs({ x: 1, y: 2 }), { x: 1, y: 2 });
  t.deepEqual(Points.abs({ x: -1, y: 2 }), { x: 1, y: 2 });
  t.deepEqual(Points.abs({ x: 1, y: -2 }), { x: 1, y: 2 });

  t.deepEqual(Points.abs({ x: 1, y: 2, z: 3 }), { x: 1, y: 2, z: 3 });
  t.deepEqual(Points.abs({ x: -1, y: 2, z: 3 }), { x: 1, y: 2, z: 3 });
  t.deepEqual(Points.abs({ x: 1, y: -2, z: 3 }), { x: 1, y: 2, z: 3 });
});

test(`apply`, t => {
  const f = (v: number, field: string) => {
    if (field === `x`) return v * 2;
    if (field === `y`) return v * 3;
    if (field === `z`) return v * 10;
    return v;
  }

  t.deepEqual(Points.apply({ x: 1, y: 2, z: 3 }, f), { x: 2, y: 6, z: 30 });
  t.deepEqual(Points.apply({ x: 1, y: 2 }, f), { x: 2, y: 6 });
});


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

test(`round`, t => {
  t.like(Points.round({ x: 1.12345, y: 2.6789 }, 2), { x: 1.12, y: 2.67 });
  t.like(Points.round({ x: -1.12345, y: -2.6789 }, 2), { x: -1.13, y: -2.68 });

  // x,y separate
  t.like(Points.round(1.12345, 2.6789, 2), { x: 1.12, y: 2.67 });

  // with data
  // @ts-expect-error
  t.like(Points.round({ x: 1.12345, y: 2.6789, colour: `red` }, 2), { x: 1.12, y: 2.67, colour: `red` });

})

test(`normalise`, t => {
  // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
  t.like(Points.round(Points.normalise({ x: 5, y: 2 }), 2), { x: 0.92, y: 0.37 });
  t.like(Points.round(Points.normalise({ x: -5, y: 2 }), 2), { x: -0.93, y: 0.37 });
  t.like(Points.round(Points.normalise({ x: 5, y: -2 }), 2), { x: 0.92, y: -0.38 });
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

test(`placeholder`, t => {
  t.true(Points.isPlaceholder(Points.Placeholder));
  t.true(Points.isPlaceholder(Points.Placeholder3d));
  t.true(Points.isPlaceholder({ x: Number.NaN, y: Number.NaN }));
  t.true(Points.isPlaceholder({ x: Number.NaN, y: Number.NaN, z: Number.NaN }));
  t.false(Points.isPlaceholder({ x: Number.NaN, y: 1 }));
  t.false(Points.isPlaceholder({ x: 1, y: Number.NaN }));
  t.false(Points.isPlaceholder({ x: Number.NaN, y: Number.NaN, z: 1 }));
  t.false(Points.isPlaceholder({ x: 0, y: Number.NaN, z: Number.NaN }));
  t.false(Points.isPlaceholder({ x: Number.NaN, y: 0, z: Number.NaN }));

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
  t.like(Points.clamp({ x: 10, y: 20 }, 0, 100), { x: 10, y: 20 });
  t.like(Points.clamp({ x: 10, y: 20, z: 30 }, 0, 100), { x: 10, y: 20, z: 30 });

  t.like(Points.clamp({ x: 100, y: 100 }, 0, 100), { x: 100, y: 100 });
  t.like(Points.clamp({ x: 100, y: 100, z: 100 }, 0, 100), { x: 100, y: 100, z: 100 });

  // Out of range x
  t.like(Points.clamp({ x: 101, y: 100 }, 0, 100), { x: 100, y: 100 });
  t.like(Points.clamp({ x: -1, y: 100 }, 0, 100), { x: 0, y: 100 });

  // Out of range y
  t.like(Points.clamp({ x: 100, y: 101 }, 0, 100), { x: 100, y: 100 });
  t.like(Points.clamp({ x: 100, y: -1 }, 0, 100), { x: 100, y: 0 });

  // Out of range z
  t.like(Points.clamp({ x: 10, y: 20, z: 101 }, 0, 100), { x: 10, y: 20, z: 100 });
  t.like(Points.clamp({ x: 10, y: 20, z: -1 }, 0, 100), { x: 10, y: 20, z: 0 });


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

test(`distance`, t => {
  // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
  const approx = isApprox(0.001);
  t.true(approx(Points.distance({ x: 5, y: 2 }), 5.385164807134504))
  t.true(approx(Points.distance({ x: -5, y: 2 }), 5.385164807134504));
  t.true(approx(Points.distance({ x: 5, y: -2 }), 5.385164807134504));

  // Expected results from: https://www.calculatorsoup.com/calculators/geometry-solids/distance-two-points.php
  t.true(approx(Points.distance({ x: 7, y: 4, z: 3 }, { x: 17, y: 6, z: 2 }), 10.246));
  t.true(approx(Points.distance({ x: 0, y: 0, z: 0 }, { x: 17, y: 6, z: 2 }), 18.138));
  t.true(approx(Points.distance({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }), 0));
  t.true(approx(Points.distance({ x: 35, y: 10, z: 90 }, { x: -30, y: -12, z: -20 }), 129.649));

  t.pass();
});

test(`angleRadian`, t => {
  // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
  closeTo(t, Points.angleRadian({ x: 0, y: 10 }), 1.5708); // 90 degrees
  closeTo(t, Points.angleRadian({ x: 10, y: 0 }), 0); // 0 degrees
  closeTo(t, Points.angleRadian({ x: 2, y: 5 }), 1.190290375284613456); // 68 degrees
  t.pass();
});

test(`divide`, t => {
  t.like(divide({ x: 5, y: 10 }, 2, 2), { x: 2.5, y: 5 });
  t.like(divide({ x: 10, y: 5 }, { x: 5, y: 2 }), { x: 2, y: 2.5 });
  t.like(divide({ x: 10, y: 5 }, 5, 2), { x: 2, y: 2.5 });

  // A contains 0
  t.like(divide({ x: 0, y: 5 }, { x: 5, y: 2 }), { x: 0, y: 2.5 });
  t.like(divide({ x: 10, y: 0 }, 5, 2), { x: 2, y: 0 });

  // Should not throw if a contains a zero
  // expect(() => divide({x: 0, y: 5}, 1, 11)).toThrow();
  // expect(() => divide({x: 10, y: 0}, 1, 1)).toThrow();

  // B contains zero
  t.throws(() => t.like(divide({ x: 10, y: 5 }, { x: 0, y: 10 }), { x: Infinity, y: 0.5 }));
  t.throws(() => t.like(divide({ x: 10, y: 5 }, { x: 10, y: 0 }), { x: 1, y: Infinity }));
  t.throws(() => divide({ x: 10, y: 5 }, 0, 10));
  t.throws(() => divide({ x: 10, y: 5 }, 10, 0));

  // B contains NaN
  t.throws(() => divide({ x: 10, y: 5 }, NaN, 2));
  t.throws(() => divide({ x: 10, y: 5 }, 2, NaN));
  t.pass();
});

test(`empty`, t => {
  t.true(Points.isEmpty(Points.Empty));
  t.true(Points.isEmpty(Points.Empty3d));
  t.true(Points.isEmpty({ x: 0, y: 0 }));
  t.true(Points.isEmpty({ x: 0, y: 0, z: 0 }));

  t.false(Points.isEmpty(Points.Placeholder));
  t.false(Points.isEmpty({ x: 0, y: 1 }));
  t.false(Points.isEmpty({ x: 1, y: 0 }));
  t.false(Points.isEmpty({ x: 0, y: 0, z: 1 }));
});

test(`from`, t => {
  t.deepEqual(Points.from([ 10, 5 ]), { x: 10, y: 5 });
  t.deepEqual(Points.from(10, 5), { x: 10, y: 5 });

  t.deepEqual(Points.from([ 10, 5, 2 ]), { x: 10, y: 5, z: 2 });
  t.deepEqual(Points.from(10, 5, 2), { x: 10, y: 5, z: 2 });

  // @ts-ignore
  t.throws(() => Points.from());
  // @ts-ignore
  t.throws(() => Points.from(10));
  // @ts-ignore
  t.throws(() => Points.from([ 10 ]));
  // @ts-ignore
  t.throws(() => Points.from([]));


})
test(`multiply`, t => {
  t.deepEqual(Points.multiply({ x: 5, y: 10 }, 2, 3), { x: 10, y: 30 });
  t.deepEqual(Points.multiply({ x: 5, y: 10, z: 15 }, 2, 3, 4), { x: 10, y: 30, z: 60 });

  t.deepEqual(Points.multiply({ x: 2, y: 3 }, { x: 0.5, y: 2 }), { x: 1, y: 6 });
  t.deepEqual(Points.multiply({ x: 2, y: 3 }, 0.5, 2), { x: 1, y: 6 });
  t.deepEqual(Points.multiply({ x: 5, y: 10, z: 15 }, { x: 2, y: 3, z: 4 }), { x: 10, y: 30, z: 60 });

  t.deepEqual(Points.multiply({ x: 2, y: 3 }, 0, 2), { x: 0, y: 6 });
  t.deepEqual(Points.multiply({ x: 2, y: 3 }, 2, 0), { x: 4, y: 0 });

  t.throws(() => Points.multiply({ x: 10, y: 5 }, NaN, 2));
  t.throws(() => Points.multiply({ x: 10, y: 5 }, 2, NaN));
  t.pass();
});

test(`quantise`, t => {
  t.deepEqual(Points.quantiseEvery({ x: 0, y: 0.1 }, { x: 0.1, y: 0.1 }), { x: 0, y: 0.1 });
  t.deepEqual(Points.quantiseEvery({ x: 0, y: 0.123 }, { x: 0.1, y: 0.1 }), { x: 0, y: 0.1 });
  t.deepEqual(Points.quantiseEvery({ x: 0.1, y: 0.18 }, { x: 0.1, y: 0.1 }), { x: 0.1, y: 0.2 });

  t.deepEqual(Points.quantiseEvery({ x: 0.5, y: 0.123 }, { x: 0.5, y: 0.1 }), { x: 0.5, y: 0.1 });
  t.deepEqual(Points.quantiseEvery({ x: 0.9, y: 0.123 }, { x: 0.5, y: 0.1 }), { x: 1, y: 0.1 });

  t.deepEqual(Points.quantiseEvery({ x: 0.9, y: 0.1, z: 0.123 }, { x: 0.5, y: 0.1, z: 0.1 }), { x: 1, y: 0.1, z: 0.1 });

});

test(`sum`, t => {
  t.like(Points.sum({ x: 5, y: 10 }, 1, 2), { x: 6, y: 12 });
  t.like(Points.sum({ x: 5, y: 10, z: 15 }, 1, 2, 3), { x: 6, y: 12, z: 18 });

  t.like(Points.sum(5, 10, 1, 2), { x: 6, y: 12 });
  t.like(Points.sum(5, 10, 15, 1, 2, 3), { x: 6, y: 12, z: 18 });
  t.like(Points.sum(1, 2, 0, 0), { x: 1, y: 2 });

  t.like(Points.sum({ x: 5, y: 10 }, -1, -2), { x: 4, y: 8 });
  t.like(Points.sum({ x: 5, y: 10, z: 15 }, -1, -2, -3), { x: 4, y: 8, z: 12 });
  t.like(Points.sum({ x: 5, y: 10 }, { x: 1, y: 2 }), { x: 6, y: 12 });

  t.deepEqual(Points.sum({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 }), { x: 5, y: 7, z: 9 });
  t.deepEqual(Points.sum(1, 2, 3, 4, 5, 6), { x: 5, y: 7, z: 9 });
  t.deepEqual(Points.sum(1, 2, 3, 4), { x: 4, y: 6 });

  t.throws(() => Points.sum(NaN, 2, 0, 0));
  t.throws(() => Points.sum(1, NaN, 0, 0));
  t.throws(() => Points.sum(1, 2, NaN, 0));
  t.throws(() => Points.sum(1, 2, 0, NaN));
  t.pass();
});

test(`compareByX`, t => {
  t.is(Points.compareByX({ x: 10, y: 100 }, { x: 10, y: 200 }), 0);
  t.true(Points.compareByX({ x: 100, y: 0 }, { x: 50, y: 0 }) > 0);
  t.true(Points.compareByX({ x: 10, y: 0 }, { x: 10, y: 0 }) === 0);
  t.true(Points.compareByX({ x: 60, y: 0 }, { x: 50, y: 0 }) > 0);
  t.true(Points.compareByX({ x: -100, y: 0 }, { x: 50, y: 0 }) < 0);
  t.true(Points.compareByX({ x: 0, y: 0 }, { x: 50, y: 0 }) < 0);
});

test(`compareByY`, t => {
  t.is(Points.compareByY({ x: 100, y: 1 }, { x: 1000, y: 1 }), 0);
  t.true(Points.compareByY({ y: 100, x: 0 }, { y: 50, x: 0 }) > 0);
  t.true(Points.compareByY({ y: 10, x: 0 }, { y: 10, x: 0 }) === 0);
  t.true(Points.compareByY({ y: 60, x: 0 }, { y: 50, x: 0 }) > 0);
  t.true(Points.compareByY({ y: -100, x: 0 }, { y: 50, x: 0 }) < 0);
  t.true(Points.compareByY({ y: 0, x: 0 }, { y: 50, x: 0 }) < 0);
});

test(`subtract`, t => {
  t.deepEqual(Points.subtract({ x: 5, y: 10 }, 1, 2), { x: 4, y: 8 });
  t.deepEqual(Points.subtract({ x: 5, y: 10, z: 15 }, 1, 2, 3), { x: 4, y: 8, z: 12 });

  t.deepEqual(Points.subtract(5, 10, 1, 2), { x: 4, y: 8 });
  t.deepEqual(Points.subtract(5, 10, 15, 1, 2, 3), { x: 4, y: 8, z: 12 });
  t.deepEqual(Points.subtract(1, 2, 0, 0), { x: 1, y: 2 });

  t.deepEqual(Points.subtract({ x: 5, y: 10 }, -1, -2), { x: 6, y: 12 });
  t.deepEqual(Points.subtract({ x: 5, y: 10 }, { x: 1, y: 2 }), { x: 4, y: 8 });
  t.deepEqual(Points.subtract({ x: 5, y: 10, z: 15 }, { x: 1, y: 2, z: 3 }), { x: 4, y: 8, z: 12 });

  t.throws(() => Points.subtract(NaN, 2, 0, 0));
  t.throws(() => Points.subtract(1, NaN, 0, 0));
  t.throws(() => Points.subtract(1, 2, NaN, 0));
  t.throws(() => Points.subtract(1, 2, 0, NaN));
  t.pass();
});


test('divideFn', t => {
  let f = divider(100, 200);
  t.like(f(50, 100), { x: 0.5, y: 0.5 });
  t.like(f({ x: 50, y: 100 }), { x: 0.5, y: 0.5 });
  t.like(f([ 50, 100 ]), { x: 0.5, y: 0.5 });

  f = divider([ 100, 200 ]);
  t.like(f(50, 100), { x: 0.5, y: 0.5 });
  t.like(f({ x: 50, y: 100 }), { x: 0.5, y: 0.5 });
  t.like(f([ 50, 100 ]), { x: 0.5, y: 0.5 });

  f = divider({ x: 100, y: 200 });
  t.like(f(50, 100), { x: 0.5, y: 0.5 });
  t.like(f({ x: 50, y: 100 }), { x: 0.5, y: 0.5 });
  t.like(f([ 50, 100 ]), { x: 0.5, y: 0.5 });

  // Empty array == {x:0, y:0}
  t.like(f([]), { x: 0, y: 0 });

  // Dodgy input
  t.throws(() => divider(0, 1));
  t.throws(() => divider(1, 0));
  t.throws(() => divider(1, 1, 0));
  t.throws(() => divider({ x: 1, y: 0 }));
  t.throws(() => divider({ x: 0, y: 1 }));
  t.throws(() => divider(Number.NaN, Number.NaN));

  // Incorrect array length
  t.throws(() => divider([]));
  t.throws(() => divider([ 1, 2, 3, 4 ]));


  const f2 = divider({ x: 100, y: 200 });

  t.throws(() => f2(Number.NaN));
  t.throws(() => f2([ 1, 2, 3, 4 ]));

  // @ts-ignore
  t.throws(() => f2({ x: 0, b: 2 }));

  t.pass();
});

test(`getTwoPointParams`, t => {
  let r = Points.getTwoPointParameters({ x: 1, y: 2 }, { x: 3, y: 4 });
  t.deepEqual(r, [ { x: 1, y: 2 }, { x: 3, y: 4 } ]);

  r = Points.getTwoPointParameters({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 });
  t.deepEqual(r, [ { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } ]);

  r = Points.getTwoPointParameters({ x: 1, y: 2 }, 3, 4);
  t.deepEqual(r, [ { x: 1, y: 2 }, { x: 3, y: 4 } ]);

  r = Points.getTwoPointParameters({ x: 1, y: 2, z: 3 }, 4, 5, 6);
  t.deepEqual(r, [ { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } ]);

  r = Points.getTwoPointParameters(1, 2, 3, 4, 5, 6);
  t.deepEqual(r, [ { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } ]);

  r = Points.getTwoPointParameters(1, 2, 3, 4);
  t.deepEqual(r, [ { x: 1, y: 2 }, { x: 3, y: 4 } ]);

  // @ts-ignore
  t.throws(() => Points.getTwoPointParameters({ x: 1, y: 2 }));
  // @ts-ignore
  t.throws(() => Points.getTwoPointParameters({ x: 1, y: 2 }, 1));
  // @ts-ignore
  t.throws(() => Points.getTwoPointParameters({ x: 1, y: 2, z: 3 }, 4));

  // @ts-ignore
  t.throws(() => Points.getTwoPointParameters({ x: 1, y: 2, z: 3 }, 4, 5));

  // @ts-ignore
  t.throws(() => Points.getTwoPointParameters());


  // @ts-ignore
  t.throws(() => Points.getTwoPointParameters(1, 2));
  // @ts-ignore
  t.throws(() => Points.getTwoPointParameters(1, 2, 3));

})