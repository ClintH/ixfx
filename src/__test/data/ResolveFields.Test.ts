import test from 'ava';
import { resolve } from '../../data/Resolve.js';
import { resolveFields } from '../../data/ResolveFields.js';
import * as Numbers from '../../numbers/index.js';
import * as Flow from '../../flow/index.js';
import * as Rx from '../../rx/index.js';
import { interval } from '../../flow/index.js';

test(`resolve`, async t => {
  // Basic values
  t.is(await resolve(`hello`), `hello`);
  t.is(await resolve(10), 10);
  t.deepEqual(await resolve({ name: 'bob' }), { name: 'bob' });
  t.true(await resolve(true));
  t.false(await resolve(false));

  // Async & sync functions
  t.is(await resolve(() => 'hello'), 'hello');
  t.is(await resolve(async () => Promise.resolve('there')), 'there');

  // Synchronous generator
  const gen = Numbers.count(3);
  t.is(await resolve(gen), 0);
  t.is(await resolve(gen), 1);
  t.is(await resolve(gen), 2);
  t.falsy(await resolve(gen));

  // Iterator
  const iter = [ 1, 2, 3 ].values();
  t.is(await resolve(iter), 1);
  t.is(await resolve(iter), 2);
  t.is(await resolve(iter), 3);
  t.falsy(await resolve(iter));

  const rx = Rx.From.number(10);
  t.is(await resolve(rx), 10);
  rx.set(11);
  t.is(await resolve(rx), 11);
  rx.dispose(`test dispose`);
  t.is(await resolve(rx), 11);

});

test('resolve-fields-async', async t => {
  const s = {
    length: 10,
    random: async () => {
      await Flow.sleep(100);
      return Math.random();
    }
  };

  const r = await resolveFields(s);
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
    const r1 = await resolveFields(s1);
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


test(`resolve-fields`, async t => {
  const s = {
    length: 10,
    random: Math.random
  };
  const r = await resolveFields(s);
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
    const r1 = await resolveFields(s1);
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