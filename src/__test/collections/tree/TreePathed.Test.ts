import expect from 'expect';
import { type PathOpts, asDynamicTraversable, create, getByPath, traceByPath, children, prettyPrint } from '../../../collections/tree/TraverseObject.js';
import * as TraversableTree from '../../../collections/tree/TraversableTree.js';
import * as TreeArrayBacked from '../../../collections/tree/TreeMutable.js';
import * as TreePathed from '../../../collections/tree/Pathed.js';

import { isEqualValueDefault } from '../../../util/IsEqual.js';

test(`tree-dotted-path`, () => {
  const root = TreePathed.addValueByPath({}, 'c');
  TreePathed.addValueByPath({ x: 'admin' }, 'c.users.admin', root);
  expect(TreeArrayBacked.computeMaxDepth(root)).toBe(2); // since root is not counted
  const c = TreeArrayBacked.findAnyChildByValue({ value: { x: "admin" }, label: "admin", }, root, isEqualValueDefault);
  expect(c).toBeTruthy();
  TreePathed.addValueByPath({ x: 'admin2' }, 'c.users.admin', root);
});

test(`tree-dotted-overwrite`, () => {
  const n = TreePathed.addValueByPath({ x: 1 }, `c.users.admin`);
  const root = TreeArrayBacked.getRoot(n);
  expect(TreePathed.valueByPath(`c.users.admin`, root)).toEqual({ x: 1 })
  const n2 = TreePathed.addValueByPath({ x: 2 }, 'c.users.admin', root, { duplicates: 'overwrite' });
  expect(TreePathed.valueByPath(`c.users.admin`, root)).toEqual({ x: 2 })
});

test(`tree-dotted-ignore`, () => {
  const n = TreePathed.addValueByPath({ x: 1 }, `c.users.admin`);
  const root = TreeArrayBacked.getRoot(n);
  expect(TreePathed.valueByPath(`c.users.admin`, root)).toEqual({ x: 1 })
  const n2 = TreePathed.addValueByPath({ x: 2 }, 'c.users.admin', root, { duplicates: 'ignore' });
  expect(TreePathed.valueByPath(`c.users.admin`, root)).toEqual({ x: 1 })
});

test(`tree-dotted-multiple`, () => {
  const n = TreePathed.addValueByPath({ x: 1 }, `c.users.admin`);
  const root = TreeArrayBacked.getRoot(n);
  const n2 = TreePathed.addValueByPath({ x: 2 }, 'c.users.admin', root, { duplicates: 'allow' });
  const n3 = TreePathed.addValueByPath({ x: 3 }, 'c.users.admin', root, { duplicates: 'allow' });
  const values = TreePathed.valuesByPath(`c.users.admin`, root);

  expect(values).toEqual([ { x: 1 }, { x: 2 }, { x: 3 } ]);
});


test(`tree-dotted-wrapper`, () => {
  const root = TreePathed.create({ duplicates: `allow` });
  root.add({ x: 'admin' }, 'c.users.admin');
  root.add({ x: `admin2` }, `c.users.admin`);
  root.add({ x: `blah` }, `c.users.guest`);
  expect(root.hasPath(`c.users.admin`)).toBe(true);
  expect(root.getValues(`c.users.admin`)).toEqual([ { x: `admin` }, { x: `admin2` } ]);
  expect(root.childrenLength(`c.users`)).toBe(2);
  expect(root.childrenLength(`c`)).toBe(1);

  // Removal
  root.add({ x: 12 }, `c.users.blerg`);
  expect(root.hasPath(`c.users.blerg`)).toBe(true);
  expect(root.remove(`c.users.notfound`)).toBe(false);
  expect(root.remove(`c.users.blerg`)).toBe(true);
  expect(root.hasPath(`c.users.blerg`)).toBe(false);
})