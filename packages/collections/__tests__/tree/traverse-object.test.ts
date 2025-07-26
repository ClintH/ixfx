/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect } from 'vitest';
import { asDynamicTraversable, create, getByPath, traceByPath, children } from '../../src/tree/traverse-object.js';
import * as TraversableTree from '../../src/tree/traversable-tree.js';
import * as TreeMutable from '../../src/tree/tree-mutable.js';
import { isEqualValueDefault, isEqualValuePartial } from '@ixfx/core';
import { toTraversable, type TraverseObjectPathOpts } from '../../src/tree/index.js';


function getTestMap() {
  const testMap = new Map();
  testMap.set('jill', {
    address: {
      street: 'Blah St',
      number: 27
    }
  });
  testMap.set('john', {
    address: {
      street: 'West St',
      number: 35
    }
  });
  return testMap;
}

function getTestObject() {
  return {
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
      { name: 'Sam' }
    ]
  } as const;
}

function createTraversable() {
  return toTraversable(getTestObject());
}
test(`as-tree`, () => {
  const r1 = create(getTestObject(), { name: `test` });
  //onsole.log(toStringDeep(r1));
  expect(r1.value?.sourceValue).toEqual(getTestObject());
  expect(r1.childrenStore.length).toBe(3);
  expect(r1.childrenStore[ 0 ].value).toEqual({ _kind: `entry-static`, name: `name`, sourceValue: `Jill`, ancestors: [ `test` ] });
  expect(r1.childrenStore[ 1 ].value).toEqual({
    _kind: `entry-static`,
    name: `address`, sourceValue: {
      street: 'Blah St',
      number: 27
    }, ancestors: [ `test` ]
  });
  expect(r1.childrenStore[ 2 ].value).toEqual({
    _kind: `entry-static`,
    name: `kids`, sourceValue: [
      {
        name: 'John',
        address: {
          street: 'West St',
          number: 35
        }
      },
      { name: 'Sam' }
    ], ancestors: [ `test` ]
  });

});

test(`has-any-parent-value`, () => {
  const t = createTraversable();
  // @ts-expect-error
  expect(() => TraversableTree.hasAnyParentValue(undefined, `hello`)).toThrow();

  //const street = TraversableTree.find(t, n => n.getValue().name === `street`);

  let johnStreet;
  let kids;
  for (const tt of TraversableTree.depthFirst(t)) {
    const v = tt.getValue();
    if (v.name === `street` && v.sourceValue === `West St`) {
      johnStreet = tt;
    }
    if (v.name === `kids`) {
      kids = tt;
    }
  }
  expect(TraversableTree.hasParentValue(johnStreet, `kids`, (a, b) => {
    return a.name === b;
  }, Number.MAX_SAFE_INTEGER)).toBeTruthy();

});

test(`to-traversable-object`, () => {
  const o = getTestObject();
  const t1 = toTraversable(o);
  expect(t1.getIdentity()).toEqual(o);
  expect(t1.getParent()).toBeFalsy();
  const kidNames = [ ...t1.children() ].map(v => v.getValue().name);
  expect(kidNames).toEqual([ `name`, `address`, `kids` ]);
  // expect(TraversableTree.hasAnyParentValue())
})

test(`to-traversable-node`, () => {
  const t = TreeMutable.root(`root`);
  const tA = TreeMutable.addValue(`a`, t);
  const tB = TreeMutable.addValue(`b`, t);
  const tAA = TreeMutable.addValue(`a-a`, tA);
  const tAB = TreeMutable.addValue(`a-b`, tA);

  const tt = toTraversable(t);
  const kidsRaw = [ ...tt.children() ]
  const kids = [ ...tt.children() ].map(t => t.getValue());
  expect(kids).toStrictEqual([ `a`, `b` ]);

  expect(TraversableTree.hasAnyParentValue(tAB, `a`)).toBeTruthy();
  expect(TraversableTree.hasAnyParentValue(tAB, `root`)).toBeTruthy();
  expect(TraversableTree.hasAnyParentValue(tAB, `b`)).toBeFalsy();


  const p = TraversableTree.findAnyParentByValue(kidsRaw[ 1 ], `root`);
  expect(p).not.toBeUndefined();
});

