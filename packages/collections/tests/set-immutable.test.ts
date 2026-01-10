import { test, expect } from 'vitest';
import { immutable } from '../src/set/index.js';

test(`immutableValueSet`, () => {
  const s = immutable<string>();

  // Check initial state
  expect(s.size === 0).toBe(true);
  expect(s.has('snozzle')).toBe(false);
  expect(s.toArray().length === 0).toBe(true);
  expect([ ...s.values() ].length === 0).toBe(true);

  // Add one value
  const s1 = s.add('a');

  // Check immutability of original instance
  expect(s.size === 0).toBe(true);
  expect(s.has('snozzle')).toBe(false);
  expect(s.toArray().length === 0).toBe(true);
  expect([ ...s.values() ].length === 0).toBe(true);

  // Check value was added
  expect(s1.size === 1).toBe(true);
  expect(s1.has('a')).toBe(true);
  expect(s1.toArray()).toEqual([ 'a' ]);
  expect([ ...s1.values() ]).toEqual([ 'a' ]);

  // Add several values
  const s2 = s1.add('b', 'c', 'd');
  expect(s2.size === 4).toBe(true);
  expect(s2.has('a')).toBe(true);
  expect(s2.has('b')).toBe(true);
  expect(s2.has('c')).toBe(true);
  expect(s2.has('d')).toBe(true);
  expect(s2.has('e')).toBe(false);
  expect(s2.toArray()).toEqual([ 'a', 'b', 'c', 'd' ]);
  expect([ ...s2.values() ]).toEqual([ 'a', 'b', 'c', 'd' ]);

  // Delete
  const s3 = s2.delete('b');
  expect(s3.size === 3).toBe(true);
  expect(s3.has('b')).toBe(false);
  expect(s2.has('b')).toBe(true);
  expect(s3.toArray()).toEqual([ 'a', 'c', 'd' ]);
});