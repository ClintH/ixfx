import { mutable } from '../../collections/set/index.js';
import test from 'ava';

test(`mutableValueSet`, t => {
  const barry = { name: `Barry`, city: `London` };
  const barryOther = { name: `Barry`, city: `Manchester` };
  const barryCase = { name: `BARRY`, city: `London` }; 
  const sally = { name: `Sally`, city: `Bristol` };
  const sallyOther = { name: `Sally`, city: `Manchester` };
  const sallyMoreProps = { name: `Sally`, city: `Bristol`, age: 27 };
  
  const people = [
    { name: `Barry`, city: `London` },
    { name: `Sally`, city: `Bristol` }
  ];

  type Person = { readonly name:string, readonly city:string }

  // Test default JSON
  const set = mutable();
  set.add(...people);
  t.true(set.has(barry));
  t.true(set.has(sally));
  t.false(set.has(barryOther));
  t.false(set.has(barryCase));
  t.false(set.has(sallyOther));
  t.false(set.has(sallyMoreProps));
  t.like(set.toArray(), people);

  t.true(set.delete(barry));
  t.false(set.delete(sallyMoreProps));

  // Test custom key generator
  const set2 = mutable<Person>(item => (item.name.toLocaleUpperCase() + `-` + item.city.toLocaleUpperCase()));
  set2.add(...people);
  t.true(set2.has(barry));
  t.true(set2.has(sally));
  t.false(set2.has(barryOther));
  t.true(set2.has(barryCase)); // <-- different than JSON case
  t.false(set2.has(sallyOther));
  t.true(set2.has(sallyMoreProps)); // <-- different than JSON case
  t.like(set2.toArray(), people);

  t.true(set2.delete(barry));
  t.true(set2.delete(sallyMoreProps));
  t.pass();
});

test('mutableSet add event', t => {
  // Test events
  const set = mutable<string>();
  t.plan(6);
  set.addEventListener(`add`, () => {
    t.assert(true, 'event received');
  });
  set.add(`a`, `b`, `c`, `d`, `e`, `f`);
});

test('mutableSet delete event', t => {
  const set = mutable<string>();
  set.add(`a`, `b`, `c`, `d`, `e`, `f`);

  t.plan(4); // 4 because we assert .delete worked
  set.addEventListener(`delete`, () => {
    t.assert(true, 'event received');
  });


  t.true(set.delete(`a`));
  t.true(set.delete(`b`));
});

test('mutableSet clear event', t => {
  const set = mutable<string>();
  t.plan(1);
  set.add(`a`, `b`, `c`, `d`, `e`, `f`);
  set.addEventListener(`clear`, () => {
    t.assert(true, 'event received');
  });
  set.clear();
});
