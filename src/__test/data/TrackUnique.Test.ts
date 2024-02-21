import test from 'ava';
import { trackUnique, trackUniqueInstances } from '../../data/TrackUnique.js';

test('track-unique', t => {
  // String
  const a = trackUnique<string>();
  const v1 = `hello`;
  t.true(a(v1));
  t.true(a(`there`));
  t.false(a(`hello`));
  t.false(a(v1));
  // @ts-expect-error
  t.true(a(24)); // not the right type, but still unique
  // @ts-expect-error
  t.throws(() => a(undefined));
  //@ts-expect-error
  t.throws(() => a(null));

  // Simple object using default stringify
  type Person = { name: string, colour: string }
  const b = trackUnique<Person>();
  const v2 = { name: `jane`, colour: `red` };
  t.true(b(v2));
  t.false(b({ name: `jane`, colour: `red` }));
  t.false(b(v2));
  t.true(b({ name: `jane`, colour: `blue` }));
  t.true(b({ name: `bob`, colour: `red` }));

  // Custom stringify using just name
  const c = trackUnique<Person>(v => v.name);
  t.true(c(v2));
  t.false(c(v2));
  t.false(c({ name: `jane`, colour: `blue` }));
  t.true(c({ name: `bob`, colour: `red` }));

});

test(`track-unique-refs`, t => {
  // String
  const a = trackUniqueInstances<string>();
  const v1 = `hello`;
  t.true(a(v1));
  t.true(a(`there`));
  t.false(a(`hello`)); // same value but not same obj
  t.false(a(v1));
  // @ts-expect-error
  t.true(a(24)); // not right type, but still unique
  // @ts-expect-error
  t.throws(() => a(undefined));
  //@ts-expect-error
  t.throws(() => a(null));

  // Simple object
  type Person = { name: string, colour: string }
  const b = trackUniqueInstances<Person>();
  const v2 = { name: `jane`, colour: `red` };
  t.true(b(v2));
  t.true(b({ name: `jane`, colour: `red` }));
  t.false(b(v2));
  t.true(b({ name: `jane`, colour: `blue` }));
  t.true(b({ name: `bob`, colour: `red` }));
});
