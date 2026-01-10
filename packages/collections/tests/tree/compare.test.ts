/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect, test } from 'vitest';
import * as Trees from '../../src/tree/index.js';
//import { toStringAbbreviate } from '../../../text/Text.js';

function getTestObject() {
  const testObject = {
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
  return testObject;
}

const countChildChanges = (n: Trees.DiffNode<any>): number => {
  let totalChanged = n.value?.childChanged ? 1 : 0;
  for (const c of Trees.Mutable.depthFirst(n)) {
    totalChanged += c.value?.childChanged ? 1 : 0;
  }
  return totalChanged;
}

test('tree-compare', () => {
  const t1 = Trees.FromObject.create(getTestObject(), { valuesAtLeaves: true });

  // Comparing same object --- no expected changes
  const r1 = Trees.Mutable.compare(t1, t1);
  expect(r1.toString()).toBe(
    `a: {"name":"object_ci","ancestors":[],"_kind":"entry-static"} b: {"name":"object_ci","ancestors":[],"_kind":"entry-static"}
Value unchanged. Child changed: false
----
  a: {"name":"name","sourceValue":"Jill","ancestors":["object_ci"],"_kind":"entry-static"} b: {"name":"name","sourceValue":"Jill","ancestors":["object_ci"],"_kind":"entry-static"}
  Value unchanged. Child changed: false
  ----
  a: {"name":"address","ancestors":["object_ci"],"_kind":"entry-static"} b: {"name":"address","ancestors":["object_ci"],"_kind":"entry-static"}
  Value unchanged. Child changed: false
  ----
    a: {"name":"street","sourceValue":"Blah St","ancestors":["object_ci","address"],"_kind":"entry-static"} b: {"name":"street","sourceValue":"Blah St","ancestors":["object_ci","address"],"_kind":"entry-static"}
    Value unchanged. Child changed: false
    ----
    a: {"name":"number","sourceValue":27,"ancestors":["object_ci","address"],"_kind":"entry-static"} b: {"name":"number","sourceValue":27,"ancestors":["object_ci","address"],"_kind":"entry-static"}
    Value unchanged. Child changed: false
    ----
  a: {"name":"kids","ancestors":["object_ci"],"_kind":"entry-static"} b: {"name":"kids","ancestors":["object_ci"],"_kind":"entry-static"}
  Value unchanged. Child changed: false
  ----
    a: {"name":"0","ancestors":["object_ci","kids"],"_kind":"entry-static"} b: {"name":"0","ancestors":["object_ci","kids"],"_kind":"entry-static"}
    Value unchanged. Child changed: false
    ----
      a: {"name":"name","sourceValue":"John","ancestors":["object_ci","kids","0"],"_kind":"entry-static"} b: {"name":"name","sourceValue":"John","ancestors":["object_ci","kids","0"],"_kind":"entry-static"}
      Value unchanged. Child changed: false
      ----
      a: {"name":"address","ancestors":["object_ci","kids","0"],"_kind":"entry-static"} b: {"name":"address","ancestors":["object_ci","kids","0"],"_kind":"entry-static"}
      Value unchanged. Child changed: false
      ----
        a: {"name":"street","sourceValue":"West St","ancestors":["object_ci","kids","0","address"],"_kind":"entry-static"} b: {"name":"street","sourceValue":"West St","ancestors":["object_ci","kids","0","address"],"_kind":"entry-static"}
        Value unchanged. Child changed: false
        ----
        a: {"name":"number","sourceValue":35,"ancestors":["object_ci","kids","0","address"],"_kind":"entry-static"} b: {"name":"number","sourceValue":35,"ancestors":["object_ci","kids","0","address"],"_kind":"entry-static"}
        Value unchanged. Child changed: false
        ----
    a: {"name":"1","ancestors":["object_ci","kids"],"_kind":"entry-static"} b: {"name":"1","ancestors":["object_ci","kids"],"_kind":"entry-static"}
    Value unchanged. Child changed: false
    ----
      a: {"name":"name","sourceValue":"Sam","ancestors":["object_ci","kids","1"],"_kind":"entry-static"} b: {"name":"name","sourceValue":"Sam","ancestors":["object_ci","kids","1"],"_kind":"entry-static"}
      Value unchanged. Child changed: false
      ----
`);

  expect(r1.value?.added.length).toBe(0);
  expect(r1.value?.removed.length).toBe(0);
  expect(r1.value?.childChanged).toBe(false);
  expect(r1.value?.valueChanged).toBe(false);

  // Compare object with top-level field value change
  const v2 = getTestObject();
  v2.name = `Jane`;
  const t2 = Trees.FromObject.create(v2, { valuesAtLeaves: true });
  const r2 = Trees.Mutable.compare(t1, t2);
  expect(r2.value?.added.length).toBe(1);
  expect(r2.value?.removed.length).toBe(1);
  expect(r2.value?.childChanged).toBe(true);
  expect(countChildChanges(r2)).toBe(1);


  // Compare deep field value change
  const v3 = getTestObject();
  // @ts-expect-error
  v3.kids[ 0 ].address.number = 20;

  const t3 = Trees.FromObject.create(v3, { valuesAtLeaves: true });

  const r3 = Trees.Mutable.compare(t1, t3);
  expect(countChildChanges(r3)).toBe(4);

  // expect(r3.toString()).toBe(`asf`);

});