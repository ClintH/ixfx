/* eslint-disable */
import test from 'ava';
import {startsEnds, untilMatch, afterMatch, between, betweenChomp, omitChars, splitByLength} from '../Text.js';

test('afterMatch', (t) => {
  t.is(afterMatch('T', '.'), 'T');
  t.is(afterMatch('.T', '.'), 'T');
  t.is(afterMatch('.', '.'), '');

  t.is(afterMatch('Hello.There', '.'), 'There');
  t.is(afterMatch('Hello.There.Poppet', '.'), 'There.Poppet');
  t.is(afterMatch('Hello.There.Poppet', '.', {fromEnd: true}), 'Poppet');
  t.is(afterMatch('Hello.There.Poppet', '!'), 'Hello.There.Poppet');

  t.is(afterMatch('Hello.There.Poppet', '.', {startPos: 6}), 'Poppet');

});

test('untilMatch', (t) => {
  t.is(untilMatch('H', '.'), 'H');
  t.is(untilMatch('H.', '.'), 'H');
  t.is(untilMatch('.', '.'), '');

  t.is(untilMatch('Hello.There', '.'), 'Hello');
  t.is(untilMatch('Hello.There.Poppet', '.'), 'Hello');
  t.is(untilMatch('Hello.There.Poppet', '.', {fromEnd: true}), 'Hello.There');
  t.is(untilMatch('Hello.There.Poppet', '!'), 'Hello.There.Poppet');

  t.is(untilMatch('Hello.There.Poppet', '.', {startPos: 6}), 'There');

});

test('splitByLength', (t) => {
  const t1 = 'hello there';
  const t11 = splitByLength(t1, 2);
  t.deepEqual(t11, ['he', 'll', 'o ', 'th', 'er', 'e']);

  // Test with chunk size longer than input string
  const t2 = 'hello';
  const t22 = splitByLength(t2, 5);
  t.deepEqual(t22, ['hello']);
  const t23 = splitByLength(t2, 50);
  t.deepEqual(t23, ['hello']);

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

  t.is(r1[1], 'there');
  t.is(r1[0], 'hello  pal');

  const r2 = betweenChomp('hello [there] p]al', '[', ']');
  t.is(r2[1], 'there] p');
  t.is(r2[0], 'hello al');

  const r3 = betweenChomp('hello [there] p]al', '[', ']', false);
  t.is(r3[1], 'there');
  t.is(r3[0], 'hello  p]al');

  const r4 = betweenChomp('hello !there! pal', '!');
  t.is(r4[1], 'there');
  t.is(r4[0], 'hello  pal');

  const r5 = betweenChomp('hello [there] pal', '{', '}');
  t.is(r5[0], 'hello [there] pal');
  t.true(r5[1] === undefined);

});

