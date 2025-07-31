import { test, expect, describe } from 'vitest';
import { removeCircularReferences } from '../../src/records/circular.js';

test(`remove-circular`, () => {
  expect(removeCircularReferences({})).toEqual({});
  expect(removeCircularReferences({ hello: `there`, num: 24 })).toEqual({ hello: `there`, num: 24 });

  const t1 = {
    msg: `hello`,
    position: { x: 10, y: 20 },
    value: false,
    oops: {}
  };
  t1.oops = t1;
  expect(removeCircularReferences(t1)).toEqual({
    msg: `hello`,
    position: { x: 10, y: 20 },
    value: false,
    oops: null
  });

  const t2 = { oops: {} }
  t2.oops = t2;
  expect(removeCircularReferences(t2)).toEqual({ oops: null });

  const t3 = { o1: {}, o2: {} };
  t3.o1 = t3;
  t3.o2 = t3;
  expect(removeCircularReferences(t3)).toEqual({ o1: null, o2: null });

  const t4 = {
    ok: `sure`,
    level1: {
      num: 23,
      level2: {
        flag: true,
        badRef: {}
      }
    }
  }
  t4.level1.level2.badRef = t4;
  expect(removeCircularReferences(t4)).toEqual({
    ok: `sure`,
    level1: {
      num: 23,
      level2: {
        flag: true,
        badRef: null
      }
    }
  });

  const t5 = {
    ok: `sure`,
    level1: {
      num: 23,
      level2: {
        flag: true,
        emptyRef: {}
      }
    }
  }
  // @ts-expect-error as fasd fasd f
  t5.level1.level2 = t5.level1;
  const t5R = removeCircularReferences(t5);
  console.log(t5R);
  expect(t5R).toEqual({
    ok: `sure`,
    level1: {
      num: 23,
      level2: null
    }
  });

});
