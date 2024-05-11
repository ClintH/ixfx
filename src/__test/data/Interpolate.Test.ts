import test from 'ava';
import { interpolate, interpolatorInterval, interpolatorStepped } from '../../data/Interpolate.js';
import { round } from '../../numbers/Round.js';
import { delayLoop } from '../../flow/Delay.js';
import { arrayValuesEqual } from '../Include.js';
import { compareValuesEqual } from '../../collections/Iterables.js';

test(`basic`, t => {
  t.is(interpolate(0, 0, 100), 0);
  t.is(interpolate(0.5, 0, 100), 50);
  t.is(interpolate(1, 0, 100), 100);

  t.is(interpolate(0, 100, 0), 100);
  t.is(interpolate(0.5, 100, 0), 50);
  t.is(interpolate(1, 100, 0), 0);

  t.is(interpolate(0, 0, -100), 0);
  t.is(interpolate(0.5, 0, -100), -50);
  t.is(interpolate(1, 0, -100), -100);

  const f = interpolate(0, 100);
  t.true(typeof f === `function`, typeof f);
  t.is(f(0), 0);
  t.is(f(0.5), 50);
  t.is(f(1), 100);

});

test(`limits`, t => {
  // Default is clamp
  t.is(interpolate(1.1, 0, 100), 100);
  t.is(interpolate(-0.1, 0, 100), 0);

  // Clamp
  t.is(interpolate(1.1, 0, 100, { limits: `clamp` }), 100);
  t.is(interpolate(-0.1, 0, 100, { limits: `clamp` }), 0);

  // Ignore
  t.is(Math.floor(interpolate(1.1, 0, 100, { limits: `ignore` })), 110);
  t.is(interpolate(-0.1, 0, 100, { limits: `ignore` }), -10);
  t.is(interpolate(0, 0, 100, { limits: `ignore` }), 0);
  t.is(interpolate(0.5, 0, 100, { limits: `ignore` }), 50);
  t.is(interpolate(1, 0, 100, { limits: `ignore` }), 100);

  // Wrap
  t.is(Math.floor(interpolate(1.1, 0, 100, { limits: `wrap` })), 10);
  t.is(Math.floor(interpolate(-0.1, 0, 100, { limits: `wrap` })), 90);
  t.is(interpolate(0, 0, 100, { limits: `wrap` }), 0);
  t.is(interpolate(0.5, 0, 100, { limits: `wrap` }), 50);
  t.is(interpolate(1, 0, 100, { limits: `wrap` }), 100);
});


test(`interpolatorInterval`, async t => {

  const v = interpolatorInterval(100);
  let values = [];

  for await (const _ of delayLoop(9)) {
    const value = v();
    values.push(round(1, value));
    if (value >= 1) break;
  }
  // TODO: Not a proper test. We lose a random value here and there due to timing
  t.pass();
});

test(`interpolatorStepped`, (t) => {
  const v = interpolatorStepped(0.1, 100, 200);
  let values = [];
  while (true) {
    const value = v();
    values.push(value);
    if (value >= 200) break;
  }
  t.is(values.length, 12);
  t.is(values[ 0 ], 100);
  t.is(values.at(-1), 200);

  // Re-targeting
  const v2 = interpolatorStepped(0.1, 100, 200);
  t.is(v2(), 100); // amount: 0
  t.is(v2(300), 120); // amount: 0.1 of 200 (100->300)
  t.is(v2(), 140); // amount: 0.2 of 200 (100->300)
  t.is(round(1, v2(1, 0)), 0.3); // amount: 0.3 of 1 (0-1)
});