test(`named-object`, () => {
  const r1 = asDynamicTraversable(getTestObject(), { name: `obj` });
  const r1Children = [ ...r1.children() ].map(v => v.getValue());
  expect(r1Children).toEqual(
    [
      {
        "ancestors": [
          "obj",
        ],
        _kind: `entry-static`,
        "name": "name",
        "sourceValue": "Jill",
      },
      {
        "ancestors": [
          "obj",
        ],
        _kind: `entry-static`,

        "name": "address",
        "sourceValue": {
          "number": 27,
          "street": "Blah St",
        },
      },
      {
        "ancestors": [
          "obj",
        ],
        _kind: `entry-static`,

        "name": "kids",
        "sourceValue": [
          {
            "address": {
              "number": 35,
              "street": "West St",
            },
            "name": "John",
          },
          {
            "name": "Sam",
          },
        ],
      } ]
  );
});

test(`follow-value`, () => {
  const r1 = asDynamicTraversable(getTestObject(), { name: `obj` });

  let callbackCount = 0;
  let iterCount = 0;
  for (const _fv of TraversableTree.followValue(r1, (_node) => {
    callbackCount++;
    return false;
  })) {
    iterCount++;
  };
  expect(callbackCount).toBe(3);
  expect(iterCount).toBe(0);

  callbackCount = 0;
  iterCount = 0;
  const pathSplit = `kids.1.name`.split('.');
  const results: any[] = [];
  for (const fv of TraversableTree.followValue(r1, (node) => {
    callbackCount++;
    if (node.name === pathSplit[ 0 ]) {
      pathSplit.shift();
      return true;
    }
    return false;
  })) {
    iterCount++;
    results.push(fv);
  }
  expect(results).toEqual([
    {
      name: `kids`, _kind: `entry-static`, ancestors: [ `obj` ], sourceValue: [
        { address: { number: 35, street: "West St" }, name: "John" },
        { name: "Sam" }
      ]
    },
    { name: `1`, _kind: `entry-static`, sourceValue: { name: `Sam` }, ancestors: [ `obj`, `kids` ] },
    { name: `name`, _kind: `entry-static`, sourceValue: `Sam`, ancestors: [ `obj`, `kids`, `1` ] }
  ]);
  expect(iterCount).toBe(3);
  expect(callbackCount).toBe(6);

})

test(`as-traversable-object`, () => {
  const r1 = asDynamicTraversable(getTestObject(), { name: `obj` });
  //onsole.log(TraversableTree.toStringDeep(r1));
  expect(
    TraversableTree.hasChildValue(r1, { name: `name`, sourceValue: `Jill`, ancestors: [ "obj" ], _kind: `entry-static`, }, isEqualValueDefault)
  ).toBe(true);

  expect(TraversableTree.hasChildValue(r1, {

    name: `address`, sourceValue: {
      street: 'Blah St',
      number: 27
    },
    ancestors: [ "obj" ],
    _kind: `entry-static`
  }, isEqualValueDefault)).toBe(true);
  expect(TraversableTree.hasChildValue(r1, {
    // @ts-ignore
    name: `address`, address: {
      street: 'West St',
      number: 35
    }
  }, isEqualValueDefault)).toBe(false);

  expect(
    TraversableTree.hasAnyChildValue(r1, { name: `number`, sourceValue: 35, ancestors: [ "obj", "kids", "0", "address" ], _kind: `entry-static` }, isEqualValueDefault)
  ).toBe(true);

  const r1a = TraversableTree.findAnyChildByValue(r1, { name: 'name', sourceValue: 'John' }, isEqualValuePartial);
  expect(r1a).toBeTruthy();
  if (r1a !== undefined) {
    expect(TraversableTree.hasAnyChild(r1, r1a)).toBe(true);
    // const parents = [ ...TraversableTree.parents(r1a) ];
    expect(TraversableTree.hasAnyParent(r1a, r1)).toBe(true);
  }
});

test(`as-traversable-array`, () => {
  const r1 = asDynamicTraversable([ 1, 2, 3, 4, 5 ], { name: `test` });
  const breadthFirst = [ ...TraversableTree.breadthFirst(r1) ];
  expect(breadthFirst.length).toBe(5);
  expect(
    TraversableTree.hasChildValue(r1, { name: `1`, sourceValue: 2, ancestors: [ `test` ] }, isEqualValuePartial)
  ).toBe(true);
  expect(
    TraversableTree.hasChildValue(r1, { name: `0`, sourceValue: 10, ancestors: [ `test` ] }, isEqualValuePartial)
  ).toBe(false);
  expect(TraversableTree.childrenLength(r1)).toBe(5);
})


