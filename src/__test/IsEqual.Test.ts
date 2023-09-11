import test from 'ava';
import {
  isEqualDefault,
  isEqualValueDefault
} from '../IsEqual.js'

test('isEqual', (t) => {
  // Booleans
  t.true(isEqualDefault(false, false));
  t.true(isEqualDefault(true, true));
  t.false(isEqualDefault(true, false));
  t.false(isEqualDefault(false, true));

  // Objects
  const obj1 = {
    name: 'blah',
  };
  const obj2 = {
    name: 'blah',
  };
  t.true(isEqualDefault(obj1, obj1));
  t.false(isEqualDefault(obj1, obj2));

  // Numbers
  t.true(isEqualDefault(10, 10));
  t.false(isEqualDefault(Number.NaN, Number.NaN));

  // Strings
  t.true(isEqualDefault('hello', 'hello'));
  t.false(isEqualDefault('HELLO', 'hello'));
  t.false(isEqualDefault('hello', 'there'));
  t.false(isEqualDefault('hello', undefined));
  t.false(isEqualDefault('hello', null));
  t.false(isEqualDefault('hello', ''));

  // Arrays
  const arr1 = [ 'hello', 'there' ];
  const arr2 = [ 'hello', 'there' ];
  t.true(isEqualDefault(arr1, arr1));
  t.false(isEqualDefault(arr1, arr2));
});

test('isEqualValueDefault', (t) => {
  // Booleans
  t.true(isEqualValueDefault(false, false));
  t.true(isEqualValueDefault(true, true));
  t.false(isEqualValueDefault(true, false));
  t.false(isEqualValueDefault(false, true));

  // Objects
  const obj1 = {
    name: 'blah',
  };
  const obj2 = {
    name: 'blah',
  };
  t.true(isEqualValueDefault(obj1, obj1));
  t.true(isEqualValueDefault(obj1, obj2));

  // Numbers
  t.true(isEqualValueDefault(10, 10));
  t.true(isEqualValueDefault(Number.NaN, Number.NaN));

  // Strings
  t.true(isEqualValueDefault('hello', 'hello'));
  t.false(isEqualValueDefault('HELLO', 'hello'));
  t.false(isEqualValueDefault('hello', 'there'));
  t.false(isEqualValueDefault('hello', undefined));
  t.false(isEqualValueDefault('hello', null));
  t.false(isEqualValueDefault('hello', ''));

  // Arrays
  const arr1 = [ 'hello', 'there' ];
  const arr2 = [ 'hello', 'there' ];
  t.true(isEqualValueDefault(arr1, arr1));
  t.true(isEqualValueDefault(arr1, arr2));
});

// Default isEqual tests by reference
test(`isEqualDefault`, (t) => {
  const a = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const aa = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const b = "Blah blah";
  const bb = "Blah blah";
  const c = "BLAH BLAH";

  t.true(isEqualDefault(a, a));
  t.falsy(isEqualDefault(a, b as any));
  t.falsy(isEqualDefault(a, aa)); // Same content but different references, false

  t.true(isEqualDefault(b, b));
  t.true(isEqualDefault(b, bb)); // Strings work by value using ===
  t.falsy(isEqualDefault(b, c));
});
