import expect from 'expect';
import * as Basic from '../../data/BasicProcessors.js';
import * as Process from '../../data/Process.js';
import { isApprox } from "../../numbers/IsApprox.js";

test('seen', () => {
  const c1Results: string[] = [];
  const c1 = Process.flow(
    Process.seenToUndefined(),
    v => {
      c1Results.push(v as string);
    }
  );
  c1('hello');
  c1('hello');
  c1('bye');
  expect(c1Results).toEqual([ `hello`, undefined, `bye` ]);

  const c2Results: any[] = [];
  const c2 = Process.flow(
    Process.seenToUndefinedByKey(),
    v => {
      c2Results.push(v);
    }
  );
  c2({ name: `a` });
  c2({ name: `b` });
  c2({ name: `a` });
  expect(c2Results).toEqual([ { name: 'a' }, { name: 'b' }, undefined ]);

  const c3 = Process.flow(
    Process.seenLastToUndefined
  )
});

test(`basic`, () => {
  const c1 = Process.flow(Basic.max(), Process.seenLastToUndefined());
  expect(c1(100)).toBe(100);
  expect(c1(90)).toBeFalsy();
  // @ts-expect-error
  expect(c1(null)).toBeFalsy();
  expect(c1(110)).toBe(110);

  const c2Results: number[] = [];
  const c2 = Process.flow(
    Basic.max(),
    Process.seenLastToUndefined(),
    Process.ifNotUndefined(v => {
      c2Results.push(v);
    })
  );
  c2(100);
  c2(90);
  c2(110);
  expect(c2Results).toEqual([ 100, 110 ]);

  const c3Results: number[] = [];
  const c3 = Process.flow(
    Basic.max(),
    Process.seenLastToUndefined(),
    Process.cancelIfUndefined(),
    (v => {
      c3Results.push(v);
    })
  );
  c3(100);
  c3(90);
  c3(110);
  expect(c3Results).toEqual([ 100, 110 ]);
});

test(`math`, () => {
  const c1 = Process.flow(Basic.max());
  expect(c1(100)).toBe(100);
  expect(c1(110)).toBe(110);
  expect(c1(90)).toBe(110);
  // @ts-expect-error
  expect(c1(undefined)).toBe(110);
  // @ts-expect-error
  expect(c1(null)).toBe(110);
  // @ts-expect-error
  expect(c1(`hello`)).toBe(110);


  const c2 = Process.flow(Basic.min());
  expect(c2(100)).toBe(100);
  expect(c2(110)).toBe(100);
  expect(c2(90)).toBe(90);
  // @ts-expect-error
  expect(c2(undefined)).toBe(90);
  // @ts-expect-error
  expect(c2(null)).toBe(90);
  // @ts-expect-error
  expect(c2(`hello`)).toBe(90);

  const c3 = Process.flow(Basic.sum());
  expect(c3(10)).toBe(10);
  expect(c3(20)).toBe(30);
  expect(c3(30)).toBe(60);
  // @ts-expect-error
  expect(c3(undefined)).toBe(60);
  // @ts-expect-error
  expect(c3(null)).toBe(60);
  // @ts-expect-error
  expect(c3(`hello`)).toBe(60);

  const c4 = Process.flow(Basic.tally(false));
  expect(c4(100)).toBe(1);
  expect(c4(110)).toBe(2);
  expect(c4(90)).toBe(3);
  expect(c4(undefined)).toBe(4);
  expect(c4(null)).toBe(5);
  expect(c4(`hello`)).toBe(6);

})

