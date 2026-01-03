import { test, expect, assert } from 'vitest';
import {
  ofArrayMutable,
  type MapArrayOpts,
} from '../../src/map/map-of-array-mutable.js';
import type { IMapOfMutableExtended } from '../../src/map/imap-of-mutable-extended.js';


test(`with-opts`, () => {
  type Person = { readonly name: string; readonly city: string };
  const barry = { name: `Barry`, city: `London` };
  const barryOther = { name: `Barry`, city: `Manchester` };
  const barryCase = { name: `BARRY`, city: `London` };
  const sally = { name: `Sally`, city: `Bristol` };
  const sallyOther = { name: `Sally`, city: `Manchester` };
  const sallyMoreProps = { name: `Sally`, city: `Bristol`, age: 27 };

  const opts: MapArrayOpts<Person> = {
    groupBy: (p) => p.city,
    comparer: (a, b) => {
      const eq = a.name === b.name && a.city === b.city;
      //console.log(`  test comparer: result: ${ eq } a.name: ${ a.name } b.name: ${ b.name } a.city: ${ a.city } b.city: ${ b.city }`);
      return eq;
    }
  };

  const m = ofArrayMutable<Person>(opts);

  m.addValue(barry, barryOther, barryCase, sally, sallyOther, sallyMoreProps);

  // Check expected counts
  expect([ ...m.keys() ].length).eq(3);
  expect([ ...m.entriesFlat() ].length).eq(6);

  // Check for key recall
  expect([ ...m.valuesForAsArray(`Bristol`) ].length).toBe(2);
  expect(m.count(`London`)).toBe(2);
  expect(m.count(`Notfound`)).toBe(0);
  expect(m.hasKeyValue(`Bristol`, { name: `Sally`, city: `Bristol` })).toBe(true);
  expect(m.hasKeyValue(`London`, { name: `Sally`, city: `Bristol` })).toBe(false);
  expect(m.hasKeyValue(`Bristol`, sallyMoreProps)).toBe(true);

  // Check for non-existent keys
  expect(m.has(`notfound`)).toBe(false);
  expect([ ...m.valuesForAsArray('notfound') ].length).toBe(0);

  // Key equality
  expect(m.has(`LONDON`)).toBe(false);
  expect(m.has(`London`)).toBe(true);

  // Lookup key from value
  expect(m.firstKeyByValue({ name: `BARRY`, city: `London` })).toBe(`London`);
  expect(m.firstKeyByValue({ name: `notfound`, city: `notfound` })).toBeFalsy();
});

function doStuff(m: IMapOfMutableExtended<string, readonly string[]>) {
  m.addKeyedValues(`a`, `aa`, `ab`, `ac`);
  m.addKeyedValues(`c`, `ca`);
  m.addKeyedValues(`c`, `cb`);
  m.addKeyedValues(`c`, `cc`);
  m.addKeyedValues(`a`, `aa`, `ab`, `ac`);
  m.addKeyedValues(`b`, `ba`, `bb`, `bc`);
  m.delete(`a`);
  m.clear();
}

test('events-added-key', () => {
  const m = ofArrayMutable<string>();
  expect.assertions(3);
  m.addEventListener(`addedKey`, () => {
    expect(true).toBeTruthy();
  });
  doStuff(m);
});

test('events-added-values', () => {
  const m = ofArrayMutable<string>();
  expect.assertions(6);
  m.addEventListener(`addedValues`, () => {
    expect(true).toBeTruthy();
  });
  doStuff(m);
});

test('events-delete-key', () => {
  const m = ofArrayMutable<string>();
  expect.assertions(1);
  m.addEventListener(`deleteKey`, (event) => {
    if (event.key === `a`) expect(true).toBeTruthy();
  });
  doStuff(m);
});

test(`events-clear`, () => {
  const m = ofArrayMutable<string>();
  expect.assertions(1);
  m.addEventListener(`clear`, () => {
    expect(true).toBeTruthy()
  });
  doStuff(m);
});

test(`defaultOpts`, () => {
  const m = ofArrayMutable<string>();
  expect(m.isEmpty).toBe(true);
  m.addKeyedValues(`apples`, `a`);
  m.addKeyedValues(`oranges`, `d`, `e`);
  m.addKeyedValues(`apples`, `b`, `c`);

  expect(m.count(`apples`)).toBe(3);
  expect(m.count(`oranges`)).toBe(2);
  expect(m.count(`notfound`)).toBe(0);

  expect(m.firstKeyByValue(`a`)).toBe(`apples`);
  expect(m.firstKeyByValue(`d`)).toBe(`oranges`);
  expect(m.firstKeyByValue(`c`)).toBe(`apples`);
  expect(m.firstKeyByValue(`notfound`)).toBeFalsy();

  expect(m.has(`apples`)).toBe(true);
  expect(m.has(`oranges`)).toBe(true);
  expect(m.has(`notfound`)).toBe(false);
  expect(m.isEmpty).toBe(false);

  expect([ ...m.keys() ]).toEqual([ `apples`, `oranges` ]);
  expect([ ...m.keysAndCounts() ]).toEqual(
    [
      [ `apples`, 3 ],
      [ `oranges`, 2 ],
    ]
  );

  expect(m.hasKeyValue(`apples`, `c`)).toBe(true);
  expect(m.hasKeyValue(`oranges`, `e`)).toBe(true);
  expect(m.hasKeyValue(`notfound`, `e`)).toBe(false);
  expect(m.hasKeyValue(`notfound`, `f`)).toBe(false);

  m.clear();
  expect(m.isEmpty).toBe(true);
});
