import { test, expect } from 'vitest';

import * as TreeArrayBacked from '../../src/tree/tree-mutable.js';
import * as TreePathed from '../../src/tree/pathed.js';
import { isEqualValueDefault } from '@ixfx/core';


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
  const root = new TreePathed.Pathed({ duplicates: `allow` });
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

test(`pathed-wrapper-remove-prunes-empty-branch`, () => {
  const root = new TreePathed.Pathed();
  root.add({ x: 'admin' }, 'c.users.admin');

  expect(root.remove(`c.users.admin`)).toBe(true);
  expect(root.hasPath(`c.users.admin`)).toBe(false);
  expect(root.hasPath(`c.users`)).toBe(false);
});

test(`pathed-wrapper-remove-keeps-siblings`, () => {
  const root = new TreePathed.Pathed();
  root.add({ x: 'admin' }, 'c.users.admin');
  root.add({ x: 'guest' }, 'c.users.guest');

  expect(root.remove(`c.users.admin`)).toBe(true);
  expect(root.hasPath(`c.users.admin`)).toBe(false);
  expect(root.hasPath(`c.users.guest`)).toBe(true);
  expect(root.hasPath(`c.users`)).toBe(true);
});

test(`pathed-wrapper-clear-values-keeps-structure`, () => {
  const root = new TreePathed.Pathed();
  root.add({ x: 'admin' }, 'c.users.admin');
  root.add({ x: 'guest' }, 'c.users.guest');

  expect(root.clearValues(`c.users.admin`)).toBe(true);
  expect(root.hasPath(`c.users.admin`)).toBe(true);
  expect(root.getValue(`c.users.admin`)).toBeUndefined();
  expect(root.childrenLength(`c.users`)).toBe(2);
});

test(`pathed-removeValueByPath-prunes-empty-branch`, () => {
  const admin = TreePathed.addValueByPath({ x: 'admin' }, 'c.users.admin');
  const root = TreeArrayBacked.getRoot(admin);

  expect(TreePathed.removeValueByPath(`c.users.admin`, root)).toBe(true);

  const adminNode = TreeArrayBacked.findAnyChildByValue({ label: 'admin', value: undefined }, root, isEqualValueDefault);
  const usersNode = TreeArrayBacked.findAnyChildByValue({ label: 'users', value: undefined }, root, isEqualValueDefault);
  expect(adminNode).toBeUndefined();
  expect(usersNode).toBeUndefined();
});

test(`pathed-findAnyChildByValue`, () => {
  const root = TreePathed.addValueByPath({x:`root`}, 'c');
  expect(TreePathed.findAnyChildByValue({x:`root`} , root)).toBeFalsy();

  const admin = TreePathed.addValueByPath({ x: 'admin' }, 'c.users.admin', root);
  expect(TreePathed.findAnyChildByValue({x:`admin`} , root)).toBeTruthy();
});

test(`pathed-removeValueByPath-keeps-siblings`, () => {
  const admin = TreePathed.addValueByPath({ x: 'admin' }, 'c.users.admin');
  const root = TreeArrayBacked.getRoot(admin);
  expect(root.value).toEqual({label:"c"});

  TreePathed.addValueByPath({ x: 'guest' }, 'c.users.guest', root);
  expect(TreePathed.findAnyChildByValue({ x: 'guest' } , root)).toBeTruthy();

  TreePathed.removeValueByPath(`c.users.admin`, root);
  console.log(TreePathed.toStringDeep(root));
  expect(TreePathed.toStringDeep(root)).toBe(`{ label: "c", value: undefined, children: [ { label: "users", value: undefined, children: [ { label: "guest", value: { x: "guest" }, children: [] } ] } ] }`);

  const guestNode = TreePathed.findAnyChildByValue({ x: 'guest' } , root);
  const usersNode = TreeArrayBacked.findAnyChildByValue({ label: 'users', value: undefined }, root, isEqualValueDefault);
  expect(guestNode).toBeTruthy();
  expect(usersNode).toBeTruthy();
});

test(`pathed-clearValuesByPath-keeps-node`, () => {
  const admin = TreePathed.addValueByPath({ x: 'admin' }, 'c.users.admin');
  const root = TreeArrayBacked.getRoot(admin);

  expect(TreePathed.clearValuesByPath(`c.users.admin`, root)).toBe(true);

  const adminNode = TreeArrayBacked.findAnyChildByValue({ label: 'admin', value: undefined }, root, isEqualValueDefault);
  expect(adminNode).toBeTruthy();
});

const labelsFrom = (nodes: Iterable<{ value?: { label?: string } }>) => {
  return [ ...nodes ].map(n => n.value?.label);
}

test(`pathed-children-siblings-parent-functions`, () => {
  const admin = TreePathed.addValueByPath({ x: 'admin' }, 'c.users.admin');
  const root = TreeArrayBacked.getRoot(admin);
  TreePathed.addValueByPath({ x: 'guest' }, 'c.users.guest', root);
  TreePathed.addValueByPath({ x: 'latest' }, 'c.logs.latest', root);

  const userChildren = labelsFrom(TreePathed.children('c.users', root)).sort();
  expect(userChildren).toEqual([ 'admin', 'guest' ]);

  const adminSiblings = labelsFrom(TreePathed.siblings('c.users.admin', root));
  expect(adminSiblings).toEqual([ 'guest' ]);

  const parentNode = TreePathed.parent('c.users.admin', root);
  expect(parentNode?.value?.label).toBe('users');

  expect([ ...TreePathed.children('c.missing', root) ]).toEqual([]);
  expect([ ...TreePathed.siblings('c', root) ]).toEqual([]);
  expect(TreePathed.parent('c', root)).toBeUndefined();
});

test(`pathed-wrapper-children-siblings-parent`, () => {
  const tree = new TreePathed.Pathed();
  tree.add({ x: 'admin' }, 'c.users.admin');
  tree.add({ x: 'guest' }, 'c.users.guest');

  const userChildren = labelsFrom(tree.children('c.users')).sort();
  expect(userChildren).toEqual([ 'admin', 'guest' ]);

  const adminSiblings = labelsFrom(tree.siblings('c.users.admin'));
  expect(adminSiblings).toEqual([ 'guest' ]);

  const parentNode = tree.parent('c.users.admin');
  expect(parentNode?.value?.label).toBe('users');
});