import { immutable } from '../../collections/set/index.js';
import test from 'ava';

test(`immutableValueSet`, t => {
  const s = immutable<string>();
  
  // Check initial state
  t.true(s.size === 0);
  t.false(s.has('snozzle'));
  t.true(s.toArray().length === 0);
  t.true([...s.values()].length === 0);

  // Add one value
  const s1 = s.add('a');

  // Check immutability of original instance
  t.true(s.size === 0);
  t.false(s.has('snozzle'));
  t.true(s.toArray().length === 0);
  t.true([...s.values()].length === 0);

  // Check value was added
  t.true(s1.size === 1);
  t.true(s1.has('a'));
  t.like(s1.toArray(), ['a']);
  t.like([...s1.values()], ['a']);

  // Add several values
  const s2 = s1.add('b', 'c', 'd');
  t.true(s2.size === 4);
  t.true(s2.has('a'));
  t.true(s2.has('b'));
  t.true(s2.has('c'));
  t.true(s2.has('d'));
  t.false(s2.has('e'));
  t.like(s2.toArray(), ['a', 'b', 'c', 'd']);
  t.like([...s2.values()], ['a', 'b', 'c', 'd']);

  // Delete
  const s3 = s2.delete('b');
  t.true(s3.size === 3);
  t.false(s3.has('b'));
  t.true(s2.has('b'));
  t.like(s3.toArray(), ['a', 'c', 'd']);


});