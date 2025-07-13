import { expect, describe, test } from 'vitest';
import * as N from '../src/index.js';

test('isAsyncIterable', () => {
  expect(N.isAsyncIterable([ 1, 2, 3 ])).toBeFalsy();

  const map = new Map();
  map.set(`a`, `b`);

  expect(N.isAsyncIterable(map.values())).toBeFalsy();

  expect(N.isAsyncIterable(`hello`)).toBeFalsy();
  expect(N.isAsyncIterable(undefined)).toBeFalsy();
  expect(N.isAsyncIterable(null)).toBeFalsy();

});

test('isAsyncIterable', () => {
  expect(N.isIterable([ 1, 2, 3 ])).toBeTruthy();

  expect(N.isIterable(`hello`)).toBeFalsy();
  expect(N.isIterable(undefined)).toBeFalsy();
  expect(N.isIterable(null)).toBeFalsy();

  const map = new Map();
  map.set(`a`, `b`);
  expect(N.isIterable(map.values())).toBeTruthy();

});