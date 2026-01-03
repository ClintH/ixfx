import { test, expect } from 'vitest';
import { mutable } from '../../src/map/map-mutable.js';
import { ofCircularMutable } from '../../src/map/map-of-circular-mutable.js';
import { NumberMap } from '../../src/map/number-map.js';
test(`mutableMap`, () => {
  const m = mutable();
  expect(m.isEmpty()).toBe(true);
  m.add([ `apples`, 10 ], [ `oranges`, 9 ]);
  expect(m.isEmpty()).toBe(false);
  expect(m.has(`apples`)).toBe(true);
  expect(m.has(`oranges`)).toBe(true);
  expect(m.has(`notthere`)).toBe(false);

  m.add({ key: `grapes`, value: 10 });
  m.set(`mangoes`, 100);
  m.delete(`oranges`);
  expect(m.has(`oranges`)).toBe(false);
  expect(m.has(`apples`)).toBe(true);
  expect(m.has(`grapes`)).toBe(true);
  expect(m.has(`mangoes`)).toBe(true);

  expect(m.get(`apples`)).toBe(10);
  expect(m.get(`notthere`)).toBeFalsy();
});

test(`ofCircular`, () => {
  const c = ofCircularMutable({ capacity: 3 });
  c.addKeyedValues(`hello`, 1, 2, 3, 4, 5);
  console.log(c.debugString());
  expect(c.valuesForAsArray('hello')).toStrictEqual([ 4, 5, 3 ]);
  expect(c.typeName).toBe(`circular`);
  expect(c.count('hello')).toBe(3);
  expect(c.count('goodbye')).toBe(0);
  expect(c.has(`hello`)).toBeTruthy();
  expect(c.has(`goodbye`)).toBeFalsy();
  c.clear();
  expect(c.count('hello')).toBe(0);
  expect(c.has(`hello`)).toBeFalsy();
});

test(`numberMap`, () => {
  const m1 = new NumberMap<string>();
  expect(m1.get('a')).toBe(0);
  m1.set('a', 1)
  expect(m1.get('a')).toBe(1);

  m1.set('b', 2)
  expect(m1.get('b')).toBe(2);
  m1.reset('b');
  expect(m1.get('b')).toBe(0);

  expect(m1.multiply('a', 10)).toBe(10);

  expect(m1.add('b')).toBe(1);
  expect(m1.add('b', 5)).toBe(6);
  expect(m1.subtract('b')).toBe(5);
  expect(m1.subtract('b', 2)).toBe(3);

  const m2 = new NumberMap<string>(10);
  expect(m2.get('a')).toBe(10);
  m2.set('a', 30);
  expect(m2.get('a')).toBe(30);
  m2.reset('a');
  expect(m2.get('a')).toBe(10);


})