import { test, expect } from 'vitest';
import { toStringDefault } from '../src/to-string.js';

test(`toStringDefault`, () => {
  const a = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const aa = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const b = "Blah blah";
  const bb = "Blah blah";

  expect(toStringDefault(a)).toBe(toStringDefault(aa));
  expect(toStringDefault(b)).toBe(toStringDefault(bb));
})
