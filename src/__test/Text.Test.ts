/* eslint-disable */
import test from 'ava';
import { startsEnds, abbreviate, beforeMatch, afterMatch, between, betweenChomp, omitChars, splitByLength, beforeAfterMatch, wildcard } from '../Text.js';

test('wildcard', t => {
  t.true(wildcard(`bird*`)(`bird123`));
  t.true(wildcard(`bird*`)(`birdd123`));
  t.false(wildcard(`bird*`)(` bird123`));

  t.true(wildcard(`*bird`)(`123bird`));
  t.false(wildcard(`*bird`)(`123bird `));

  t.true(wildcard(`*bird*`)(`bird123`));
  t.true(wildcard(`*bird*`)(`123bird123`));
  t.true(wildcard(`*bird*`)(`123bird`));

  t.false(wildcard(`*bird*`)(`bir`));


  t.true(wildcard(`*bird*bird*`)(`bird123bird`));
  t.true(wildcard(`*bird*bird*`)(`123bird123bird123`));

  t.false(wildcard(`should noo*oot match`)(`should not match`));

});

test('abbreviate', t => {
  t.is(abbreviate(`This is something`, 100), `This is something`);
  t.is(abbreviate(`This is something`, 7), `This is...`);
  t.is(abbreviate(`abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz`, 5), `abcde...`);
  t.is(abbreviate(`abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz`, 20), `abcdefghi...rstuvwxyz`);
});

test('beforeAfterMatch', t => {
  t.deepEqual(beforeAfterMatch('T', '.'), [ `T`, `T` ]);
  t.deepEqual(beforeAfterMatch('T', '.', { ifNoMatch: `fallback`, fallback: `x` }), [ `x`, `x` ]);
  t.deepEqual(beforeAfterMatch('T', '.', { ifNoMatch: `original`, fallback: `x` }), [ `T`, `T` ]);
  t.throws(() => { beforeAfterMatch(`T`, `.`, { ifNoMatch: `throw` }) });

  t.deepEqual(beforeAfterMatch('.T', '.'), [ ``, `T` ]);
  t.deepEqual(beforeAfterMatch('.', '.'), [ ``, `` ]);

  t.deepEqual(beforeAfterMatch('Hello.There', '.'), [ `Hello`, 'There' ]);
  t.deepEqual(beforeAfterMatch('Hello.There.Poppet', '.'), [ `Hello`, 'There.Poppet' ]);
  t.deepEqual(beforeAfterMatch('Hello.There.Poppet', '.', { fromEnd: true }), [ `Hello.There`, 'Poppet' ]);
  t.deepEqual(beforeAfterMatch('Hello.There.Poppet', `!`), [ 'Hello.There.Poppet', 'Hello.There.Poppet' ]);

  t.deepEqual(beforeAfterMatch('Hello.There.Poppet', '.', { startPos: 6 }), [ `Hello.There`, 'Poppet' ]);
});

test('afterMatch', (t) => {
  t.is(afterMatch('T', '.'), 'T');
  t.is(afterMatch('T', '.', { ifNoMatch: `fallback`, fallback: `x` }), 'x');
  t.is(afterMatch('T', '.', { fallback: `x` }), 'x');
  t.throws(() => afterMatch(`T`, `.`, { ifNoMatch: `throw` }));

  t.is(afterMatch('.T', '.'), 'T');
  t.is(afterMatch('.', '.'), '');

  t.is(afterMatch('Hello.There', '.'), 'There');
  t.is(afterMatch('Hello.There.Poppet', '.'), 'There.Poppet');
  t.is(afterMatch('Hello.There.Poppet', '.', { fromEnd: true }), 'Poppet');
  t.is(afterMatch('Hello.There.Poppet', '!'), 'Hello.There.Poppet');

  t.is(afterMatch('Hello.There.Poppet', '.', { startPos: 6 }), 'Poppet');

});

