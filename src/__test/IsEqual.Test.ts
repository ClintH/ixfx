import test from 'ava';
import {
  isEqualDefault,
  isEqualValueDefault,
  isEqualValueIgnoreOrder,
  isEqualValuePartial
} from '../IsEqual.js'

test(`isEqualValuePartial`, t => {
  const obj1 = {
    name: `blah`,
    address: {
      street: `West`,
      number: 35
    }
  };

  t.true(isEqualValuePartial(obj1, { name: `blah` }));
  t.false(isEqualValuePartial(obj1, { name: `nope` }));
  t.true(isEqualValuePartial(obj1, { address: { number: 35 } }));
  t.true(isEqualValuePartial(obj1, { address: { number: 35, street: `West` } }));
  t.false(isEqualValuePartial(obj1, { address: { number: 35, streetWrong: `West` } }));
  t.false(isEqualValuePartial(obj1, { address: { number: 35, street: `North` } }));
  t.true(isEqualValuePartial(obj1, {
    name: `blah`,
    address: {
      street: `West`,
      number: 35
    }
  }));


});

test(`isEqualValueIgnoreOrder`, t => {
  // Objects
  const obj1 = {
    name: 'blah',
  };
  const obj2 = {
    name: 'blah',
  };
  t.true(isEqualValueIgnoreOrder(obj1, obj1));
  t.true(isEqualValueIgnoreOrder(obj1, obj2));

  const obj3 = {
    name: `a`,
    colour: {
      r: 200,
      g: 100,
      b: 50
    },
    size: 20
  };
  const obj4 = {
    colour: {
      b: 50,
      g: 100,
      r: 200,
    },
    size: 20,
    name: `a`
  }
  t.true(isEqualValueIgnoreOrder(obj3, obj4));
})

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
