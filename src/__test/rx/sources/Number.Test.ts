import expect from 'expect';
import * as Rx from '../../../rx/index.js';

test(`rx-number`, () => {
  const nonInit = Rx.From.number();
  expect(nonInit.last()).toBeFalsy();
  expect(Rx.hasLast(nonInit)).toBe(false);
  expect.assertions(8);
  nonInit.on(v => {
    expect(v.value).toBe(10);
  });
  nonInit.set(10);
  expect(nonInit.last()).toBe(10);
  expect(Rx.hasLast(nonInit)).toBe(true);

  const x = Rx.From.number(5);
  expect(x.last()).toBeTruthy();
  expect(Rx.hasLast(x)).toBe(true);
  expect(x.last()).toBe(5);
});