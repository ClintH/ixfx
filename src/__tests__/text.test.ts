/* eslint-disable */
import { startsEnds } from '../Text.js';

test(`startsEnds`, () => {
  expect(startsEnds(`test`, `t`)).toBeTruthy();
  expect(startsEnds(`test`, `T`)).toBeFalsy();
  expect(startsEnds(`This is a test`, `This`, `test`)).toBeTruthy();
  expect(startsEnds(`This is a test`, `this`, `Test`)).toBeFalsy();
  expect(startsEnds(`This is a test`, `This`, `not`)).toBeFalsy();
});