import test from 'ava';
import { repeat } from '../../flow/index.js';

test(`repeat`, (t) => {
  const test1 = [ ...repeat(5, () => 1) ];
  t.is(test1.length, 5);

  const test2 = [ ...repeat(0, () => 1) ];
  t.is(test2.length, 0);

  // Error: not a number
  // @ts-ignore
  t.throws(() => [ ...repeat(undefined, () => 10) ]);

  // Test using predicate
  const test3 = [
    ...repeat(
      (repeats): boolean => {
        if (repeats >= 5) return false;
        return true;
      },
      () => 1
    ),
  ];
  t.is(test3.length, 5);

  const test4 = [
    ...repeat(
      (repeats, valuesProduced): boolean => {
        if (valuesProduced >= 20) return false;
        return true;
      },
      () => 1
    ),
  ];
  t.is(test4.length, 20);
});
