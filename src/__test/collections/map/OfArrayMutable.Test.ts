import test from 'ava';
import {
  ofArrayMutable,
  type MapArrayOpts,
} from '../../../collections/map/MapOfArrayMutable.js';
import type { IMapOfMutableExtended } from '../../../collections/map/IMapOfMutableExtended.js';
import { arrayValueIncludes } from '../../Include.js';
import { isEqualValueDefault } from '../../../IsEqual.js';

test(`withOpts`, (t) => {
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
  t.assert([ ...m.keys() ].length === 3);
  t.assert([ ...m.entriesFlat() ].length === 6);

  // Check for key recall
  t.is([ ...m.get(`Bristol`) ].length, 2);
  t.is(m.count(`London`), 2);
  t.is(m.count(`Notfound`), 0);
  t.true(m.hasKeyValue(`Bristol`, { name: `Sally`, city: `Bristol` }));
  t.false(m.hasKeyValue(`London`, { name: `Sally`, city: `Bristol` }));
  t.true(m.hasKeyValue(`Bristol`, sallyMoreProps));

  // Check for non-existent keys
  t.false(m.has(`notfound`));
  t.is([ ...m.get('notfound') ].length, 0);

  // Key equality
  t.false(m.has(`LONDON`));
  t.true(m.has(`London`));

  // Lookup key from value
  t.is(m.firstKeyByValue({ name: `BARRY`, city: `London` }), `London`);
  t.falsy(m.firstKeyByValue({ name: `notfound`, city: `notfound` }));
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

test('events-added-key', (t) => {
  const m = ofArrayMutable<string>();
  t.plan(3);
  m.addEventListener(`addedKey`, () => {
    t.assert(true);
  });
  doStuff(m);
});

test('events-added-values', (t) => {
  const m = ofArrayMutable<string>();
  t.plan(6);
  m.addEventListener(`addedValues`, () => {
    t.assert(true);
  });
  doStuff(m);
});

test('events-delete-key', (t) => {
  const m = ofArrayMutable<string>();
  t.plan(1);
  m.addEventListener(`deleteKey`, (evt) => {
    if (evt.key === `a`) t.assert(true);
  });
  doStuff(m);
});

test(`events-clear`, (t) => {
  const m = ofArrayMutable<string>();
  t.plan(1);
  m.addEventListener(`clear`, () => {
    t.assert(true);
  });
  doStuff(m);
});

test(`defaultOpts`, (t) => {
  const m = ofArrayMutable<string>();
  t.true(m.isEmpty);
  m.addKeyedValues(`apples`, `a`);
  m.addKeyedValues(`oranges`, `d`, `e`);
  m.addKeyedValues(`apples`, `b`, `c`);

  t.is(m.count(`apples`), 3);
  t.is(m.count(`oranges`), 2);
  t.is(m.count(`notfound`), 0);

  t.is(m.firstKeyByValue(`a`), `apples`);
  t.is(m.firstKeyByValue(`d`), `oranges`);
  t.is(m.firstKeyByValue(`c`), `apples`);
  t.falsy(m.firstKeyByValue(`notfound`));

  t.true(m.has(`apples`));
  t.true(m.has(`oranges`));
  t.false(m.has(`notfound`));
  t.false(m.isEmpty);

  arrayValueIncludes(t, [ ...m.keys() ], [ `apples`, `oranges` ]);
  arrayValueIncludes(
    t,
    [ ...m.keysAndCounts() ],
    [
      [ `apples`, 3 ],
      [ `oranges`, 2 ],
    ],
    isEqualValueDefault
  );

  t.true(m.hasKeyValue(`apples`, `c`));
  t.true(m.hasKeyValue(`oranges`, `e`));
  t.false(m.hasKeyValue(`notfound`, `e`));
  t.false(m.hasKeyValue(`notfound`, `f`));

  m.clear();
  t.true(m.isEmpty);
});
