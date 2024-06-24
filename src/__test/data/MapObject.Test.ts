import test from 'ava';
import { mapObjectShallow } from '../../data/MapObject.js';

test('callback', t => {
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

  t.deepEqual(values, [ `jane`, 10, true, {
    b: {
      c: {
        deepField: `true`
      }
    }
  } ]);
  t.deepEqual(fields, [ `name`, `size`, `flag`, `a` ]);
  t.deepEqual(indexes, [ 0, 1, 2, 3 ]);
});

test('results', (t) => {
  const o1a = {
    x: 10,
    y: 20,
  };

  // Convert fields to strings
  const o1b = mapObjectShallow<typeof o1a, string>(o1a, (args) => args.value.toString());
  // Test conversion
  t.deepEqual(o1b, { x: '10', y: '20' });
  // Test original was not changed
  t.deepEqual(o1a, { x: 10, y: 20 });

  // Changes per-field
  const o2a = { width: 100, height: 250, colour: 'red' };
  const o2b = mapObjectShallow(o2a, args => {
    if (args.field === 'width') return args.value * 3;
    else if (typeof args.value === 'number') return args.value * 2;
    return args.value;
  });
  // Test per-field change
  t.deepEqual(o2b, { width: 300, height: 500, colour: 'red' });
  // Test original was not changed
  t.like(o2a, { width: 100, height: 250, colour: 'red' });
});
