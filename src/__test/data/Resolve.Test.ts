import expect from 'expect';
import { resolve, resolveWithFallback } from '../../data/Resolve.js';
import { resolveFields } from '../../data/ResolveFields.js';
import * as Numbers from '../../numbers/index.js';
import * as Flow from '../../flow/index.js';
import * as Rx from '../../rx/index.js';
import { repeat } from '../../flow/Repeat.js';

test(`with-fallback`, async () => {
  let triggered = 0;
  let errored = 0;
  const fn = () => {
    if (Math.random() >= 0.5) {
      triggered++;
      return; // undefined
    } else if (Math.random() > 0.5) {
      errored++;
      throw new Error(`Test error`);
    }
    return 0;
  }
  while (triggered < 5 && errored < 5) {
    const value = await resolveWithFallback(fn, { value: 1 });
    const isZeroOrOne = value === 0 || value === 1;
    expect(isZeroOrOne).toBe(true);
    expect(typeof value === `undefined`).toBe(false);
  }
});

test(`arrays`, async () => {
  const data = [ `a`, `b`, `c` ];
  expect(await resolve(data)).toEqual(data);
});

test(`resolve`, async () => {
  // Basic values
  expect(await resolve(`hello`)).toBe(`hello`);
  expect(await resolve(10)).toBe(10);
  expect(await resolve({ name: 'bob' })).toEqual({ name: 'bob' });
  expect(await resolve(true)).toBe(true);
  expect(await resolve(false)).toBe(false);

  // Async & sync functions
  expect(await resolve(() => 'hello')).toBe('hello');
  expect(await resolve(async () => Promise.resolve('there'))).toBe('there');

  // Synchronous generator
  const gen = Numbers.count(3);
  expect(await resolve(gen)).toBe(0);
  expect(await resolve(gen)).toBe(1);
  expect(await resolve(gen)).toBe(2);
  expect(await resolve(gen)).toBeFalsy();

  // Iterator
  const iter = [ 1, 2, 3 ].values();
  expect(await resolve(iter)).toBe(1);
  expect(await resolve(iter)).toBe(2);
  expect(await resolve(iter)).toBe(3);
  expect(await resolve(iter)).toBeFalsy();

  const rx = Rx.From.number(10);
  expect(await resolve(rx)).toBe(10);
  rx.set(11);
  expect(await resolve(rx)).toBe(11);
  rx.dispose(`test dispose`);
  expect(await resolve(rx)).toBe(11);

});

test('resolve-fields-async', async () => {
  const s = {
    length: 10,
    random: async () => {
      await Flow.sleep(100);
      return Math.random();
    }
  };

  const r = await resolveFields(s);
  expect(typeof r.length).toBe(`number`);
  expect(typeof r.random).toBe(`number`);
  expect(r.length).toBe(10);

  const c = 5;
  const s1 = {
    colour: `red`,
    gen: repeat(Numbers.count(c), { delay: 100 }),
    rand: Math.random
  };

  // Each time we call resolveFields, r1.gen should match for index
  for (let i = 0; i < c + 1; i++) {
    const r1 = await resolveFields(s1);
    expect(r1.colour).toBe(`red`);
    if (i === c) {
      // Test if generator ends
      expect(r1.gen).toBeFalsy();
    } else {
      expect(typeof r1.gen).toBe(`number`);
      expect(r1.gen).toBe(i);
    }
  }

});


test(`resolve-fields`, async () => {
  const s = {
    length: 10,
    random: Math.random
  };
  const r = await resolveFields(s);
  expect(typeof r.length).toBe(`number`);
  expect(typeof r.random).toBe(`number`);
  expect(r.length).toBe(10);

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
    expect(r1.colour).toBe(`red`);
    if (i === c) {
      // Test if generator ends
      expect(r1.gen).toBeFalsy();
    } else {
      expect(typeof r1.gen).toBe(`number`);
      expect(r1.gen).toBe(i);
    }
  }
});