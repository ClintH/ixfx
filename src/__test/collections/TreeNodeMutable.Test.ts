/* eslint-disable */
import test from 'ava';
import {treeNodeMutable} from '../../collections/TreeNodeMutable.js';

test('basic', (t) => {
  const rootValue = {}
  const r = treeNodeMutable<any>(rootValue, 'root');

  t.is([...r.children()].length, 0);
  t.is(r.label, 'root');
  t.is(r.value, rootValue);

  // Can't add self as a child
  t.throws(() => r.add(r));
  // Not a child of self
  t.falsy(r.hasChild(r));

  // Add a child
  const c1 = treeNodeMutable('c1-value', 'c1-label');
  r.add(c1);

  // Check parent/child relations
  t.true(r.hasChild(c1));
  t.true(c1.hasParent(r));

  // Add a sub-child of c1
  const c1c1 = treeNodeMutable('c1-c1-value', 'c1-c1-label');
  c1.add(c1c1);
  t.true(c1c1.hasParent(c1));
  t.false(c1c1.hasParent(r));
  t.true(c1.hasChild(c1c1));

  t.false(r.hasChild(c1c1));
  t.true(r.hasAnyChild(c1c1));

  // By default, only checks immediate parent
  t.false(c1c1.hasParent(r));
  // But if we go up chain, should be true
  t.true(c1c1.hasAnyParent(r));

  // Cannot add grandchild
  t.throws(() => r.add(c1c1));
  // Cannot add grandparent to child
  t.throws(() => c1c1.add(r));
});

test('pathBuild', (t) => {
  const rootValue = {}
  const root = treeNodeMutable(rootValue, 'pc');
  root.addValueByPath({x: 'c'}, 'c');
  root.addValueByPath({x: 'users'}, 'c.users');
  root.addValueByPath({x: 'admin'}, 'c.users.admin');
  root.addValueByPath({x: 'share'}, 'c.users.share');
  root.addValueByPath({x: 'data'}, 'c.data');
  root.addValueByPath({x: 'test'}, 'c.users.admin.test');

  t.deepEqual(root.getByPath('c.users')?.value, {x: 'users'});
  t.deepEqual(root.getByPath('c.users.admin.test')?.value, {x: 'test'});
  t.true(root.getByPath('c.doesnotexist') === undefined);

  // Add without structure being in place nicely
  const root2 = treeNodeMutable(rootValue, 'pc');
  root2.addValueByPath({x: 'test'}, 'c.users.admin.test');

  t.deepEqual(root2.getByPath('c.users.admin.test')?.value, {x: 'test'});
  t.true(root2.getByPath('c.doesnotexist') === undefined);
  // @ts-ignore
  const tt = root2.getByPath('c.users');
  t.is(tt?.label, 'users');

});