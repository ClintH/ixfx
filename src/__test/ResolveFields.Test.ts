import test from 'ava';
import { fieldResolve, pull } from '../data/ResolveFields.js';
import * as Numbers from '../numbers/index.js';
import * as Mod from '../modulation/index.js';
import * as Flow from '../flow/index.js';
import * as Iter from '../iterables/index.js';
import * as Rx from '../rx/index.js';
import { interval } from '../flow/index.js';

test(`pull`, async t => {
  const counter = () => {
    let x = 0;
    return () => {
      x++;
      return x;
    };
  }
  const v1 = {
    name: `hello`,
    random: Rx.From.func(Math.random, { interval: 100, debugLabel: `random` }),
    gen: Mod.pingPong(1, 0, 5),
    count: counter()
  }

  // Create a pull mechanism
  const p1 = pull(v1);

  // Run an async function 10 times
  const p1Loop = await Flow.repeatAwait(10, async () => {
    await Flow.sleep(100);
    const r = await p1.compute();
    return r;
  });
  const p1Data = await Iter.toArray(p1Loop);

  let count = 1;
  for (const d of p1Data) {
    if (count === 1) t.falsy(d.random);
    t.is(d.name, `hello`);
    t.is(d.count, count++);
    // @ts-expect-error
    t.true(d.gen <= 5);
    // @ts-expect-error
    t.true(d.gen >= 0);
  }
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
    rx: Rx.From.array([ 1, 2, 3, 4, 5 ], { interval: 100 }),
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