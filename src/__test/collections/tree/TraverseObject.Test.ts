import test from 'ava';
import { type PathOpts, asDynamicTraversable, create, getByPath, traceByPath, children, toStringDeep } from '../../../collections/tree/TraverseObject.js';
import * as TraversableTree from '../../../collections/tree/TraversableTree.js';
import * as TreeMutable from '../../../collections/tree/TreeMutable.js';
import { isEqualValueDefault } from '../../../IsEqual.js';

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
  }
  return testObj;
}

test(`as-tree`, t => {
  const r1 = create(getTestObj());
  t.deepEqual(r1.value?.value, getTestObj());
  t.is(r1.childrenStore.length, 3);
  t.deepEqual(r1.childrenStore[ 0 ].value, { name: `name`, value: `Jill` });
  console.log(TreeMutable.toStringDeep(r1));
  // const testMap = getTestMap();
  // const r2 = create(testMap, `obj`);
  // t.is(r2.value?.value, testMap);
  // t.is(r2.childrenStore.length, 2);
});

// test(`as-tree-values`, t => {
//   const r1 = create(getTestObj(), { onlyStoreValues: true });
//   t.deepEqual(r1.value?.value, getTestObj());
//   t.is(r1.childrenStore.length, 3);
//   console.log(toStringDeep(r1));
//   t.deepEqual(r1.childrenStore[ 0 ].value?.value, { name: `name`, value: `Jill` });
//   // const testMap = getTestMap();
//   // const r2 = create(testMap, `obj`);
//   // t.is(r2.value?.value, testMap);
//   // t.is(r2.childrenStore.length, 2);
// });


test(`as-traversable-object`, t => {
  const r1 = asDynamicTraversable(getTestObj(), { name: `obj` });
  t.true(TraversableTree.hasChildValue(r1, { name: `name`, value: `Jill` }, isEqualValueDefault));
  t.true(TraversableTree.hasChildValue(r1, {
    name: `address`, value: {
      street: 'Blah St',
      number: 27
    }
  }, isEqualValueDefault));
  t.false(TraversableTree.hasChildValue(r1, {
    // @ts-ignore
    name: `address`, address: {
      street: 'West St',
      number: 35
    }
  }, isEqualValueDefault));

  t.true(TraversableTree.hasAnyChildValue(r1, { name: `number`, value: 35 }, isEqualValueDefault));

  const r1a = TraversableTree.findAnyChildByValue(r1, { name: 'name', value: 'John' }, isEqualValueDefault);
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

  t.true(TraversableTree.hasChildValue(r1, { name: `test[1]`, value: 2 }, isEqualValueDefault));
  t.false(TraversableTree.hasChildValue(r1, { name: `test[10]`, value: 10 }, isEqualValueDefault));
  t.is(TraversableTree.childrenLength(r1), 5);
})


// test(`fromUnknown`, t => {
//   const r1 = fromUnknown([ 1, 2, 3, 4, 5 ], `array`);
//   console.log(prettyPrint(r1));
//   const r2 = fromUnknown([
//     { name: `John`, size: 20 },
//     { name: `Jill`, size: 20 }
//   ], `array`);
//   console.log(prettyPrint(r2));

//   const r3 = fromUnknown(getTestObj(), `obj`);
//   console.log(prettyPrint(r3));

//   const r4 = fromUnknown(getTestMap(), `map`);
//   console.log(prettyPrint(r4));
// });



// test(`isEqual`, (t) => {
//   const a1 = getTestObj();
//   const b1 = getTestObj();
//   t.true(isEqual(a1, b1));

//   // const b2 = getTestObj();
//   // b2.kids[ 0 ].name = `JOHN`;
//   // t.false(isEqual(a1, b2));

//   // // Custom equalit that ignores uppercase name
//   // t.true(isEqual(a1, b2, (a, b) => {
//   //   return JSON.stringify(a).toLowerCase() === JSON.stringify(b).toLowerCase()
//   // }));

//   // const b3 = getTestObj();
//   // b3.kids.push({ name: `New` });
//   // t.false(isEqual(a1, b3));

//   // const b4 = getTestObj();
//   // (b4 as any).gloorp = true;
//   // t.false(isEqual(a1, b4));

//   // const b5 = getTestObj();
//   // b5.name = `Jilly`;
//   // t.false(isEqual(a1, b5));

// });

// test('getLengthChildren', (t) => {
//   t.is(getLengthChildren(getTestObj()), 3);
//   t.is(getLengthChildren(getTestMap()), 2);
// });

test('direct-children', (t) => {
  t.deepEqual([ ...children(getTestObj()) ], [
    { name: "name", value: "Jill" },
    { name: "address", value: { number: 27, street: "Blah St" } },
    {
      name: "kids", value: [
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
  t.deepEqual([ ...children(simpleObj) ], [
    {
      name: "colour", value: {
        b: 0.5,
        g: 0.5,
        r: 0.5
      }
    } ]);

  const colours = [ { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 }, { r: 0, g: 0, b: 1 } ];
  t.deepEqual([ ...children(colours, { name: 'colours' }) ], [
    { name: "colours[0]", value: { r: 1, g: 0, b: 0 } },
    { name: "colours[1]", value: { r: 0, g: 1, b: 0 } },
    { name: "colours[2]", value: { r: 0, g: 0, b: 1 } },
  ]);
});

test('trace-by-path', (t) => {
  const o = getTestObj();
  const opts: PathOpts = {
    separator: '.',
    allowArrayIndexes: true
  }
  t.deepEqual([ ...traceByPath('kids[1]', o, opts) ],
    [
      { name: "kids[1]", value: { "name": "Sam" } }
    ]);
  t.deepEqual([ ...traceByPath('address.street', o, opts) ], [
    { name: "address", value: { "number": 27, "street": "Blah St" } },
    { name: "street", value: "Blah St" }
  ]);
  t.deepEqual([ ...traceByPath('kids[0].address.street', o, opts) ], [
    { name: "kids[0]", value: { "address": { "number": 35, "street": "West St" }, "name": "John" } },
    { name: "address", value: { "number": 35, "street": "West St" } },
    { name: "street", value: "West St" }
  ]);

  const t2 = getTestMap();
  t.deepEqual([ ...traceByPath('jill.address.street', t2, opts) ], [
    { name: "jill", value: { "address": { "number": 27, "street": "Blah St" } } },
    { name: "address", value: { "number": 27, "street": "Blah St" } },
    { name: "street", value: "Blah St" }
  ]);

  const opts2: PathOpts = {
    separator: '.',
    allowArrayIndexes: false
  }

  // Not found when we don't use array indexes
  t.deepEqual([ ...traceByPath('kids[1]', t, opts2) ], [
    { name: 'kids[1]', value: undefined }
  ]);
  t.deepEqual([ ...traceByPath('kids[0].address.street', t, opts2) ], [
    { name: 'kids[0]', value: undefined }
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
  t.deepEqual(e, { name: "postcode", value: 1000 });

  t.deepEqual(getByPath('jane.address.country', people), { name: 'country', value: undefined });
  t.deepEqual(getByPath('jane.address.country.state', people), { name: 'country', value: undefined });

  t.deepEqual([ ...traceByPath('jane.address.street.toofar', people) ], [
    { name: "jane", value: { address: { postcode: 1000, street: 'West St', city: 'Blahville' }, colour: 'red' } },
    { name: "address", value: { postcode: 1000, street: 'West St', city: 'Blahville' } },
    { name: "street", value: "West St" },
    { name: "toofar", value: undefined }
  ]);

});