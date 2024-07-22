import test from 'ava';
import { immutable, fromScalar, clamp, towardZero } from '../../numbers/Bipolar.js';

test('bipolar', t => {
  const b = immutable(1);

  t.is(+b + 10, 11);

  t.is(immutable(0.5).inverse().value, -0.5);
  t.is(immutable(0.5).add(0.1).value, 0.6);
  t.is(immutable(0.1).multiply(2).value, 0.2);
  t.is(immutable(-1).asScalar(), 0);
  t.is(immutable(0).asScalar(), 0.5);
  t.is(immutable(1).asScalar(), 1);

});

test(`bipolarTowardsZero`, t => {
  t.is(towardZero(-1, 0.1), -0.9);
  t.is(towardZero(1, 0.1), 0.9);
  t.is(towardZero(0, 0.1), 0);
  t.is(towardZero(0.9, 10), 0);
  t.is(towardZero(-0.9, 10), 0);
});

test(`clamp`, t => {
  t.is(clamp(0), 0);
  t.is(clamp(1), 1);
  t.is(clamp(-1), -1);
  t.is(clamp(1.1), 1);
  t.is(clamp(-1.1), -1);

  t.throws(() => clamp(NaN));
  // @ts-expect-error
  t.throws(() => clamp(false));
  // @ts-expect-error
  t.throws(() => clamp("hello"));

});

test(`scalarToBipolar`, (t) => {
  t.is(fromScalar(1), 1);
  t.is(fromScalar(0), -1);
  t.is(fromScalar(0.5), 0);

  t.throws(() => fromScalar(Number.NaN));
  // @ts-expect-error
  t.throws(() => fromScalar(true));
  t.throws(() => fromScalar(1.01));
  t.throws(() => fromScalar(-0.01));
});