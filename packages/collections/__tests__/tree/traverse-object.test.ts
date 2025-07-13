import { test, expect } from 'vitest';
import { type PathOpts, asDynamicTraversable, create, getByPath, traceByPath, children } from '../../src/tree/traverse-object.js';
import * as TraversableTree from '../../src/tree/traversable-tree.js';
import * as TreeMutable from '../../src/tree/tree-mutable.js';
import { isEqualValueDefault, isEqualValuePartial } from '@ixfx/core';


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
      { name: 'Sam' }
    ]
  } as const;
  return testObject;
}

test(`as-tree`, () => {
  const r1 = create(getTestObject(), { name: `test` });
  //onsole.log(toStringDeep(r1));
  expect(r1.value?.value).toEqual(getTestObject());
  expect(r1.childrenStore.length).toBe(3);
  expect(r1.childrenStore[ 0 ].value).toEqual({ name: `name`, value: `Jill`, ancestors: [ `test` ] });
  expect(r1.childrenStore[ 1 ].value).toEqual({
    name: `address`, value: {
      street: 'Blah St',
      number: 27
    }, ancestors: [ `test` ]
  });
  expect(r1.childrenStore[ 2 ].value).toEqual({
    name: `kids`, value: [
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
      name: `kids`, ancestors: [ `obj` ], value: [
        { address: { number: 35, street: "West St" }, name: "John" },
        { name: "Sam" }
      ]
    },
    { name: `1`, value: { name: `Sam` }, ancestors: [ `obj`, `kids` ] },
    { name: `name`, value: `Sam`, ancestors: [ `obj`, `kids`, `1` ] }
  ]);
  expect(iterCount).toBe(3);
  expect(callbackCount).toBe(6);

})

test(`as-traversable-object`, () => {
  const r1 = asDynamicTraversable(getTestObject(), { name: `obj` });
  //onsole.log(TraversableTree.toStringDeep(r1));
  expect(
    TraversableTree.hasChildValue(r1, { name: `name`, value: `Jill`, ancestors: [ "obj" ] }, isEqualValueDefault)
  ).toBe(true);

  expect(TraversableTree.hasChildValue(r1, {
    name: `address`, value: {
      street: 'Blah St',
      number: 27
    },
    ancestors: [ "obj" ]
  }, isEqualValueDefault)).toBe(true);
  expect(TraversableTree.hasChildValue(r1, {
    // @ts-ignore
    name: `address`, address: {
      street: 'West St',
      number: 35
    }
  }, isEqualValueDefault)).toBe(false);

  expect(
    TraversableTree.hasAnyChildValue(r1, { name: `number`, value: 35, ancestors: [ "obj", "kids", "0", "address" ] }, isEqualValueDefault)
  ).toBe(true);

  const r1a = TraversableTree.findAnyChildByValue(r1, { name: 'name', value: 'John' }, isEqualValuePartial);
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
    TraversableTree.hasChildValue(r1, { name: `1`, value: 2, ancestors: [ `test` ] }, isEqualValuePartial)
  ).toBe(true);
  expect(
    TraversableTree.hasChildValue(r1, { name: `0`, value: 10, ancestors: [ `test` ] }, isEqualValuePartial)
  ).toBe(false);
  expect(TraversableTree.childrenLength(r1)).toBe(5);
})


