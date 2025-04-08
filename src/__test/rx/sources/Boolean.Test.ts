import expect from 'expect';
import * as Rx from '../../../rx/index.js';
test(`rx-boolean`, done => {
  const nonInit = Rx.From.boolean();
  expect(nonInit.last()).toBeFalsy();
  expect(Rx.hasLast(nonInit)).toBe(false);
  expect.assertions(10);
  let count = 0;
  nonInit.on(v => {
    count++;
    if (count === 1) {
      expect(v.value).toBe(true);
    } else if (count === 2) {
      expect(v.value).toBe(false);
    } else done.fail(`Unexpectedly called three times`);

  });
  nonInit.set(true);
  expect(nonInit.last()).toBe(true);
  expect(Rx.hasLast(nonInit)).toBe(true);

  nonInit.set(false);
  expect(nonInit.last()).toBe(false);
  expect(Rx.hasLast(nonInit)).toBe(true);

  const x = Rx.From.boolean(false);
  expect(x.last()).toBe(false);
  expect(Rx.hasLast(x)).toBe(true);
});