test('beforeMatch', (t) => {
  t.is(beforeMatch('H', '.'), 'H');
  t.is(beforeMatch('T', '.', { ifNoMatch: `fallback`, fallback: `x` }), 'x');
  t.is(beforeMatch('T', '.', { fallback: `x` }), 'x');
  t.throws(() => beforeMatch(`T`, `.`, { ifNoMatch: `throw` }));

  t.is(beforeMatch('H.', '.'), 'H');
  t.is(beforeMatch('.', '.'), '');

  t.is(beforeMatch('Hello.There', '.'), 'Hello');
  t.is(beforeMatch('Hello.There.Poppet', '.'), 'Hello');
  t.is(beforeMatch('Hello.There.Poppet', '.', { fromEnd: true }), 'Hello.There');
  t.is(beforeMatch('Hello.There.Poppet', '!'), 'Hello.There.Poppet');

  t.is(beforeMatch('Hello.There.Poppet', '.', { startPos: 6 }), 'Hello.There');

  // With fallback
  t.is(beforeMatch(`Hello There`, '!', { fallback: `Bob` }), `Bob`);
  t.throws(() => beforeMatch(`Hello There`, '!', { ifNoMatch: `throw` }));
  t.is(beforeMatch(`Hello There`, '!', { ifNoMatch: `original` }), `Hello There`);
  t.throws(() => beforeMatch(`Hello There`, '!', { ifNoMatch: `fallback` }));

  t.is(beforeMatch(`a.b.c.d`, `.`, { fromEnd: true }), `a.b.c`);
});

test('splitByLength', (t) => {
  const t1 = 'hello there';
  const t11 = splitByLength(t1, 2);
  t.deepEqual(t11, [ 'he', 'll', 'o ', 'th', 'er', 'e' ]);

  // Test with chunk size longer than input string
  const t2 = 'hello';
  const t22 = splitByLength(t2, 5);
  t.deepEqual(t22, [ 'hello' ]);
  const t23 = splitByLength(t2, 50);
  t.deepEqual(t23, [ 'hello' ]);

});

test('omitChars', (t) => {
  t.is(omitChars('hello there', 1, 3), 'ho there');
});

test(`startsEnds`, (t) => {
  t.true(startsEnds(`test`, `t`));
  t.false(startsEnds(`test`, `T`));
  t.true(startsEnds(`This is a test`, `This`, `test`));
  t.false(startsEnds(`This is a test`, `this`, `Test`));
  t.false(startsEnds(`This is a test`, `This`, `not`));
});

test(`between`, (t) => {
  t.is(between('hello [there] pal', '[', ']'), 'there');
  t.is(between('hello [there] p]al', '[', ']'), 'there] p');
  t.is(between('hello [there] p]al', '[', ']', false), 'there');
  t.is(between('hello !there! pal', '!'), 'there');

  t.true(between('hello [there pal', '[', ']') === undefined);
  t.true(between('hello there] pal', '[', ']') === undefined);
});

test(`betweenChomp`, (t) => {
  const r1 = betweenChomp('hello [there] pal', '[', ']');

  t.is(r1[ 1 ], 'there');
  t.is(r1[ 0 ], 'hello  pal');

  const r2 = betweenChomp('hello [there] p]al', '[', ']');
  t.is(r2[ 1 ], 'there] p');
  t.is(r2[ 0 ], 'hello al');

  const r3 = betweenChomp('hello [there] p]al', '[', ']', false);
  t.is(r3[ 1 ], 'there');
  t.is(r3[ 0 ], 'hello  p]al');

  const r4 = betweenChomp('hello !there! pal', '!');
  t.is(r4[ 1 ], 'there');
  t.is(r4[ 0 ], 'hello  pal');

  const r5 = betweenChomp('hello [there] pal', '{', '}');
  t.is(r5[ 0 ], 'hello [there] pal');
  t.true(r5[ 1 ] === undefined);

  const r6 = betweenChomp(`test[1]`, `[`, `]`);
  t.is(r6[ 1 ], `1`);
  t.is(r6[ 0 ], `test`);

  // @ts-expect-error
  t.throws(() => betweenChomp(1, `st`));

  // @ts-expect-error
  t.throws(() => betweenChomp(``, {}));

  // @ts-expect-error
  t.throws(() => betweenChomp(``, `st`, {}));

});

