import test from 'ava';
import * as Rx from '../../rx/index.js';
import * as Flow from '../../flow/index.js';
import { count } from '../../numbers/Count.js';
import { isApproximately } from '../../numbers/IsApproximately.js';

test(`rx-field`, async t => {
  const data = [
    { name: `a` },
    { name: `b` },
    { name: `c` },
    { name: `d` }
  ];
  const f = Rx.field<{ name: string }, string>(data, `name`);
  const values1 = await Rx.toArrayOrThrow(f);
  t.is(values1.length, data.length);
  t.deepEqual(values1, [ `a`, `b`, `c`, `d` ]);

  // Check with some values that don't have field
  const data2 = [
    { name: `a` },
    { name: `b` },
    { nameNot: `c` },
    { name: `d` }
  ];

  // @ts-expect-error
  const f2 = Rx.field<{ name: string }, string>(data2, `name`);
  const values2 = await Rx.toArray(f2);
  t.is(values2.length, data2.length - 1);
  t.deepEqual(values2, [ `a`, `b`, `d` ]);

  // Again, but include missing fields as undefined
  const data3 = [
    { name: `a` },
    { name: `b` },
    { nameNot: `c` },
    { name: `d` }
  ];
  // @ts-expect-error
  const f3 = Rx.field<{ name: string }, string>(data3, `name`, { missingFieldDefault: `` });
  const values3 = await Rx.toArray(f3);
  t.is(values3.length, data3.length);
  t.deepEqual(values3, [ `a`, `b`, ``, `d` ]);

});