test('children', () => {
  expect([ ...children(getTestObject()) ]).toEqual([
    { name: "name", leafValue: "Jill", sourceValue: "Jill", _kind: `entry` },
    { name: "address", leafValue: undefined, _kind: `entry`, sourceValue: { number: 27, street: "Blah St" } },
    {
      name: "kids", leafValue: undefined, _kind: `entry`, sourceValue: [
        {
          address: {
            number: 35,
            street: "West St"
          },
          name: "John"
        },
        {
          name: "Sam"
        }
      ]
    }
  ]);

  const verySimpleObject = {
    field: `hello`,
    flag: true
  }
  expect([ ...children(verySimpleObject) ]).toEqual([
    { name: "field", _kind: `entry`, sourceValue: `hello`, leafValue: `hello` },
    { name: "flag", _kind: `entry`, sourceValue: true, leafValue: true },
  ])

  const lessSimpleObject = {
    field: `hello`,
    flag: true,
    colour: { name: 'red', opacity: 0.5 }
  }
  expect([ ...children(lessSimpleObject) ]).toEqual([
    { name: "field", _kind: `entry`, sourceValue: `hello`, leafValue: `hello` },
    { name: "flag", _kind: `entry`, sourceValue: true, leafValue: true },
    { name: "colour", _kind: `entry`, sourceValue: { name: 'red', opacity: 0.5 }, leafValue: undefined },
  ])

  const simpleObject = {
    colour: {
      r: 0.5,
      g: 0.5,
      b: 0.5
    }
  }
  expect([ ...children(simpleObject) ]).toEqual([
    {
      name: "colour",
      _kind: `entry`,
      sourceValue: {
        b: 0.5,
        g: 0.5,
        r: 0.5
      },
      leafValue: undefined
    } ]);

  const colours = [ { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 }, { r: 0, g: 0, b: 1 } ];
  expect([ ...children(colours, { name: 'colours' }) ]).toEqual([
    { name: "0", _kind: `entry`, sourceValue: { r: 1, g: 0, b: 0 }, leafValue: undefined },
    { name: "1", _kind: `entry`, sourceValue: { r: 0, g: 1, b: 0 }, leafValue: undefined },
    { name: "2", _kind: `entry`, sourceValue: { r: 0, g: 0, b: 1 }, leafValue: undefined },
  ]);
});

test('trace-by-path', () => {
  const o = getTestObject();
  const opts: TraverseObjectPathOpts = {
    separator: '.'
  }
  expect([ ...traceByPath('kids.1', o, opts) ]).toEqual(
    [
      {
        name: "kids", ancestors: [], _kind: `entry-ancestors`, leafValue: undefined, sourceValue: [
          { address: { number: 35, street: "West St" }, name: "John" },
          { name: "Sam" }
        ]
      },
      { name: "1", _kind: `entry-ancestors`, ancestors: [ `kids` ], sourceValue: { "name": "Sam" } }
    ]);

  expect([ ...traceByPath('kids.1.name', o, opts) ]).toEqual(
    [
      {
        name: "kids", ancestors: [], _kind: `entry-ancestors`, leafValue: undefined, sourceValue: [
          { address: { number: 35, street: "West St" }, name: "John" },
          { name: "Sam" }
        ]
      },
      { name: "1", ancestors: [ `kids` ], _kind: `entry-ancestors`, sourceValue: { "name": "Sam" }, leafValue: undefined },
      { name: "name", ancestors: [ `kids`, `1` ], _kind: `entry-ancestors`, leafValue: "Sam", sourceValue: "Sam" }
    ]);

  expect([ ...traceByPath('address.street', o, opts) ]).toEqual([
    { name: "address", _kind: `entry-ancestors`, sourceValue: { "number": 27, "street": "Blah St" }, ancestors: [] },
    { name: "street", _kind: `entry-ancestors`, leafValue: "Blah St", sourceValue: "Blah St", ancestors: [ "address" ] }
  ]);

  expect([ ...traceByPath('kids.0.address.street', o, opts) ]).toEqual([
    {
      name: "kids", _kind: `entry-ancestors`, sourceValue: [
        {
          name: 'John',
          address: {
            street: 'West St',
            number: 35
          }
        },
        { name: 'Sam' }
      ], ancestors: []
    },
    {
      name: "0", _kind: `entry-ancestors`, sourceValue: {
        name: 'John',
        address: {
          street: 'West St',
          number: 35
        }
      }, ancestors: [ `kids` ]
    },
    {
      name: "address", _kind: `entry-ancestors`, sourceValue: {
        street: 'West St',
        number: 35
      }, ancestors: [ `kids`, `0` ]
    },
    { name: "street", _kind: `entry-ancestors`, leafValue: "West St", sourceValue: "West St", ancestors: [ `kids`, `0`, `address` ] }
  ]);


  const t2 = getTestMap();

  expect([ ...traceByPath('jill.address.street', t2, opts) ]).toEqual([
    {
      name: "jill", _kind: `entry-ancestors`, sourceValue: {
        address: {
          street: 'Blah St',
          number: 27
        }
      }, ancestors: []
    },
    {
      name: "address", _kind: `entry-ancestors`, sourceValue: {
        street: 'Blah St',
        number: 27
      }, ancestors: [ `jill` ]
    },
    { name: "street", _kind: `entry-ancestors`, leafValue: "Blah St", sourceValue: "Blah St", ancestors: [ `jill`, `address` ] }
  ]);

  // Unknown path
  expect([ ...traceByPath('jill.address.street2', t2, opts) ]).toEqual([
    {
      name: "jill", _kind: `entry-ancestors`, sourceValue: {
        address: {
          street: 'Blah St',
          number: 27
        }
      }, ancestors: []
    },
    {
      name: "address", _kind: `entry-ancestors`, sourceValue: {
        street: 'Blah St',
        number: 27
      }, ancestors: [ `jill` ]
    },
    { name: "street2", _kind: `entry-ancestors`, leafValue: undefined, sourceValue: undefined, ancestors: [ `jill`, `address` ] }
  ]);
});

