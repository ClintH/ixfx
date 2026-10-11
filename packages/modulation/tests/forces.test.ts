import { Points } from '@ixfx/geometry';
import { expect, it } from 'vitest';
import * as Forces from '../src/forces.js';

const close = (a: number, b: number, precision = 6) => expect(a).toBeCloseTo(b, precision);

it(`guard`, () => {
  // Valid shapes do not throw
  Forces.guard({ position: { x: 0, y: 0 } });
  Forces.guard({});
  expect(() => Forces.guard(null as any, `t`)).toThrow();
  expect(() => Forces.guard(`hello` as any, `t`)).toThrow();
});

it(`apply`, () => {
  // Acceleration integrates into velocity, then into position; acceleration is cleared
  const t = Forces.apply(
    { position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
    { x: 0.1, y: -0.2 },
  );
  expect(t.velocity).toEqual({ x: 0.1, y: -0.2 });
  expect(t.position).toEqual({ x: 0.1, y: -0.2 });
  expect(t.acceleration).toEqual(Points.Empty);

  // Null / undefined forces are ignored
  const t2 = Forces.apply({ position: { x: 1, y: 1 } }, null, undefined);
  expect(t2.position).toEqual({ x: 1, y: 1 });

  // Force functions compose
  const t3 = Forces.apply({ position: { x: 0, y: 0 } }, Forces.nullForce, { x: 0.5, y: 0 });
  expect(t3.velocity).toEqual({ x: 0.5, y: 0 });

  expect(() => Forces.apply(undefined as any)).toThrow(`t parameter is undefined`);
});

it(`computeVelocity`, () => {
  expect(Forces.computeVelocity({ x: 1, y: 2 }, { x: 10, y: 20 })).toEqual({ x: 11, y: 22 });
  // velocityMax caps magnitude
  const capped = Forces.computeVelocity({ x: 10, y: 0 }, { x: 0, y: 0 }, 5);
  close(capped.x, 5);
  close(capped.y, 0);
});

it(`computePositionFromVelocity`, () => {
  expect(Forces.computePositionFromVelocity({ x: 1, y: 1 }, { x: 0.5, y: -0.5 })).toEqual({ x: 1.5, y: 0.5 });
});

it(`computePositionFromAngle`, () => {
  const p = Forces.computePositionFromAngle(1, 0, { x: 0, y: 0 });
  close(p.x, 1);
  close(p.y, 0);
  const q = Forces.computePositionFromAngle(2, Math.PI / 2, { x: 10, y: 10 });
  close(q.x, 10);
  close(q.y, 12);
});

it(`accelerationForce`, () => {
  const thing = { mass: 2, acceleration: { x: 1, y: 1 } };

  // 'ignored': vector applied as-is
  const ignored = Forces.accelerationForce({ x: 3, y: 0 })(thing);
  expect(ignored.acceleration).toEqual({ x: 4, y: 1 });

  // 'multiply': vector scaled by mass
  const multiplied = Forces.accelerationForce({ x: 3, y: 0 }, `multiply`)(thing);
  expect(multiplied.acceleration).toEqual({ x: 7, y: 1 });

  // 'dampen': vector divided by mass
  const damped = Forces.accelerationForce({ x: 4, y: 0 }, `dampen`)(thing);
  expect(damped.acceleration).toEqual({ x: 3, y: 1 });

  // Unknown mass mode throws
  expect(() => Forces.accelerationForce({ x: 1, y: 1 }, `wat` as any)(thing)).toThrow();
});

it(`magnitudeForce`, () => {
  // No velocity: thing unaltered
  const still = { position: { x: 0, y: 0 } };
  expect(Forces.magnitudeForce(0.1)(still)).toBe(still);

  // Force opposes velocity, scaled with the square of magnitude
  const moving = { velocity: { x: 2, y: 0 } };
  const dragged = Forces.magnitudeForce(0.1)(moving);
  // normalise(velocity) has magnitude 1 -> magSq = 0.1 * 1 * 1
  close(dragged.acceleration!.x, -0.2);
  close(dragged.acceleration!.y, 0);
});

it(`velocityForce`, () => {
  const moving = { velocity: { x: 2, y: 0 }, mass: 1 };
  const f = Forces.velocityForce(0.1, `ignored`)(moving);
  close(f.acceleration!.x, -0.2);
  close(f.acceleration!.y, 0);

  // No velocity: unaltered
  const still = { position: { x: 0, y: 0 } };
  expect(Forces.velocityForce(0.1, `ignored`)(still)).toBe(still);
});

it(`nullForce`, () => {
  const t = { position: { x: 1, y: 2 } };
  expect(Forces.nullForce(t)).toBe(t);
});

it(`angularForce`, () => {
  const t = { angle: 1, angularVelocity: 0.1, angularAcceleration: 0.05 };
  const r = Forces.angularForce()(t);
  close(r.angularVelocity, 0.15);
  close(r.angle, 1.15);
  // Acceleration is consumed
  expect(r.angularAcceleration).toBe(0);
});

it(`angleFromAccelerationForce`, () => {
  const t = { acceleration: { x: 0.5, y: 10 } };
  const r = Forces.angleFromAccelerationForce()(t);
  close(r.angularAcceleration, 10);
  const scaled = Forces.angleFromAccelerationForce(2)({ acceleration: { x: 3, y: 0 } });
  close(scaled.angularAcceleration, 6);
});

it(`angleFromVelocityForce`, () => {
  // Points right
  const r = Forces.angleFromVelocityForce()({ velocity: { x: 1, y: 0 } });
  close(r.angle, 0);

  // Points up
  const up = Forces.angleFromVelocityForce()({ velocity: { x: 0, y: 2 } });
  close(up.angle, Math.PI / 2);

  // Interpolation: angle moves part-way toward velocity angle. With two
  // equidistant options, interpolateAngle wraps through the positive
  // direction (PI -> 3/2 PI), not the negative one.
  const partial = Forces.angleFromVelocityForce(0.5)({ velocity: { x: 1, y: 0 }, angle: Math.PI });
  close(partial.angle, (3 * Math.PI) / 2);
});

it(`computeAccelerationToTarget`, () => {
  const accel = Forces.computeAccelerationToTarget({ x: 2, y: 4 }, { x: 0, y: 0 });
  expect(accel).toEqual({ x: 0.002, y: 0.004 });

  // Custom diminish
  const custom = Forces.computeAccelerationToTarget({ x: 10, y: 0 }, { x: 0, y: 0 }, { diminishBy: 0.5 });
  expect(custom).toEqual({ x: 5, y: 0 });

  // Within range: no acceleration
  const inRange = Forces.computeAccelerationToTarget({ x: 0.1, y: 0 }, { x: 0, y: 0 }, { range: { x: 0.5, y: 0.5 } });
  expect(inRange).toEqual(Points.Empty);
});

it(`targetForce`, () => {
  const t = Forces.targetForce({ x: 1, y: 1 })({ position: { x: 0, y: 0 } });
  close(t.acceleration!.x, 0.001);
  close(t.acceleration!.y, 0.001);

  // Sums onto existing acceleration
  const withExisting = Forces.targetForce({ x: 1, y: 0 })({ position: { x: 0, y: 0 }, acceleration: { x: 1, y: 1 } });
  close(withExisting.acceleration!.x, 1.001);
});

it(`computeAttractionForce`, () => {
  const attractor = { position: { x: 1, y: 0 }, mass: 1 };
  const attractee = { position: { x: 0, y: 0 }, mass: 1 };

  // Distance of 1 clamps to default max of 0.7; magnitude = gravity / 0.7^2
  const f = Forces.computeAttractionForce(attractor, attractee, 0.1);
  close(f.x, 0.1 / (0.7 * 0.7));
  close(f.y, 0);

  // Force points toward attractor
  const fromOtherSide = Forces.computeAttractionForce({ position: { x: -1, y: 0 }, mass: 1 }, attractee, 0.1);
  expect(fromOtherSide.x).toBeLessThan(0);

  // Mass scales the force
  const heavy = Forces.computeAttractionForce({ ...attractor, mass: 2 }, attractee, 0.1);
  close(heavy.x, f.x * 2);

  // distanceRange overrides the clamp: with max above the real distance, d = 1
  const ranged = Forces.computeAttractionForce(attractor, attractee, 0.1, { min: 0.5, max: 2 });
  close(ranged.x, 0.1);

  // Minimum clamp: attractor nearly on top of attractee
  const closeRange = Forces.computeAttractionForce({ position: { x: 0.0001, y: 0 }, mass: 1 }, attractee, 0.1);
  close(closeRange.x, 0.1 / (0.01 * 0.01));

  // Missing positions throw
  expect(() => Forces.computeAttractionForce({ mass: 1 }, attractee, 0.1)).toThrow(`attractor.position not set`);
  expect(() => Forces.computeAttractionForce(attractor, {}, 0.1)).toThrow(`attractee.position not set`);
});

it(`attractionForce`, () => {
  const origin = { position: { x: 0, y: 0 }, mass: 1 };
  const attractorA = { position: { x: 1, y: 0 }, mass: 1 };
  const attractorB = { position: { x: 0, y: 1 }, mass: 1 };

  // Single attractor matches computeAttractionForce
  const single = Forces.attractionForce([attractorA], 0.1)(origin);
  const singleExpected = Forces.computeAttractionForce(attractorA, origin, 0.1);
  expect(single.acceleration).toEqual(singleExpected);

  // Multiple attractors sum
  const both = Forces.attractionForce([attractorA, attractorB], 0.1)(origin);
  close(both.acceleration!.x, singleExpected.x);
  close(both.acceleration!.y, Forces.computeAttractionForce(attractorB, origin, 0.1).y);

  // Self-attraction is skipped
  const a = Forces.attractionForce([attractorA], 0.1)(attractorA);
  expect(a.acceleration).toEqual(Points.Empty);
});

it(`constrainBounce`, () => {
  const bounds = { width: 1, height: 1 };
  const bounce = Forces.constrainBounce(bounds, 0.5);

  // Within bounds: position integrates velocity
  const inside = bounce({ position: { x: 0.5, y: 0.5 }, velocity: { x: 0.1, y: 0.1 } });
  expect(inside.position).toEqual({ x: 0.6, y: 0.6 });

  // Past right edge: clamped, x velocity inverted and dampened.
  // NB: dampening scales the whole velocity vector, so the untouched
  // y axis is dampened too (implementation quirk).
  const right = bounce({ position: { x: 1.2, y: 0.5 }, velocity: { x: 0.1, y: 0.1 } });
  expect(right.position.x).toBe(1);
  close(right.velocity.x, -0.05);
  close(right.velocity.y, 0.05);

  // Past top edge: clamped, y velocity inverted and dampened
  const top = bounce({ position: { x: 0.5, y: -0.2 }, velocity: { x: 0.1, y: -0.2 } });
  expect(top.position.y).toBe(0);
  close(top.velocity.y, 0.1);
  close(top.velocity.x, 0.05);

  // Bounce integrates position from velocity
  const moving = bounce({ position: { x: 0.9, y: 0.5 }, velocity: { x: 0.2, y: 0 } });
  expect(moving.position.x).toBe(1);
});

it(`constrainWrap`, () => {
  const wrap = Forces.constrainWrap({ width: 1, height: 1 });

  // Within bounds: unchanged
  expect(wrap({ position: { x: 0.5, y: 0.5 } })?.position).toEqual({ x: 0.5, y: 0.5 });

  // Wraps to opposite edge
  expect(wrap({ position: { x: 1.2, y: 0.5 } })?.position?.x).toBeLessThanOrEqual(1);
  expect(wrap({ position: { x: -0.2, y: 0.5 } })?.position?.x).toBeGreaterThanOrEqual(0);
});

it(`springForce`, () => {
  const pinnedAt = { x: 0, y: 0 };

  // At resting length: no acceleration, velocity preserved (minus damping)
  const resting = { position: { x: 0.5, y: 0 }, mass: 1, velocity: { x: 0.1, y: 0 } };
  const atRest = Forces.springForce(pinnedAt, 0.5)(resting);
  close(atRest.velocity!.x, 0.1 * 0.999);
  close(atRest.acceleration!.x, 0);

  // Stretched spring pulls back toward the pin
  const stretched = Forces.springForce(pinnedAt, 0.5, 0.0002)({ position: { x: 1, y: 0 }, mass: 1, velocity: { x: 0, y: 0 } });
  // stretch = 0.5, accel = -k * stretch along the pull direction
  close(stretched.velocity!.x, -0.0002 * 0.5);

  // Damping: at the pin (zero stretch, zero accel) velocity is only damped
  const coasting = Forces.springForce(pinnedAt, 0.5)({ position: pinnedAt, mass: 1, velocity: { x: -0.001, y: 0 } });
  close(coasting.velocity!.x, -0.001 * 0.999);
});

it(`pendulumForce`, () => {
  const pinnedAt = { x: 0, y: 0 };
  const length = 1;

  // Displaced from rest, it swings back toward rest
  const swing = Forces.pendulumForce(pinnedAt, { length })({ angle: 0.5, angularVelocity: 0 });
  const expectedAccel = (-0.001 / length) * Math.sin(0.5);
  close(swing.angularVelocity!, expectedAccel * 0.995);
  close(swing.angle!, 0.5 + expectedAccel);

  // Position is computed at the end of the 'string'
  const pos = swing.position!;
  close(Points.distance(pos, pinnedAt), length);

  // At rest it stays at rest
  const atRest = Forces.pendulumForce(pinnedAt, { length })({ angle: 0, angularVelocity: 0 });
  close(atRest.angularVelocity!, 0);
  close(atRest.angle!, 0);
});

it(`orientationForce`, () => {
  // Moving right: angle follows velocity; angularAcceleration is set from
  // acceleration.x but only integrated on the NEXT application
  const t = Forces.orientationForce()({ velocity: { x: 1, y: 0 }, acceleration: { x: 0.1, y: 0 } });
  expect(t.angle).toBeCloseTo(0, 5);
  expect(t.angularVelocity).toBe(0);
  expect(t.angularAcceleration).toBeCloseTo(2, 5);

  // Second application integrates the angular acceleration
  const t2 = Forces.orientationForce()({ ...t, velocity: { x: 1, y: 0 } });
  expect(t2.angularVelocity).toBeCloseTo(2, 5);

  // With interpolation: angle only partially follows, from a non-zero start
  const partial = Forces.orientationForce(0.5)({ velocity: { x: 1, y: 0 }, acceleration: { x: 0.1, y: 0 }, angle: Math.PI });
  expect(partial.angle).toBeCloseTo((3 * Math.PI) / 2, 5);
});
