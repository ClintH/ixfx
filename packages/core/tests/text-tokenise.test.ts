import { expect, it } from 'vitest';
import { defaultKeyer } from '../src/default-keyer.js';
import { byCharacter, byWord } from '../src/text-tokenise.js';

it(`byCharacter splits into single characters`, () => {
  const t = byCharacter();
  expect(t.split(`abc`)).toEqual([`a`, `b`, `c`]);
  expect(t.joinWith).toBe(``);
  // Round-trips
  expect(t.split(`abc`).join(t.joinWith)).toBe(`abc`);
});

it(`byWord splits on whitespace runs`, () => {
  const t = byWord();
  expect(t.split(`hello  world\nagain`)).toEqual([`hello`, `world`, `again`]);
  expect(t.joinWith).toBe(` `);
  // Round-trips approximately (single spaces)
  expect(t.split(`hello world`).join(t.joinWith)).toBe(`hello world`);
});

it(`defaultKeyer: strings pass through, others JSON-stringify`, () => {
  expect(defaultKeyer(`hello`)).toBe(`hello`);
  expect(defaultKeyer(10)).toBe(`10`);
  expect(defaultKeyer({ a: 1 })).toBe(`{"a":1}`);
});
