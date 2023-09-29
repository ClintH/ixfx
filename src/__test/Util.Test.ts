import test from 'ava';
import {
  defaultComparer,
  numericComparer,
  jsComparer,
  ifNaN,
  relativeDifference,
  comparerInverse,
  toStringDefault
} from '../Util.js';

test('relativeDifference', (t) => {
  const rel = relativeDifference(100);
  t.is(rel(100), 1);
  t.is(rel(150), 1.5);
  t.is(rel(50), 0.5);
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