test('direct-children', () => {
  expect([ ...children(getTestObject()) ]).toEqual([
    { name: "name", nodeValue: "Jill", sourceValue: "Jill" },
    { name: "address", nodeValue: undefined, sourceValue: { number: 27, street: "Blah St" } },
    {
      name: "kids", nodeValue: undefined, sourceValue: [
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

  const simpleObject = {
    colour: {
      r: 0.5,
      g: 0.5,
      b: 0.5
    }
  }
  expect([ ...children(simpleObject) ]).toEqual([
    {
      name: "colour", sourceValue: {
        b: 0.5,
        g: 0.5,
        r: 0.5
      }
    } ]);

  const colours = [ { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 }, { r: 0, g: 0, b: 1 } ];
  expect([ ...children(colours, { name: 'colours' }) ]).toEqual([
    { name: "0", sourceValue: { r: 1, g: 0, b: 0 } },
    { name: "1", sourceValue: { r: 0, g: 1, b: 0 } },
    { name: "2", sourceValue: { r: 0, g: 0, b: 1 } },
  ]);
});

test('trace-by-path', () => {
  const o = getTestObject();
  const opts: PathOpts = {
    separator: '.'
  }
  expect([ ...traceByPath('kids.1', o, opts) ]).toEqual(
    [
      {
        name: "kids", ancestors: [], nodeValue: undefined, sourceValue: [
          { address: { number: 35, street: "West St" }, name: "John" },
          { name: "Sam" }
        ]
      },
      { name: "1", ancestors: [ `kids` ], sourceValue: { "name": "Sam" } }
    ]);

  expect([ ...traceByPath('kids.1.name', o, opts) ]).toEqual(
    [
      {
        name: "kids", ancestors: [], nodeValue: undefined, sourceValue: [
          { address: { number: 35, street: "West St" }, name: "John" },
          { name: "Sam" }
        ]
      },
      { name: "1", ancestors: [ `kids` ], sourceValue: { "name": "Sam" }, nodeValue: undefined },
      { name: "name", ancestors: [ `kids`, `1` ], nodeValue: "Sam", sourceValue: "Sam" }
    ]);

  expect([ ...traceByPath('address.street', o, opts) ]).toEqual([
    { name: "address", sourceValue: { "number": 27, "street": "Blah St" }, ancestors: [] },
    { name: "street", nodeValue: "Blah St", sourceValue: "Blah St", ancestors: [ "address" ] }
  ]);

  expect([ ...traceByPath('kids.0.address.street', o, opts) ]).toEqual([
    {
      name: "kids", sourceValue: [
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
      name: "0", sourceValue: {
        name: 'John',
        address: {
          street: 'West St',
          number: 35
        }
      }, ancestors: [ `kids` ]
    },
    {
      name: "address", sourceValue: {
        street: 'West St',
        number: 35
      }, ancestors: [ `kids`, `0` ]
    },
    { name: "street", nodeValue: "West St", sourceValue: "West St", ancestors: [ `kids`, `0`, `address` ] }
  ]);


  const t2 = getTestMap();

  expect([ ...traceByPath('jill.address.street', t2, opts) ]).toEqual([
    {
      name: "jill", sourceValue: {
        address: {
          street: 'Blah St',
          number: 27
        }
      }, ancestors: []
    },
    {
      name: "address", sourceValue: {
        street: 'Blah St',
        number: 27
      }, ancestors: [ `jill` ]
    },
    { name: "street", nodeValue: "Blah St", sourceValue: "Blah St", ancestors: [ `jill`, `address` ] }
  ]);

  // Unknown path
  expect([ ...traceByPath('jill.address.street2', t2, opts) ]).toEqual([
    {
      name: "jill", sourceValue: {
        address: {
          street: 'Blah St',
          number: 27
        }
      }, ancestors: []
    },
    {
      name: "address", sourceValue: {
        street: 'Blah St',
        number: 27
      }, ancestors: [ `jill` ]
    },
    { name: "street2", nodeValue: undefined, sourceValue: undefined, ancestors: [ `jill`, `address` ] }
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
  expect(postcode).toEqual({ ancestors: [ "jane", "address" ], name: "postcode", nodeValue: 1000, sourceValue: 1000 });
  expect(getByPath('jane.address.country', people)).toEqual({ ancestors: [ "jane", "address" ], name: 'country', nodeValue: undefined, sourceValue: undefined });
  expect(getByPath('jane.address.country.state', people)).toEqual({ ancestors: [ "jane", "address" ], name: 'country', nodeValue: undefined, sourceValue: undefined });

  expect([ ...traceByPath('jane.address.street.toofar', people) ]).toEqual([
    { name: "jane", sourceValue: { address: { postcode: 1000, street: 'West St', city: 'Blahville' }, colour: 'red' }, ancestors: [], nodeValue: undefined },
    { name: "address", sourceValue: { postcode: 1000, street: 'West St', city: 'Blahville' }, ancestors: [ "jane" ], nodeValue: undefined },
    { name: "street", nodeValue: "West St", ancestors: [ "jane", "address" ], sourceValue: "West St" },
    { name: "toofar", nodeValue: undefined, ancestors: [ "jane", "address", "street" ], sourceValue: undefined }
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

  // if (changedNode) {
  //   for (const diff2KidKid of changedNode?.childrenStore) {
  //     console.log(diff2KidKid.toString());

  //   }
  // }
  //console.log(diff2);
  //console.log(toStringDeep(tree1));
  //console.log(toStringDeep(tree2));


})