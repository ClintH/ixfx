import expect from 'expect';
import * as Trees from '../../../collections/tree/index.js';
import { toStringAbbreviate } from '../../../text/Text.js';

function getTestObj() {
  const testObj = {
    name: 'Jill',
    address: {
      street: 'Blah St',
      number: 27
    },
    kids: [
      {
        name: 'John',
        address: {
          street: 'West St',
          number: 35
        }
      },
      {
        name: 'Sam'
      }
    ]
  }
  return testObj;
}

const countChildChanges = (n: Trees.DiffNode<any>): number => {
  let totalChanged = n.value?.childChanged ? 1 : 0;
  for (const c of Trees.Mutable.depthFirst(n)) {
    totalChanged += c.value?.childChanged ? 1 : 0;
  }
  return totalChanged;
}

test('tree-compare', () => {
  const t1 = Trees.FromObject.create(getTestObj(), { valuesAtLeaves: true });

  // Comparing same object --- no expected changes
  const r1 = Trees.Mutable.compare(t1, t1);
  expect(r1.value?.added.length).toBe(0);
  expect(r1.value?.removed.length).toBe(0);
  expect(r1.value?.childChanged).toBe(false);
  expect(r1.value?.valueChanged).toBe(false);

  // Compare object with top-level field value change
  const v2 = getTestObj();
  v2.name = `Jane`;
  const t2 = Trees.FromObject.create(v2, { valuesAtLeaves: true });
  const r2 = Trees.Mutable.compare(t1, t2);
  expect(r2.value?.added.length).toBe(1);
  expect(r2.value?.removed.length).toBe(1);
  expect(r2.value?.childChanged).toBe(true);
  expect(countChildChanges(r2)).toBe(1);


  // Compare deep field value change
  const v3 = getTestObj();
  // @ts-ignore
  v3.kids[ 0 ].address.number = 20;

  const t3 = Trees.FromObject.create(v3, { valuesAtLeaves: true });

  const r3 = Trees.Mutable.compare(t1, t3);
  expect(countChildChanges(r3)).toBe(4);

});