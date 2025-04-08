import expect from 'expect';
import * as TreeMutable from '../../../collections/tree/TreeMutable.js';
import * as TreeTraverse from '../../../collections/tree/TraversableTree.js';
import type { LabelledSingleValue } from '../../../collections/tree/Types.js';

test(`compute-max-depth`, () => {
  const r = TreeMutable.root();
  expect(TreeMutable.computeMaxDepth(r)).toBe(0);
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
test(`from-plain-object`, () => {
  const obj = getTestObj();
  const tree = TreeMutable.fromPlainObject(obj);
  expect(TreeMutable.childrenLength(tree)).toBe(4);
  expect(TreeMutable.computeMaxDepth(tree)).toBe(3);
  expect(() => TreeMutable.throwTreeTest(tree)).not.toThrow();
});

test(`tree-follow`, () => {
  const tree = TreeMutable.fromPlainObject(getTestObj());

  // Should return no values
  const falsePred = (v: any, depth: number) => false;
  const r1 = [ ...TreeMutable.followValue(tree, falsePred) ];
  expect(r1.length).toBe(0);

  // Only match 'colour'
  const colourPred = (v: any, depth: number) => v.label === `colour`;
  const r2 = [ ...TreeMutable.followValue(tree, colourPred) ];
  expect(r2.length).toBe(1);

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
  expect(r3.length).toBe(3);
  expect(r3.at(-1)).toEqual({ label: `values`, value: [ 1, 2, 3 ] });

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
  expect(r4.length).toBe(2);
  expect(r4.at(-1)?.label).toEqual(`nested2`);
});

test(`array-backed-wrap`, () => {
  const rootValue = {};
  const r = TreeMutable.rootWrapped<any>(rootValue);
  expect(r.getValue()).toBe(rootValue);
  const helloNode = r.addValue(`hello`);
  expect(r.hasChild(helloNode)).toBe(true);
  expect(r.hasChild(helloNode.wraps)).toBe(true);

  expect(helloNode.hasParent(r)).toBe(true);
  expect(helloNode.hasAnyParent(r)).toBe(true);
  expect(helloNode.hasParent(r.wraps)).toBe(true);
  expect(helloNode.hasAnyParent(r.wraps)).toBe(true);

  const subHelloNode = helloNode.addValue(`sub-hello`);
  expect(subHelloNode.hasParent(helloNode)).toBe(true);
  expect(subHelloNode.hasAnyParent(r)).toBe(true);
  expect(subHelloNode.hasAnyParent(helloNode)).toBe(true);

  expect(r.hasAnyChild(subHelloNode)).toBe(true);
  expect(r.hasAnyChild(helloNode)).toBe(true);
  expect(r.hasChild(subHelloNode)).toBe(false);
});

test('array-backed-tree', () => {
  const rootValue = {}
  const r = TreeMutable.root<any>(rootValue);

  expect(TreeMutable.childrenLength(r)).toBe(0);

  expect(TreeMutable.value(r)).toBe(rootValue);

  // Can't add self as a child
  expect(() => TreeMutable.add(r, r)).toThrow();

  // Not a child of self
  expect(TreeMutable.hasChild(r, r)).toBeFalsy();

  // Add a child
  const c1 = TreeMutable.addValue(`c1-value`, r);

  // Check parent/child relations
  expect(TreeMutable.hasChild(c1, r)).toBe(true);
  expect(TreeMutable.hasAnyChild(c1, r)).toBe(true);

  expect(TreeMutable.hasParent(c1, r)).toBe(true);
  expect(TreeMutable.hasAnyParent(c1, r)).toBe(true);

  // Add a sub-child of c1
  const c1c1 = TreeMutable.addValue(`c1-c1-value`, c1);
  expect(TreeMutable.hasParent(c1c1, c1)).toBe(true);
  expect(TreeMutable.hasChild(c1c1, c1)).toBe(true);

  expect(TreeMutable.hasChild(c1c1, r)).toBe(false);
  expect(TreeMutable.hasAnyChild(c1c1, r)).toBe(true);

  // By default, only checks immediate parent
  expect(TreeMutable.hasParent(c1c1, r)).toBe(false);

  // But if we go up chain, should be true
  expect(TreeMutable.hasAnyParent(c1c1, r)).toBe(true);

  // Cannot add grandchild
  expect(() => TreeMutable.add(r, c1c1)).toThrow();

  // Cannot add grandparent to child
  expect(() => TreeMutable.add(c1c1, r)).toThrow();

  // --------------
  // Remove node
  TreeMutable.remove(c1c1);
  expect(TreeMutable.hasParent(c1c1, c1)).toBe(false);
  expect(TreeMutable.hasParent(c1c1, r)).toBe(false);
  expect(TreeMutable.hasChild(c1c1, c1)).toBe(false);
  expect(TreeMutable.hasChild(c1c1, r)).toBe(false);
  expect(TreeMutable.hasAnyChild(c1c1, r)).toBe(false);
  expect(TreeMutable.hasAnyParent(c1c1, r)).toBe(false);

});

