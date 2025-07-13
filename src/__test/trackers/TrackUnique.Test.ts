import expect from 'expect';
import { unique, uniqueInstances } from '../../trackers/TrackUnique.js';

test('track-unique', () => {
  // String
  const a = unique<string>();
  const v1 = `hello`;
  expect(a(v1)).toBe(true);
  expect(a(`there`)).toBe(true);
  expect(a(`hello`)).toBe(false);
  expect(a(v1)).toBe(false);
  // @ts-expect-error
  expect(a(24)).toBe(true); // not the right type, but still unique
  // @ts-expect-error
  expect(() => a(undefined)).toThrow();
  //@ts-expect-error
  expect(() => a(null)).toThrow();

  // Simple object using default stringify
  type Person = { name: string, colour: string }
  const b = unique<Person>();
  const v2 = { name: `jane`, colour: `red` };
  expect(b(v2)).toBe(true);
  expect(b({ name: `jane`, colour: `red` })).toBe(false);
  expect(b(v2)).toBe(false);
  expect(b({ name: `jane`, colour: `blue` })).toBe(true);
  expect(b({ name: `bob`, colour: `red` })).toBe(true);

  // Custom stringify using just name
  const c = unique<Person>(v => v.name);
  expect(c(v2)).toBe(true);
  expect(c(v2)).toBe(false);
  expect(c({ name: `jane`, colour: `blue` })).toBe(false);
  expect(c({ name: `bob`, colour: `red` })).toBe(true);

});

test(`track-unique-refs`, () => {
  // String
  const a = uniqueInstances<string>();
  const v1 = `hello`;
  expect(a(v1)).toBe(true);
  expect(a(`there`)).toBe(true);
  expect(a(`hello`)).toBe(false); // same value but not same obj
  expect(a(v1)).toBe(false);
  // @ts-expect-error
  expect(a(24)).toBe(true); // not right type, but still unique
  // @ts-expect-error
  expect(() => a(undefined)).toThrow();
  //@ts-expect-error
  expect(() => a(null)).toThrow();

  // Simple object
  type Person = { name: string, colour: string }
  const b = uniqueInstances<Person>();
  const v2 = { name: `jane`, colour: `red` };
  expect(b(v2)).toBe(true);
  expect(b({ name: `jane`, colour: `red` })).toBe(true);
  expect(b(v2)).toBe(false);
  expect(b({ name: `jane`, colour: `blue` })).toBe(true);
  expect(b({ name: `bob`, colour: `red` })).toBe(true);
});
