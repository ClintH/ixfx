import { test, expect, assert } from 'vitest';
import * as IsEqual from '../src/util/is-equal.js';
import * as ToString from '../src/util/to-string.js';

test(`is-equal`, () => {

  const o1 = { hello: `there` };
  const o2 = { hello: `there` };

  expect(IsEqual.isEmptyEntries({})).toBeTruthy();
  expect(IsEqual.isEmptyEntries({ hello: `there` })).toBeFalsy();
  expect(IsEqual.isEqualContextString(o1, o1, ``)).toBeTruthy();
  expect(IsEqual.isEqualContextString(o1, o2, ``)).toBeTruthy();
  expect(IsEqual.isEqualContextString({ hello: `there` }, { hello: `there!` }, ``)).toBeFalsy();

  expect(IsEqual.isEqualDefault(true, true)).toBeTruthy();
  expect(IsEqual.isEqualDefault(o1, o1)).toBeTruthy();
  expect(IsEqual.isEqualDefault(o1, o2)).toBeFalsy();

  expect(IsEqual.isEqualValueDefault(o1, o1)).toBeTruthy();
  expect(IsEqual.isEqualValueDefault(o1, o2)).toBeTruthy();
  expect(IsEqual.isEqualValueDefault({ hello: `there` }, { hello: `there!` })).toBeFalsy();

  expect(IsEqual.isEqualValuePartial({ ...o2, colour: `red` }, o1)).toBeTruthy();
  expect(IsEqual.isEqualValuePartial({ hello: `there!` }, o1)).toBeFalsy();
  expect(IsEqual.isEqualValuePartial({ a: `there` }, o1)).toBeFalsy();
});

test(`to-string`, () => {
  expect(ToString.toStringDefault('hello')).toEqual('hello');
  expect(ToString.toStringDefault(false)).toEqual('false');
  expect(ToString.toStringDefault(true)).toEqual('true');
  expect(ToString.toStringDefault(undefined)).toBeFalsy();

  expect(ToString.toStringDefault({ size: 10 })).toEqual('{"size":10}');

});