import test from 'ava';
import { type PathOpts, asDynamicTraversable, create, getByPath, traceByPath, children, prettyPrint } from '../../../collections/tree/TraverseObject.js';
import * as TraversableTree from '../../../collections/tree/TraversableTree.js';
import * as TreeArrayBacked from '../../../collections/tree/TreeMutable.js';
import * as TreePathed from '../../../collections/tree/Pathed.js';

import { isEqualValueDefault } from '../../../IsEqual.js';

test(`tree-dotted-path`, t => {
  const root = TreePathed.addValueByPath({}, 'c');
  TreePathed.addValueByPath({ x: 'admin' }, 'c.users.admin', root);
  t.is(TreeArrayBacked.computeMaxDepth(root), 2); // since root is not counted
  const c = TreeArrayBacked.findAnyChildByValue({ value: { x: "admin" }, label: "admin", }, root, isEqualValueDefault);
  t.truthy(c);
  TreePathed.addValueByPath({ x: 'admin2' }, 'c.users.admin', root);
});

test(`tree-dotted-overwrite`, t => {
  const n = TreePathed.addValueByPath({ x: 1 }, `c.users.admin`);
  const root = TreeArrayBacked.getRoot(n);
  t.deepEqual(TreePathed.valueByPath(`c.users.admin`, root), { x: 1 })
  const n2 = TreePathed.addValueByPath({ x: 2 }, 'c.users.admin', root, { duplicates: 'overwrite' });
  t.deepEqual(TreePathed.valueByPath(`c.users.admin`, root), { x: 2 })
});

test(`tree-dotted-ignore`, t => {
  const n = TreePathed.addValueByPath({ x: 1 }, `c.users.admin`);
  const root = TreeArrayBacked.getRoot(n);
  t.deepEqual(TreePathed.valueByPath(`c.users.admin`, root), { x: 1 })
  const n2 = TreePathed.addValueByPath({ x: 2 }, 'c.users.admin', root, { duplicates: 'ignore' });
  t.deepEqual(TreePathed.valueByPath(`c.users.admin`, root), { x: 1 })
});

test(`tree-dotted-multiple`, t => {
  const n = TreePathed.addValueByPath({ x: 1 }, `c.users.admin`);
  const root = TreeArrayBacked.getRoot(n);
  const n2 = TreePathed.addValueByPath({ x: 2 }, 'c.users.admin', root, { duplicates: 'allow' });
  const n3 = TreePathed.addValueByPath({ x: 3 }, 'c.users.admin', root, { duplicates: 'allow' });
  const values = TreePathed.valuesByPath(`c.users.admin`, root);

  t.deepEqual(values, [ { x: 1 }, { x: 2 }, { x: 3 } ]);
});


test(`tree-dotted-wrapper`, t => {
  const root = TreePathed.create({ duplicates: `allow` });
  root.add({ x: 'admin' }, 'c.users.admin');
  root.add({ x: `admin2` }, `c.users.admin`);
  root.add({ x: `blah` }, `c.users.guest`);
  t.true(root.hasPath(`c.users.admin`));
  t.deepEqual(root.getValues(`c.users.admin`), [ { x: `admin` }, { x: `admin2` } ]);
  t.is(root.childrenLength(`c.users`), 2);
  t.is(root.childrenLength(`c`), 1);

  // Removal
  root.add({ x: 12 }, `c.users.blerg`);
  t.true(root.hasPath(`c.users.blerg`));
  t.false(root.remove(`c.users.notfound`));
  t.true(root.remove(`c.users.blerg`));
  t.false(root.hasPath(`c.users.blerg`));
})