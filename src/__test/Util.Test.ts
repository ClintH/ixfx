import test from 'ava';
import {
  isEqualDefault,
  isEqualValueDefault,
  defaultComparer,
  numericComparer,
  jsComparer,
  ifNaN,
  getFieldByPath,
  getFieldPaths,
  mapObject,
  relativeDifference,
  comparerInverse,
  toStringDefault,
} from '../Util.js';

test('relativeDifference', (t) => {
  const rel = relativeDifference(100);
  t.is(rel(100), 1);
  t.is(rel(150), 1.5);
  t.is(rel(50), 0.5);
});
test('mapObject', (t) => {
  const o1a = {
    x: 10,
    y: 20,
  };
  //eslint-disable-next-line functional/no-let
  let count = 0;
  const o1b = mapObject<typeof o1a, string>(o1a, (fieldValue, field, index) => {
    if (count === 0 && index !== 0) t.fail('index not right. Expected 0');
    else if (count === 1 && index !== 1) t.fail('index not right. Expected 1');
    if (count === 0 && field !== 'x') t.fail('Expected field x');
    if (count === 1 && field !== 'y') t.fail('Expected field y');

    count++;
    return fieldValue.toString();
  });

  t.like(o1b, { x: '10', y: '20' });
  t.not(o1b, o1a);

  const o2a = { width: 100, height: 250, colour: 'red' };
  const o2b = mapObject(o2a, (fieldValue, fieldName) => {
    if (fieldName === 'width') return fieldValue * 3;
    else if (typeof fieldValue === 'number') return fieldValue * 2;
    return fieldValue;
  });
  t.like(o2b, { width: 300, height: 500, colour: 'red' });
  // Test immutability
  t.like(o2a, { width: 100, height: 250, colour: 'red' });
});

test('getFieldByPath', (t) => {
  const d = {
    accel: { x: 1, y: 2, z: 3 },
    gyro: { x: 4, y: 5, z: 6 },
  };
  t.is(getFieldByPath(d, `accel.x`), 1);
  t.is(getFieldByPath(d, `gyro.z`), 6);
  t.like(getFieldByPath(d, `gyro`), { x: 4, y: 5, z: 6 });
  t.like(getFieldByPath(d, ``), d); // Returns original object

  t.throws(() => getFieldByPath(undefined));
  t.throws(() => getFieldByPath(null));
  t.throws(() => getFieldByPath(false));
  t.throws(() => getFieldByPath(10));
  t.pass();
});

test('getFieldPaths', (t) => {
  const d = {
    accel: { x: 1, y: 2, z: 3 },
    gyro: { x: 4, y: 5, z: 6 },
  };
  const paths = getFieldPaths(d);
  t.like(paths, [
    `accel.x`,
    `accel.y`,
    `accel.z`,
    `gyro.x`,
    `gyro.y`,
    `gyro.z`,
  ]);

  // @ts-ignore
  t.throws(() => getFieldByPaths(undefined));

  t.deepEqual(getFieldPaths(null), []);
});

test('ifNaN', (t) => {
  t.is(ifNaN(Number.NaN, 10), 10);
  t.is(ifNaN(200, 10), 200);
  // @ts-ignore
  t.throws(() => ifNaN(null, 10));
  // @ts-ignore
  t.throws(() => ifNaN(undefined, 10));
  // @ts-ignore
  t.throws(() => ifNaN('100', 10));
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

test(`toStringDefault`, (t) => {
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

  t.is(toStringDefault(a), toStringDefault(aa));
  t.is(toStringDefault(b), toStringDefault(bb));
})

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



test('jsComparer', (t) => {
  const r1 = [ 1, 2, 3, 4 ];
  const r1SortedA = [ ...r1 ].sort();
  const r1SortedB = [ ...r1 ].sort(jsComparer);
  t.like(r1SortedA, r1SortedB);

  const r2 = [ 4, 3, 2, 1 ];
  const r2SortedA = [ ...r2 ].sort();
  const r2SortedB = [ ...r2 ].sort(jsComparer);
  t.like(r2SortedA, r2SortedB);

  const r3 = [ 'oranges', 'apples' ];
  const r3SortedA = [ ...r3 ].sort();
  const r3SortedB = [ ...r3 ].sort(jsComparer);
  t.like(r3SortedA, r3SortedB);

  // Test weird sorting default
  const r4 = [ 10, 20, 5, 100 ];
  const r4SortedA = [ ...r4 ].sort();
  const r4SortedB = [ ...r4 ].sort(jsComparer);
  t.like(r4SortedA, r4SortedB);
});

test('numericComparer', (t) => {
  t.like([ 10, -20, 5, -100 ].sort(numericComparer), [ -100, -20, 5, 10 ]);
  t.like([ 10, 20, 5, 100 ].sort(numericComparer), [ 5, 10, 20, 100 ]);
  t.like([ 10, 20, 0, 0, 100 ].sort(numericComparer), [ 0, 0, 10, 20, 100 ]);

  // Inverted
  t.like(
    [ 10, -20, 5, -100 ].sort(comparerInverse(numericComparer)),
    [ 10, 5, -20, -100 ]
  );
  t.like(
    [ 10, 20, 5, 100 ].sort(comparerInverse(numericComparer)),
    [ 100, 20, 10, 5 ]
  );
  t.like(
    [ 10, 20, 0, 0, 100 ].sort(comparerInverse(numericComparer)),
    [ 100, 20, 10, 0, 0 ]
  );
});

test('defaultComparer', (t) => {
  t.like([ 10, -20, 5, -100 ].sort(defaultComparer), [ -100, -20, 5, 10 ]);
  t.like([ 10, 20, 5, 100 ].sort(defaultComparer), [ 5, 10, 20, 100 ]);
  t.like([ 10, 20, 0, 0, 100 ].sort(defaultComparer), [ 0, 0, 10, 20, 100 ]);
  //eslint-disable-next-line functional/immutable-data
  t.like('a b c d e'.split(' ').sort(defaultComparer), 'a b c d e'.split(' '));
  //eslint-disable-next-line functional/immutable-data
  t.like('e d c b a'.split(' ').sort(defaultComparer), 'a b c d e'.split(' '));

  // Inverted
  t.like(
    [ 10, -20, 5, -100 ].sort(comparerInverse(defaultComparer)),
    [ 10, 5, -20, -100 ]
  );
  t.like(
    [ 10, 20, 5, 100 ].sort(comparerInverse(defaultComparer)),
    [ 100, 20, 10, 5 ]
  );
  t.like(
    [ 10, 20, 0, 0, 100 ].sort(comparerInverse(defaultComparer)),
    [ 100, 20, 10, 0, 0 ]
  );
  t.like(
    //eslint-disable-next-line functional/immutable-data
    'a b c d e'.split(' ').sort(comparerInverse(defaultComparer)),
    'e d c b a'.split(' ')
  );
  t.like(
    //eslint-disable-next-line functional/immutable-data
    'e d c b a'.split(' ').sort(comparerInverse(defaultComparer)),
    'e d c b a'.split(' ')
  );
});
