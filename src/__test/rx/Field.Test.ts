import expect from 'expect';
import * as Rx from '../../rx/index.js';

test(`field`, async () => {
  const data = [
    { name: `a` },
    { name: `b` },
    { name: `c` },
    { name: `d` }
  ];
  const f = Rx.field<{ name: string }, string>(data, `name`);
  const values1 = await Rx.toArrayOrThrow(f);
  expect(values1.length).toBe(data.length);
  expect(values1).toEqual([ `a`, `b`, `c`, `d` ]);

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
  expect(values2.length).toBe(data2.length - 1);
  expect(values2).toEqual([ `a`, `b`, `d` ]);

  // With fallbackFieldValue
  const data3 = [
    { name: `a` },
    { name: `b` },
    { nameNot: `c` },
    { name: `d` }
  ];
  // @ts-expect-error
  const f3 = Rx.field<{ name: string }, string>(data3, `name`, { fallbackFieldValue: `` });
  const values3 = await Rx.toArray(f3);
  expect(values3).toEqual([ `a`, `b`, ``, `d` ]);


  // With fallbackFieldObject
  const data4Fallback = {
    name: `fallback`
  }
  // @ts-expect-error
  const f4 = Rx.field<{ name: string }, string>(data3, `name`, { fallbackObject: data4Fallback });
  const values4 = await Rx.toArray(f4);
  expect(values4).toEqual([ `a`, `b`, `fallback`, `d` ]);


});