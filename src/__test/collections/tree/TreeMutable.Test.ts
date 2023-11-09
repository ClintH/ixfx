import test from 'ava';
import * as TreeMutable from '../../../collections/tree/TreeMutable.js';
import * as TreeTraverse from '../../../collections/tree/TraversableTree.js';
import type { LabelledSingleValue } from 'src/collections/tree/Types.js';

test(`compute-max-depth`, t => {
  const r = TreeMutable.root();
  t.is(TreeMutable.computeMaxDepth(r), 0);
});

const getTestObj = () => {
  const obj = {
    colour: { r: 1, g: 2, b: 3 },
    pressure: 10,
    address: {
      street: 'West',
      number: 100
    },
    nested: {
      nested2: {
        values: [ 1, 2, 3 ]
      }
    }
  }
  return obj;
}
test(`from-plain-object`, t => {
  const obj = getTestObj();
  const tree = TreeMutable.fromPlainObject(obj);
  t.is(TreeMutable.childrenLength(tree), 4);
  t.is(TreeMutable.computeMaxDepth(tree), 3);
  t.notThrows(() => TreeMutable.throwTreeTest(tree));
});

test(`tree-follow`, t => {
  const tree = TreeMutable.fromPlainObject(getTestObj());

  // Should return no values
  const falsePred = (v: any, depth: number) => false;
  const r1 = [ ...TreeMutable.followValue(tree, falsePred) ];
  t.is(r1.length, 0);

  // Only match 'colour'
  const colourPred = (v: any, depth: number) => v.label === `colour`;
  const r2 = [ ...TreeMutable.followValue(tree, colourPred) ];
  t.is(r2.length, 1);

  // Test path
  const path1 = 'nested.nested2.values'.split('.');
  const nestedPred1 = (v: LabelledSingleValue<any>, depth: number) => {
    if (v.label === path1[ 0 ]) {
      path1.shift();
      return true;
    }
    return false;
  }
  const r3 = [ ...TreeMutable.followValue(tree, nestedPred1) ];
  t.is(r3.length, 3);
  t.deepEqual(r3.at(-1), { label: `values`, value: [ 1, 2, 3 ] });

  // Test path that doesn't complete
  const path2 = 'nested.nested2.notfound'.split('.');
  const nestedPred2 = (v: LabelledSingleValue<any>, depth: number) => {
    if (v?.label === path2[ 0 ]) {
      path2.shift();
      return true;
    }
    return false;
  }
  const r4 = [ ...TreeMutable.followValue(tree, nestedPred2) ];
  t.is(r4.length, 2);
  t.deepEqual(r4.at(-1)?.label, `nested2`);
});

test(`array-backed-wrap`, t => {
  const rootValue = {};
  const r = TreeMutable.rootWrapped<any>(rootValue);
  t.is(r.getValue(), rootValue);
  const helloNode = r.addValue(`hello`);
  t.true(r.hasChild(helloNode));
  t.true(r.hasChild(helloNode.wraps));

  t.true(helloNode.hasParent(r));
  t.true(helloNode.hasAnyParent(r));
  t.true(helloNode.hasParent(r.wraps));
  t.true(helloNode.hasAnyParent(r.wraps));

  const subHelloNode = helloNode.addValue(`sub-hello`);
  t.true(subHelloNode.hasParent(helloNode));
  t.true(subHelloNode.hasAnyParent(r));
  t.true(subHelloNode.hasAnyParent(helloNode));

  t.true(r.hasAnyChild(subHelloNode));
  t.true(r.hasAnyChild(helloNode));
  t.false(r.hasChild(subHelloNode));
});

test('array-backed-tree', (t) => {
  const rootValue = {}
  const r = TreeMutable.root<any>(rootValue);

  t.is(TreeMutable.childrenLength(r), 0);

  t.is(TreeMutable.value(r), rootValue);

  // Can't add self as a child
  t.throws(() => TreeMutable.add(r, r));

  // Not a child of self
  t.falsy(TreeMutable.hasChild(r, r));

  // Add a child
  const c1 = TreeMutable.addValue(`c1-value`, r);

  // Check parent/child relations
  t.true(TreeMutable.hasChild(c1, r));
  t.true(TreeMutable.hasAnyChild(c1, r));

  t.true(TreeMutable.hasParent(c1, r));
  t.true(TreeMutable.hasAnyParent(c1, r));

  // Add a sub-child of c1
  const c1c1 = TreeMutable.addValue(`c1-c1-value`, c1);
  t.true(TreeMutable.hasParent(c1c1, c1));
  t.true(TreeMutable.hasChild(c1c1, c1));

  t.false(TreeMutable.hasChild(c1c1, r));
  t.true(TreeMutable.hasAnyChild(c1c1, r));

  // By default, only checks immediate parent
  t.false(TreeMutable.hasParent(c1c1, r));

  // But if we go up chain, should be true
  t.true(TreeMutable.hasAnyParent(c1c1, r));

  // Cannot add grandchild
  t.throws(() => TreeMutable.add(r, c1c1));

  // Cannot add grandparent to child
  t.throws(() => TreeMutable.add(c1c1, r));

  // --------------
  // Remove node
  TreeMutable.remove(c1c1);
  t.false(TreeMutable.hasParent(c1c1, c1));
  t.false(TreeMutable.hasParent(c1c1, r));
  t.false(TreeMutable.hasChild(c1c1, c1));
  t.false(TreeMutable.hasChild(c1c1, r));
  t.false(TreeMutable.hasAnyChild(c1c1, r));
  t.false(TreeMutable.hasAnyParent(c1c1, r));

});

