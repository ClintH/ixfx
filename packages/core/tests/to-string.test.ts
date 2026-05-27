import { describe, expect, it } from 'vitest';
import { toStringDefault, toStringOrdered } from '../src/to-string.js';

describe(`toStringDefault`, () => {
  const a = {
    name: `Blah blah`,
    age: 30,
    alive: true,
    height: 192.4,
  };

  const aa = {
    name: `Blah blah`,
    age: 30,
    alive: true,
    height: 192.4,
  };
  it(`default`, () => {
    const b = `Blah blah`;
    const bb = `Blah blah`;

    expect(toStringDefault(a)).toBe(toStringDefault(aa));
    expect(toStringDefault(b)).toBe(toStringDefault(bb));
  });

  it(`ordered`, () => {
    expect(toStringOrdered(a)).toBe(toStringOrdered(`{"age":30,"alive":true,"height":192.4,"name":"Blah blah"}`));
    expect(toStringOrdered(aa)).toBe(toStringOrdered(`{"age":30,"alive":true,"height":192.4,"name":"Blah blah"}`));
  });
});
