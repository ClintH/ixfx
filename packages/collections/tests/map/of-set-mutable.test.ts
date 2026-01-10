import { test, expect } from 'vitest';
import { ofSetMutable } from '../../src/map/map-of-set-mutable.js';
import type { MapSetOpts } from '../../src/map/index.js';

test(`ofSetMutable`, () => {
  const m = ofSetMutable<string>();
  m.addKeyedValues(`a`, `aa`, `ab`, `ac`, `aa`, `ab`);
  expect(m.count(`a`)).toBe(3); // duplicate values should be dropped

  type Person = { readonly name: string; readonly city: string };

  const opts: MapSetOpts<Person> = {
    groupBy: (p) => p.city,
    hash: (p) => `${ p.name }-${ p.city }`,
  };

  const barry = { name: `Barry`, city: `London` };
  const barryClone = { name: `Barry`, city: `London` };

  const m2 = ofSetMutable<Person>(opts);
  expect(m2.count(`London`)).toBe(0);
  m2.addValue(barry, barryClone);
  expect(m2.count(`London`)).toBe(1);
});
