/* eslint-disable */
import { expect, test } from '@jest/globals';
import { startsEnds, between, betweenChomp, omitChars, splitByLength } from '../Text.js';

test('splitByLength', () => {
  const t1 = 'hello there';
  const t11 = splitByLength(t1, 2);
  expect(t11).toEqual(['he', 'll', 'o ', 'th', 'er', 'e']);

  // Test with chunk size longer than input string
  const t2 = 'hello';
  const t22 = splitByLength(t2, 5);
  expect(t22).toEqual(['hello']);
  const t23 = splitByLength(t2, 50);
  expect(t23).toEqual(['hello']);
  
});

test('omitChars', () => {
  expect(omitChars('hello there', 1, 3)).toEqual('ho there');
});

test(`startsEnds`, () => {
  expect(startsEnds(`test`, `t`)).toBeTruthy();
  expect(startsEnds(`test`, `T`)).toBeFalsy();
  expect(startsEnds(`This is a test`, `This`, `test`)).toBeTruthy();
  expect(startsEnds(`This is a test`, `this`, `Test`)).toBeFalsy();
  expect(startsEnds(`This is a test`, `This`, `not`)).toBeFalsy();
});

test(`between`, () => {
  expect(between('hello [there] pal', '[', ']')).toEqual('there');
  expect(between('hello [there] p]al', '[', ']')).toEqual('there] p');
  expect(between('hello [there] p]al', '[', ']', false)).toEqual('there');
  expect(between('hello !there! pal', '!')).toEqual('there');

  expect(between('hello [there pal', '[', ']')).toBeUndefined();
  expect(between('hello there] pal', '[', ']')).toBeUndefined();
});

test(`betweenChomp`, () => {
  const r1 = betweenChomp('hello [there] pal', '[', ']');
  
  expect(r1[1]).toEqual('there');
  expect(r1[0]).toEqual('hello  pal');
  
  const r2 = betweenChomp('hello [there] p]al', '[', ']');
  expect(r2[1]).toEqual('there] p');
  expect(r2[0]).toEqual('hello al');

  const r3 = betweenChomp('hello [there] p]al', '[', ']', false);
  expect(r3[1]).toEqual('there');
  expect(r3[0]).toEqual('hello  p]al');

  const r4 = betweenChomp('hello !there! pal', '!');
  expect(r4[1]).toEqual('there');
  expect(r4[0]).toEqual('hello  pal');

  const r5 = betweenChomp('hello [there] pal', '{', '}');
  expect(r5[0]).toEqual('hello [there] pal');
  expect(r5[1]).toBeUndefined();

});

