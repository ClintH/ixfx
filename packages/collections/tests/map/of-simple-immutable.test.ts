import { expect, it } from 'vitest';
import { ofSimple } from '../../src/map/map-of-simple.js';

it(`addKeyedValues and read back`, () => {
  let m = ofSimple<string>();
  expect(m.isEmpty).toBe(true);

  m = m.addKeyedValues(`name`, `jane`, `jill`);
  m = m.addKeyedValues(`colours`, `red`);

  expect(m.isEmpty).toBe(false);
  expect([...m.valuesFor(`name`)]).toEqual([`jane`, `jill`]);
  expect(m.count(`name`)).toBe(2);
  expect(m.count(`missing`)).toBe(0);
  expect(m.has(`name`)).toBe(true);
  expect(m.has(`missing`)).toBe(false);
  expect([...m.keys()].sort()).toEqual([`colours`, `name`]);
});

it(`immutability: operations return new maps, originals unchanged`, () => {
  const original = ofSimple<string>().addKeyedValues(`a`, `1`);

  const added = original.addKeyedValues(`b`, `2`);
  // Original still only has key 'a'
  expect([...original.keys()]).toEqual([`a`]);
  expect([...added.keys()].sort()).toEqual([`a`, `b`]);

  const deleted = added.delete(`a`);
  expect([...added.keys()].sort()).toEqual([`a`, `b`]);
  expect([...deleted.keys()]).toEqual([`b`]);

  // Values under an unchanged key are not shared by reference
  const mutatedCopy = original.addKeyedValues(`a`, `2`);
  expect([...original.valuesFor(`a`)]).toEqual([`1`]);
  expect([...mutatedCopy.valuesFor(`a`)]).toEqual([`1`, `2`]);
});

it(`deleteKeyValue removes single values`, () => {
  let m = ofSimple<string>().addKeyedValues(`a`, `1`, `2`, `3`);
  m = m.deleteKeyValue(`a`, `2`);
  expect([...m.valuesFor(`a`)]).toEqual([`1`, `3`]);

  // Deleting the last value under a key removes the key
  m = m.deleteKeyValue(`a`, `1`).deleteKeyValue(`a`, `3`);
  expect(m.has(`a`)).toBe(false);
});

it(`deleteByValue removes value across all keys`, () => {
  let m = ofSimple<string>().addKeyedValues(`a`, `x`, `y`).addKeyedValues(`b`, `x`, `z`);
  m = m.deleteByValue(`x`);
  expect([...m.valuesFor(`a`)]).toEqual([`y`]);
  expect([...m.valuesFor(`b`)]).toEqual([`z`]);
});

it(`clear returns an empty map without touching the original`, () => {
  const m = ofSimple<string>().addKeyedValues(`a`, `1`);
  const cleared = m.clear();
  expect(cleared.isEmpty).toBe(true);
  expect(m.isEmpty).toBe(false);
});

it(`lookups`, () => {
  const m = ofSimple<string>().addKeyedValues(`a`, `1`, `2`).addKeyedValues(`b`, `2`, `3`);

  expect(m.hasKeyValue(`a`, `1`)).toBe(true);
  expect(m.hasKeyValue(`a`, `3`)).toBe(false);

  // Same value under several keys: first key wins
  expect(m.firstKeyByValue(`2`)).toBe(`a`);
  expect(m.firstKeyByValue(`3`)).toBe(`b`);
  expect(m.firstKeyByValue(`nope`)).toBeUndefined();

  expect([...m.valuesFlat()].sort()).toEqual([`1`, `2`, `2`, `3`]);
  expect([...m.entriesFlat()].length).toBe(4);
  expect([...m.keysAndCounts()].sort((a, b) => a[0].localeCompare(b[0]))).toEqual([
    [`a`, 2],
    [`b`, 2],
  ]);
});
