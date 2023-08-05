import test from 'ava';
import { everyNth } from '../../flow/index.js';

function countMatches<V>(data: readonly V[], nth: number) {
  //eslint-disable-next-line functional/no-let
  let count = 0;
  const f = everyNth(nth);
  data.forEach((d) => {
    if (f(d)) count++;
  });
  return count;
}

test(`everyNth`, (t) => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  t.is(countMatches(data, 0), 0);
  t.is(countMatches(data, 1), 10);
  t.is(countMatches(data, 2), 5);
  t.is(countMatches(data, 10), 1);

  // Error: not a number
  // @ts-ignore
  t.throws(() => everyNth(undefined));

  // Error: not an integer
  // @ts-ignore
  t.throws(() => everyNth(1.5));
});