test('get-by-path', () => {
  const people = {
    jane: {
      address: {
        postcode: 1000,
        street: 'West St',
        city: 'Blahville'
      },
      colour: 'red'
    }
  }
  const postcode = getByPath('jane.address.postcode', people);
  expect(postcode).toEqual({ _kind: `entry-ancestors`, ancestors: [ "jane", "address" ], name: "postcode", leafValue: 1000, sourceValue: 1000 });
  expect(getByPath('jane.address.country', people)).toEqual({ _kind: `entry-ancestors`, ancestors: [ "jane", "address" ], name: 'country', leafValue: undefined, sourceValue: undefined });
  expect(getByPath('jane.address.country.state', people)).toEqual({ _kind: `entry-ancestors`, ancestors: [ "jane", "address" ], name: 'country', leafValue: undefined, sourceValue: undefined });

  expect([ ...traceByPath('jane.address.street.toofar', people) ]).toEqual([
    { _kind: `entry-ancestors`, name: "jane", sourceValue: { address: { postcode: 1000, street: 'West St', city: 'Blahville' }, colour: 'red' }, ancestors: [], leafValue: undefined },
    { _kind: `entry-ancestors`, name: "address", sourceValue: { postcode: 1000, street: 'West St', city: 'Blahville' }, ancestors: [ "jane" ], leafValue: undefined },
    { _kind: `entry-ancestors`, name: "street", leafValue: "West St", ancestors: [ "jane", "address" ], sourceValue: "West St" },
    { _kind: `entry-ancestors`, name: "toofar", leafValue: undefined, ancestors: [ "jane", "address", "street" ], sourceValue: undefined }
  ]);

});

test(`tree-object-compare`, () => {
  const generate = () => ({
    person: {
      name: `Jane`,
      size: 20
    },
    thing: {
      value: true,
      subValue: {
        red: 0.5,
        green: 1,
        blue: 0
      }
    }
  })

  const v1 = generate();
  const v2 = generate();
  v2.thing.subValue.blue = Math.random();
  const tree1 = create(v1, { valuesAtLeaves: true });
  const tree2 = create(v2, { valuesAtLeaves: true });
  const diff1 = TreeMutable.compare(tree1, create(v1, { valuesAtLeaves: true }));
  expect(diff1.value?.added.length).toBe(0);
  expect(diff1.value?.removed.length).toBe(0);
  expect(diff1.value?.childChanged).toBe(false);
  expect(diff1.value?.valueChanged).toBe(false);

  const diff2 = TreeMutable.compare(tree1, tree2);
  expect(diff2.value?.added.length).toBe(0);
  expect(diff2.value?.removed.length).toBe(0);
  expect(diff2.value?.childChanged).toBe(true);
  expect(diff2.value?.valueChanged).toBe(false);

  let valueChanged = 0;
  let childChanged = 0;
  //let changedNode;

  // Top level changes
  for (const diff2Kid of diff2.childrenStore) {
    const v = diff2Kid.value;
    if (v === undefined) continue;
    if (v.valueChanged) valueChanged++;
    if (v.childChanged) childChanged++;
    //if (v.childChanged) changedNode = diff2Kid;
  }

  expect(valueChanged).toBe(0);
  expect(childChanged).toBe(1);
})