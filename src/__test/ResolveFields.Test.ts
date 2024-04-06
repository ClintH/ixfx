import test from 'ava';
import { fieldResolve, pull } from '../data/ResolveFields.js';
import * as Numbers from '../numbers/index.js';
import * as Mod from '../modulation/index.js';
import * as Flow from '../flow/index.js';
import * as Iter from '../iterables/index.js';
import * as Rx from '../rx/index.js';
import { interval } from '../flow/index.js';

test(`poll`, async t => {
  const v1 = {
    name: `hello`,
    random: Rx.fromFunction(Math.random, { interval: 1000 }),
    gen: Mod.pingPong(1, 0, 5)
  }

  const p1 = pull(v1);

  await Flow.repeatAsync(10, async () => {
    console.log(`poll: ${ JSON.stringify(p1.compute()) }`);
    await Flow.sleep(500);
  })
  p1.dispose();
});

test('resolve-fields-async', async t => {
  const s = {
    length: 10,
    random: async () => {
      await Flow.sleep(100);
      return Math.random();
    }
  };

  const r = await fieldResolve(s);
  t.is(typeof r.length, `number`);
  t.is(typeof r.random, `number`);
  t.is(r.length, 10);

  const c = 5;
  const s1 = {
    colour: `red`,
    gen: interval(Numbers.count(c), 100),
    rand: Math.random
  };

  // Each time we call resolveFields, r1.gen should match for index
  for (let i = 0; i < c + 1; i++) {
    const r1 = await fieldResolve(s1);
    t.is(r1.colour, `red`);
    if (i === c) {
      // Test if generator ends
      t.falsy(r1.gen);
    } else {
      t.is(typeof r1.gen, `number`);
      t.is(r1.gen, i);
    }
  }

});


test(`field-resolve`, async t => {
  const s = {
    length: 10,
    random: Math.random
  };
  const r = await fieldResolve(s);
  t.is(typeof r.length, `number`);
  t.is(typeof r.random, `number`);
  t.is(r.length, 10);

  const c = 5;
  const s1 = {
    colour: `red`,
    // Generator
    gen: Numbers.count(c),
    // Rx
    rx: Rx.readFromArray([ 1, 2, 3, 4, 5 ], { interval: 100 }),
    // Regular function
    rand: Math.random
  };

  // Each time we call resolveFields, r1.gen should match for index
  for (let i = 0; i < c + 1; i++) {
    const r1 = await fieldResolve(s1);
    t.is(r1.colour, `red`);
    if (i === c) {
      // Test if generator ends
      t.falsy(r1.gen);
    } else {
      t.is(typeof r1.gen, `number`);
      t.is(r1.gen, i);
    }
  }
});