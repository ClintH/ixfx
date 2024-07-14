import test from "ava";
import * as Basic from '../../data/BasicProcessors.js';
import * as Process from '../../data/Process.js';

test('seen', t => {
  const c1Results: string[] = [];
  const c1 = Process.chain(
    Process.seenToUndefined(),
    v => {
      c1Results.push(v as string);
    }
  );
  c1('hello');
  c1('hello');
  c1('bye');
  t.deepEqual(c1Results, [ `hello`, undefined, `bye` ]);

  const c2Results: any[] = [];
  const c2 = Process.chain(
    Process.seenToUndefinedByKey(),
    v => {
      c2Results.push(v);
    }
  );
  c2({ name: `a` });
  c2({ name: `b` });
  c2({ name: `a` });
  t.deepEqual(c2Results, [ { name: 'a' }, { name: 'b' }, undefined ]);

  const c3 = Process.chain(
    Process.seenLastToUndefined
  )
});

test(`basic`, t => {
  const c1 = Process.chain(Basic.max(), Process.seenLastToUndefined());
  t.is(c1(100), 100);
  t.falsy(c1(90));
  // @ts-expect-error
  t.falsy(c1(null));
  t.is(c1(110), 110);

  const c2Results: number[] = [];
  const c2 = Process.chain(
    Basic.max(),
    Process.seenLastToUndefined(),
    Process.ifNotUndefined(v => {
      c2Results.push(v);
    })
  );
  c2(100);
  c2(90);
  c2(110);
  t.deepEqual(c2Results, [ 100, 110 ]);

  const c3Results: number[] = [];
  const c3 = Process.chain(
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
  t.deepEqual(c3Results, [ 100, 110 ]);
});

test(`math`, t => {
  const c1 = Process.chain(Basic.max());
  t.is(c1(100), 100);
  t.is(c1(110), 110);
  t.is(c1(90), 110);
  // @ts-expect-error
  t.is(c1(undefined), 110);
  // @ts-expect-error
  t.is(c1(null), 110);
  // @ts-expect-error
  t.is(c1(`hello`), 110);


  const c2 = Process.chain(Basic.min());
  t.is(c2(100), 100);
  t.is(c2(110), 100);
  t.is(c2(90), 90);
  // @ts-expect-error
  t.is(c2(undefined), 90);
  // @ts-expect-error
  t.is(c2(null), 90);
  // @ts-expect-error
  t.is(c2(`hello`), 90);

  const c3 = Process.chain(Basic.sum());
  t.is(c3(10), 10);
  t.is(c3(20), 30);
  t.is(c3(30), 60);
  // @ts-expect-error
  t.is(c3(undefined), 60);
  // @ts-expect-error
  t.is(c3(null), 60);
  // @ts-expect-error
  t.is(c3(`hello`), 60);

  const c4 = Process.chain(Basic.tally(false));
  t.is(c4(100), 1);
  t.is(c4(110), 2);
  t.is(c4(90), 3);
  t.is(c4(undefined), 4);
  t.is(c4(null), 5);
  t.is(c4(`hello`), 6);

})