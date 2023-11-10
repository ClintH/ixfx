import test from 'ava';
import { type PathOpts, asDynamicTraversable, create, getByPath, traceByPath, children, toStringDeep } from '../../../collections/tree/TraverseObject.js';
import * as TraversableTree from '../../../collections/tree/TraversableTree.js';
import * as TreeMutable from '../../../collections/tree/TreeMutable.js';
import { isEqualValueDefault, isEqualValuePartial } from '../../../IsEqual.js';

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
      { name: 'Sam' }
    ]
  } as const;
  return testObj;
}



test(`as-tree`, t => {
  const r1 = create(getTestObj(), { name: `test` });
  //onsole.log(toStringDeep(r1));
  t.deepEqual(r1.value?.value, getTestObj());
  t.is(r1.childrenStore.length, 3);
  t.deepEqual(r1.childrenStore[ 0 ].value, { name: `name`, value: `Jill`, ancestors: [ `test` ] });
  t.deepEqual(r1.childrenStore[ 1 ].value, {
    name: `address`, value: {
      street: 'Blah St',
      number: 27
    }, ancestors: [ `test` ]
  });
  t.deepEqual(r1.childrenStore[ 2 ].value, {
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

test(`follow-value`, t => {
  const r1 = asDynamicTraversable(getTestObj(), { name: `obj` });

  let callbackCount = 0;
  let iterCount = 0;
  for (const fv of TraversableTree.followValue(r1, (node) => {
    callbackCount++;
    return false;
  })) {
    iterCount++;
  };
  t.is(callbackCount, 3);
  t.is(iterCount, 0);

  callbackCount = 0;
  iterCount = 0;
  const pathSplit = `kids.1.name`.split('.');
  const results = [];
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

  t.like(results, [
    { name: `kids`, ancestors: [ `obj` ] },
    { name: `1`, value: { name: `Sam` }, ancestors: [ `obj`, `kids` ] },
    { name: `name`, value: `Sam`, ancestors: [ `obj`, `kids`, `1` ] }
  ]);
  t.is(iterCount, 3);
  t.is(callbackCount, 6);

})

test(`as-traversable-object`, t => {
  const r1 = asDynamicTraversable(getTestObj(), { name: `obj` });
  //onsole.log(TraversableTree.toStringDeep(r1));
  t.true(TraversableTree.hasChildValue(r1, { name: `name`, value: `Jill`, ancestors: [ "obj" ] }, isEqualValueDefault));

  t.true(TraversableTree.hasChildValue(r1, {
    name: `address`, value: {
      street: 'Blah St',
      number: 27
    },
    ancestors: [ "obj" ]
  }, isEqualValueDefault));
  t.false(TraversableTree.hasChildValue(r1, {
    // @ts-ignore
    name: `address`, address: {
      street: 'West St',
      number: 35
    }
  }, isEqualValueDefault));

  t.true(TraversableTree.hasAnyChildValue(r1, { name: `number`, value: 35, ancestors: [ "obj", "kids", "0", "address" ] }, isEqualValueDefault));

  const r1a = TraversableTree.findAnyChildByValue(r1, { name: 'name', value: 'John', ancestors: [] }, isEqualValuePartial);
  t.truthy(r1a);
  if (r1a !== undefined) {
    t.true(TraversableTree.hasAnyChild(r1, r1a));
    const parents = [ ...TraversableTree.parents(r1a) ];
    t.true(TraversableTree.hasAnyParent(r1a, r1));
  }
});

test(`as-traversable-array`, t => {
  const r1 = asDynamicTraversable([ 1, 2, 3, 4, 5 ], { name: `test` });
  const breadthFirst = [ ...TraversableTree.breadthFirst(r1) ];
  t.is(breadthFirst.length, 5);
  t.true(TraversableTree.hasChildValue(r1, { name: `1`, value: 2, ancestors: [ `test` ] }, isEqualValuePartial));
  t.false(TraversableTree.hasChildValue(r1, { name: `0`, value: 10, ancestors: [ `test` ] }, isEqualValuePartial));
  t.is(TraversableTree.childrenLength(r1), 5);
})


test('direct-children', (t) => {
  t.like([ ...children(getTestObj()) ], [
    { name: "name", nodeValue: "Jill" },
    { name: "address", sourceValue: { number: 27, street: "Blah St" } },
    {
      name: "kids", sourceValue: [
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

  const simpleObj = {
    colour: {
      r: 0.5,
      g: 0.5,
      b: 0.5
    }
  }
  t.like([ ...children(simpleObj) ], [
    {
      name: "colour", sourceValue: {
        b: 0.5,
        g: 0.5,
        r: 0.5
      }
    } ]);

  const colours = [ { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 }, { r: 0, g: 0, b: 1 } ];
  t.like([ ...children(colours, { name: 'colours' }) ], [
    { name: "0", sourceValue: { r: 1, g: 0, b: 0 } },
    { name: "1", sourceValue: { r: 0, g: 1, b: 0 } },
    { name: "2", sourceValue: { r: 0, g: 0, b: 1 } },
  ]);
});

test('trace-by-path', (t) => {
  const o = getTestObj();
  const opts: PathOpts = {
    separator: '.'
  }
  t.like([ ...traceByPath('kids.1', o, opts) ],
    [
      { name: "kids", ancestors: [], nodeValue: undefined },
      { name: "1", ancestors: [ `kids` ], sourceValue: { "name": "Sam" } }
    ]);

  t.like([ ...traceByPath('kids.1.name', o, opts) ],
    [
      { name: "kids", ancestors: [], nodeValue: undefined },
      { name: "1", ancestors: [ `kids` ], sourceValue: { "name": "Sam" } },
      { name: "name", ancestors: [ `kids`, `1` ], nodeValue: "Sam" }
    ]);

  t.like([ ...traceByPath('address.street', o, opts) ], [
    { name: "address", sourceValue: { "number": 27, "street": "Blah St" } },
    { name: "street", nodeValue: "Blah St" }
  ]);

  t.like([ ...traceByPath('kids.0.address.street', o, opts) ], [
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
    { name: "street", nodeValue: "West St", ancestors: [ `kids`, `0`, `address` ] }
  ]);


  const t2 = getTestMap();

  t.like([ ...traceByPath('jill.address.street', t2, opts) ], [
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
    { name: "street", nodeValue: "Blah St", ancestors: [ `jill`, `address` ] }
  ]);

  // Unknown path
  t.like([ ...traceByPath('jill.address.street2', t2, opts) ], [
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

test('get-by-path', (t) => {
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
  const e = getByPath('jane.address.postcode', people);
  t.like(e, { name: "postcode", nodeValue: 1000 });
  t.like(getByPath('jane.address.country', people), { name: 'country', nodeValue: undefined });
  t.like(getByPath('jane.address.country.state', people), { name: 'country', nodeValue: undefined });

  t.like([ ...traceByPath('jane.address.street.toofar', people) ], [
    { name: "jane", sourceValue: { address: { postcode: 1000, street: 'West St', city: 'Blahville' }, colour: 'red' } },
    { name: "address", sourceValue: { postcode: 1000, street: 'West St', city: 'Blahville' } },
    { name: "street", nodeValue: "West St" },
    { name: "toofar", nodeValue: undefined }
  ]);

});