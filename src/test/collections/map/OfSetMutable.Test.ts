import test from 'ava';
import { ofSetMutable } from '../../../collections/map/MapOfSetMutable.js';
import type { MapSetOpts } from 'src/collections/map/index.js';

test(`ofSetMutable`, (t) => {
  const m = ofSetMutable<string>();
  m.addKeyedValues(`a`, `aa`, `ab`, `ac`, `aa`, `ab`);
  t.is(m.count(`a`), 3); // duplicate values should be dropped

  type Person = { readonly name: string; readonly city: string };

  const opts: MapSetOpts<Person> = {
    groupBy: (p) => p.city,
    hash: (p) => `${p.name}-${p.city}`,
  };

  const barry = { name: `Barry`, city: `London` };
  const barryClone = { name: `Barry`, city: `London` };

  const m2 = ofSetMutable<Person>(opts);
  t.is(m2.count(`London`), 0);
  m2.addValue(barry, barryClone);
  t.is(m2.count(`London`), 1);
});
