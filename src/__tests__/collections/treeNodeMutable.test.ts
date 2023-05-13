/* eslint-disable */
import { expect, test } from '@jest/globals';
import { treeNodeMutable } from '../../collections/TreeNodeMutable.js';

test('basic', () => {
  const rootValue = {}
  const r = treeNodeMutable<any>(rootValue, 'root');

  expect([...r.children()].length).toEqual(0);
  expect(r.label).toEqual('root');
  expect(r.value).toEqual(rootValue);

  // Can't add self as a child
  expect( () => r.add(r)).toThrow();
  // Not a child of self
  expect(r.hasChild(r)).toBeFalsy();

  // Add a child
  const c1 = treeNodeMutable('c1-value', 'c1-label');
  r.add(c1);

  // Check parent/child relations
  expect(r.hasChild(c1)).toBeTruthy();
  expect(c1.hasParent(r)).toBeTruthy();

  // Add a sub-child of c1
  const c1c1 = treeNodeMutable('c1-c1-value', 'c1-c1-label');
  c1.add(c1c1);
  expect(c1c1.hasParent(c1)).toBeTruthy();
  expect(c1c1.hasParent(r)).toBeFalsy();
  expect(c1.hasChild(c1c1)).toBeTruthy();

  expect(r.hasChild(c1c1)).toBeFalsy();
  expect(r.hasAnyChild(c1c1)).toBeTruthy();

  // By default, only checks immediate parent
  expect(c1c1.hasParent(r)).toBeFalsy();
  // But if we go up chain, should be true
  expect(c1c1.hasAnyParent(r)).toBeTruthy();

  // Cannot add grandchild
  expect(() => r.add(c1c1)).toThrow();
  // Cannot add grandparent to child
  expect(() => c1c1.add(r)).toThrow();
});

test('pathBuild', () => {
  const rootValue = {}
  const root = treeNodeMutable(rootValue, 'pc');
  root.addValueByPath({x:'c'},  'c');
  root.addValueByPath({x:'users'}, 'c.users');
  root.addValueByPath({x:'admin'}, 'c.users.admin');
  root.addValueByPath({x:'share'}, 'c.users.share');
  root.addValueByPath({x:'data'},'c.data');
  root.addValueByPath({x:'test'},'c.users.admin.test');
  //console.log(root.prettyPrint());

  expect(root.getByPath('c.users')?.value).toEqual({x:'users'});
  expect(root.getByPath('c.users.admin.test')?.value).toEqual({x:'test'});
  expect(root.getByPath('c.doesnotexist')?.value).toEqual({x:'c'});

  // Add without structure being in place nicely
  const root2 =  treeNodeMutable(rootValue, 'pc');
  root2.addValueByPath({x:'test'}, 'c.users.admin.test');
  //console.log(root2.prettyPrint());
  
  expect(root2.getByPath('c.users.admin.test')?.value).toEqual({x:'test'});

});