/* eslint-disable */
import test from 'ava';
import {
  getClosestIntegerKey,
  mergeByKey,
} from '../../../collections/map/MapFns.js';
import { ofSimple } from '../../../collections/map/MapOfSimple.js';

/**
 * Test immutable mapOf
 */
test('mapOfSimple', (t) => {
  let a = ofSimple<string>();
  let b = a.addKeyedValues('key-1', 'a', 'b', 'c');
  let c = b.addKeyedValues('key-2', 'd', 'e', 'f');

  // Count of keys
  t.is(a.count('key-1'), 0);
  t.is(b.count('key-1'), 3);
  t.is(c.count('key-1'), 3);
  t.is(b.count('key-2'), 0);
  t.is(c.count('key-2'), 3);

  // Has key
  t.false(a.has('key-1'));
  t.false(a.has('key-2'));
  t.true(b.has('key-1'));
  t.false(b.has('key-2'));
  t.true(c.has('key-1'));
  t.true(c.has('key-2'));

  // Look up key for value

  //t.is(c.firstKeyByValue('a'), 'key-1');
  //t.is(c.firstEntryByIterableValue('z'), undefined);
});

test('getClosestIntegerKey', (t) => {
  const data = new Map<number, boolean>();
  data.set(1, true);
  data.set(2, true);
  data.set(3, true);
  data.set(4, true);
  t.is(getClosestIntegerKey(data, 3), 3);
  t.is(getClosestIntegerKey(data, 3.1), 3);
  t.is(getClosestIntegerKey(data, 3.5), 4);
  t.is(getClosestIntegerKey(data, 3.6), 4);
  t.is(getClosestIntegerKey(data, 100), 4);
  t.is(getClosestIntegerKey(data, -100), 1);
});

test(`mergeByKey`, (t) => {
  const m1 = new Map();
  m1.set(`1`, `1-1`);
  m1.set(`2`, `1-2`);
  m1.set(`3`, `1-3`);
  m1.set(`4`, `1-4`);

  const m2 = new Map();
  m2.set(`1`, `2-1`);
  m2.set(`2`, `2-2`);
  m2.set(`3`, `2-3`);
  m2.set(`5`, `2-5`);

  const m3 = mergeByKey(
    (a: string, b: string) => {
      return b.replace(`-`, `!`);
    },
    m1,
    m2
  );

  t.is(m3.get(`1`), `2!1`);
  t.is(m3.get(`2`), `2!2`);
  t.is(m3.get(`3`), `2!3`);
  t.is(m3.get(`4`), `1-4`);
  t.is(m3.get(`5`), `2-5`);
});
