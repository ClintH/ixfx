import expect from 'expect';
import { mapObjectShallow, mapObjectByObject } from '../../data/MapObject.js';

test(`by-object`, () => {
  const a = {
    name: `john`,
    size: 10
  };
  const r1 = mapObjectByObject(a, {
    // Should be ignored
    blah: () => 10,
    name: (value: string) => value.toUpperCase(),
  });
  expect(r1).toEqual({
    name: `JOHN`,
    size: 10 // Size carries forward
  });
});

test('callback', () => {
  const t1 = {
    name: `jane`,
    size: 10,
    flag: true,
    a: {
      b: {
        c: {
          deepField: `true`
        }
      }
    }
  }
  let values: any[] = [];
  let fields: any[] = [];
  let indexes: any[] = [];

  mapObjectShallow(t1, args => {
    values.push(args.value);
    fields.push(args.field);
    indexes.push(args.index);
  });

  expect(values).toEqual([ `jane`, 10, true, {
    b: {
      c: {
        deepField: `true`
      }
    }
  } ]);
  expect(fields).toEqual([ `name`, `size`, `flag`, `a` ]);
  expect(indexes).toEqual([ 0, 1, 2, 3 ]);
});

test('results', () => {
  const o1a = {
    x: 10,
    y: 20,
  };

  // Convert fields to strings
  const o1b = mapObjectShallow<typeof o1a, string>(o1a, (args) => args.value.toString());
  // Test conversion
  expect(o1b).toEqual({ x: '10', y: '20' });
  // Test original was not changed
  expect(o1a).toEqual({ x: 10, y: 20 });

  // Changes per-field
  const o2a = { width: 100, height: 250, colour: 'red' };
  const o2b = mapObjectShallow(o2a, args => {
    if (args.field === 'width') return args.value * 3;
    else if (typeof args.value === 'number') return args.value * 2;
    return args.value;
  });
  // Test per-field change
  expect(o2b).toEqual({ width: 300, height: 500, colour: 'red' });
  // Test original was not changed
  t.like(o2a, { width: 100, height: 250, colour: 'red' });
});
