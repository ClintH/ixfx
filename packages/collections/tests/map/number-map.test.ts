import { expect, it } from 'vitest';
import { NumberMap } from '../../src/map/number-map.js';

it(`missing keys return the default value`, () => {
  const map = new NumberMap<string>();
  expect(map.get(`missing`)).toBe(0);
  expect(map.has(`missing`)).toBe(false);

  const custom = new NumberMap<string>(10);
  expect(custom.get(`missing`)).toBe(10);
});

it(`add accumulates`, () => {
  const map = new NumberMap<string>();
  expect(map.add(`a`)).toBe(1);
  expect(map.add(`a`)).toBe(2);
  expect(map.add(`a`, 10)).toBe(12);

  // From a non-zero default
  const custom = new NumberMap<string>(5);
  expect(custom.add(`b`)).toBe(6);
});

it(`multiply and divide`, () => {
  const map = new NumberMap<string>();
  map.set(`a`, 3);

  expect(map.multiply(`a`, 2)).toBe(6);
  expect(map.divide(`a`, 3)).toBe(2);

  // Missing keys act on the default value
  expect(map.multiply(`missing`, 2)).toBe(0);
  expect(map.divide(`missing`, 2)).toBe(0);
});

it(`reset returns key to default`, () => {
  const map = new NumberMap<string>(7);
  map.set(`a`, 100);
  expect(map.reset(`a`)).toBe(7);
  expect(map.get(`a`)).toBe(7);
});

it(`mapValue transforms all values`, () => {
  const map = new NumberMap<string>();
  map.set(`a`, 1);
  map.set(`b`, 2);
  map.mapValue(value => value * 10);
  expect(map.get(`a`)).toBe(10);
  expect(map.get(`b`)).toBe(20);
});

it(`findValueMax and findValueMin`, () => {
  const map = new NumberMap<string>();
  expect(map.findValueMax()).toBeNaN();
  expect(map.findValueMin()).toBeNaN();

  map.set(`a`, 5);
  map.set(`b`, -2);
  map.set(`c`, 10);
  expect(map.findValueMax()).toBe(10);
  expect(map.findValueMin()).toBe(-2);
});

it(`keysByValue and filterKeysByValue`, () => {
  const map = new NumberMap<string>();
  map.set(`a`, 1);
  map.set(`b`, 2);
  map.set(`c`, 2);

  expect([...map.keysByValue(2)]).toEqual([`b`, `c`]);
  expect([...map.keysByValue(99)]).toEqual([]);
  expect([...map.filterKeysByValue(v => v > 1)]).toEqual([`b`, `c`]);
});

it(`entriesSorted orders by value ascending`, () => {
  const map = new NumberMap<string>();
  map.set(`a`, 3);
  map.set(`b`, 1);
  map.set(`c`, 2);

  expect([...map.entriesSorted()]).toEqual([
    [`b`, 1],
    [`c`, 2],
    [`a`, 3],
  ]);
  // Custom sorter: descending
  expect([...map.entriesSorted((a, b) => b[1] - a[1])]).toEqual([
    [`a`, 3],
    [`c`, 2],
    [`b`, 1],
  ]);
});
