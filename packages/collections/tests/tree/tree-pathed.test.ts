import { isEqualValueDefault } from '@ixfx/core';

import { describe, expect, it } from 'vitest';
import * as TreePathed from '../../src/tree/pathed.js';
import * as TreeArrayBacked from '../../src/tree/tree-mutable.js';

describe(`pathed fs`, () => {
  const p = new TreePathed.Pathed<any>({ separator: `/`, startsWithSeparator: true });
  const paths = [
    `/Users/admin/Documents/project/a`,
    `/Users/admin/Documents/project/a/file.txt`,
    `/Users/admin/Documents/project/b`,
    `/Users/admin/Documents/project/c`,
    `/Users/admin/Desktop/`,
    `/Volumes/ExternalDrive`,
  ];
  for (const path of paths) {
    p.add({ x: path }, path);
  }
  it(`path checking`, () => {
    expect(() => p.add({ x: `admin` }, `Users/admin`)).toThrow();
  });

  it(`get-1`, () => {
    const n = p.getNode(`/Users/admin/Documents/project/a/file.txt`);
    expect(n?.value).toEqual({ label: `file.txt`, value: { x: `/Users/admin/Documents/project/a/file.txt` } });
    if (n) {
      expect(p.getPath(n, true)).toEqual(`/Users/admin/Documents/project/a/file.txt`);
      expect(p.getPath(n, false)).toEqual(`/Users/admin/Documents/project/a/`);
    }
  });

  it(`get-2`, () => {
    const n = p.getNode(`/Users/admin/Documents/project/`);
    expect(n?.value).toEqual({ label: `project`, value: undefined });
    if (n) {
      expect(p.getPath(n, true)).toEqual(`/Users/admin/Documents/project/`);
      expect(p.getPath(n, false)).toEqual(`/Users/admin/Documents/`);
    }
  });
});

describe(`pathed class`, () => {
  const p = new TreePathed.Pathed({ separator: `/` });
  const paths = [
    `/Users/admin/Documents/project/a`,
    `/Users/admin/Documents/project/a/file.txt`,
    `/Users/admin/Documents/project/b`,
    `/Users/admin/Documents/project/c`,
    `/Users/admin/Desktop/`,
    `/Volumes/ExternalDrive`,
  ];
  for (const path of paths) {
    p.add({ x: path }, path);
  }

  it(`siblings`, () => {
    const s1 = [...p.siblingsValues(`/Users/admin/Documents/project/a`)];
    expect(s1).toEqual([
      { label: `b`, value: { x: `/Users/admin/Documents/project/b` } },
      { label: `c`, value: { x: `/Users/admin/Documents/project/c` } },
    ]);

    const s2 = [...p.siblingsValues(`/Users/admin/Desktop`)];
    expect(s2).toEqual([
      { label: `Documents`, value: undefined },
    ]);
  });
});

describe(`tree-dotted`, () => {
  const opts: TreePathed.PathOpts = { separator: `.`, startsWithSeparator: false, duplicates: `ignore` };

  it(`tree-dotted-path`, () => {
    const root = TreePathed.addValueByPath({}, `c`, opts, undefined);
    TreePathed.addValueByPath({ x: `admin` }, `c.users.admin`, opts, root);
    expect(TreeArrayBacked.computeMaxDepth(root)).toBe(2); // since root is not counted
    const c = TreeArrayBacked.findAnyChildByValue({ value: { x: `admin` }, label: `admin` }, root, isEqualValueDefault);
    expect(c).toBeTruthy();
    TreePathed.addValueByPath({ x: `admin2` }, `c.users.admin`, opts, root);
  });
  it(`tree-dotted-overwrite`, () => {
    const n = TreePathed.addValueByPath({ x: 1 }, `c.users.admin`, opts);
    const root = TreeArrayBacked.getRoot(n);
    expect(TreePathed.valueByPath(`c.users.admin`, root)).toEqual({ x: 1 });
    const _n2 = TreePathed.addValueByPath({ x: 2 }, `c.users.admin`, { ...opts, duplicates: `overwrite` }, root);
    expect(TreePathed.valueByPath(`c.users.admin`, root)).toEqual({ x: 2 });
  });

  it(`tree-dotted-ignore`, () => {
    const n = TreePathed.addValueByPath({ x: 1 }, `c.users.admin`, opts, undefined);
    const root = TreeArrayBacked.getRoot(n);
    expect(TreePathed.valueByPath(`c.users.admin`, root)).toEqual({ x: 1 });
    const _n2 = TreePathed.addValueByPath({ x: 2 }, `c.users.admin`, { ...opts, duplicates: `ignore` }, root);
    expect(TreePathed.valueByPath(`c.users.admin`, root)).toEqual({ x: 1 });
  });

  it(`tree-dotted-multiple`, () => {
    const n = TreePathed.addValueByPath({ x: 1 }, `c.users.admin`, opts, undefined);
    const root = TreeArrayBacked.getRoot(n);
    const _n2 = TreePathed.addValueByPath({ x: 2 }, `c.users.admin`, { ...opts, duplicates: `allow` }, root);
    const _n3 = TreePathed.addValueByPath({ x: 3 }, `c.users.admin`, { ...opts, duplicates: `allow` }, root);
    const values = TreePathed.valuesByPath(`c.users.admin`, root);

    expect(values).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }]);
  });

  it(`tree-dotted-wrapper`, () => {
    const root = new TreePathed.Pathed({ duplicates: `allow` });
    root.add({ x: `admin` }, `c.users.admin`);
    root.add({ x: `admin2` }, `c.users.admin`);
    root.add({ x: `blah` }, `c.users.guest`);
    expect(root.hasPath(`c.users.admin`)).toBe(true);
    expect(root.getValues(`c.users.admin`)).toEqual([{ x: `admin` }, { x: `admin2` }]);
    expect(root.childrenLength(`c.users`)).toBe(2);
    expect(root.childrenLength(`c`)).toBe(1);

    // Removal
    root.add({ x: 12 }, `c.users.blerg`);
    expect(root.hasPath(`c.users.blerg`)).toBe(true);
    expect(root.remove(`c.users.notfound`)).toBe(false);
    expect(root.remove(`c.users.blerg`)).toBe(true);
    expect(root.hasPath(`c.users.blerg`)).toBe(false);
  });
});
it(`pathed-wrapper-remove-prunes-empty-branch`, () => {
  const root = new TreePathed.Pathed();
  root.add({ x: `admin` }, `c.users.admin`);

  expect(root.remove(`c.users.admin`)).toBe(true);
  expect(root.hasPath(`c.users.admin`)).toBe(false);
  expect(root.hasPath(`c.users`)).toBe(false);
});

it(`pathed-wrapper-remove-keeps-siblings`, () => {
  const root = new TreePathed.Pathed();
  root.add({ x: `admin` }, `c.users.admin`);
  root.add({ x: `guest` }, `c.users.guest`);

  expect(root.remove(`c.users.admin`)).toBe(true);
  expect(root.hasPath(`c.users.admin`)).toBe(false);
  expect(root.hasPath(`c.users.guest`)).toBe(true);
  expect(root.hasPath(`c.users`)).toBe(true);
});

it(`pathed-wrapper-clear-values-keeps-structure`, () => {
  const root = new TreePathed.Pathed();
  root.add({ x: `admin` }, `c.users.admin`);
  root.add({ x: `guest` }, `c.users.guest`);

  expect(root.clearValues(`c.users.admin`)).toBe(true);
  expect(root.hasPath(`c.users.admin`)).toBe(true);
  expect(root.getValue(`c.users.admin`)).toBeUndefined();
  expect(root.childrenLength(`c.users`)).toBe(2);
});

describe(`pathed-dotted`, () => {
  const opts: TreePathed.PathOpts = { separator: `.`, startsWithSeparator: false, duplicates: `ignore` };

  it(`pathed-removeValueByPath-prunes-empty-branch`, () => {
    const admin = TreePathed.addValueByPath({ x: `admin` }, `c.users.admin`, opts, undefined);
    const root = TreeArrayBacked.getRoot(admin);

    expect(TreePathed.removeValueByPath(`c.users.admin`, root, opts)).toBe(true);

    const adminNode = TreeArrayBacked.findAnyChildByValue({ label: `admin`, value: undefined }, root, isEqualValueDefault);
    const usersNode = TreeArrayBacked.findAnyChildByValue({ label: `users`, value: undefined }, root, isEqualValueDefault);
    expect(adminNode).toBeUndefined();
    expect(usersNode).toBeUndefined();
  });

  it(`pathed-findAnyChildByValue`, () => {
    const root = TreePathed.addValueByPath({ x: `root` }, `c`, opts, undefined);
    expect(TreePathed.findAnyChildByValue({ x: `root` }, root)).toBeFalsy();

    const _admin = TreePathed.addValueByPath({ x: `admin` }, `c.users.admin`, opts, root);
    expect(TreePathed.findAnyChildByValue({ x: `admin` }, root)).toBeTruthy();
  });

  it(`pathed-removeValueByPath-keeps-siblings`, () => {
    const admin = TreePathed.addValueByPath({ x: `admin` }, `c.users.admin`, opts, undefined);
    const root = TreeArrayBacked.getRoot(admin);
    expect(root.value).toEqual({ label: `c` });

    TreePathed.addValueByPath({ x: `guest` }, `c.users.guest`, opts, root);
    expect(TreePathed.findAnyChildByValue({ x: `guest` }, root)).toBeTruthy();

    TreePathed.removeValueByPath(`c.users.admin`, root, opts);
    console.log(TreePathed.toStringDeep(root));
    expect(TreePathed.toStringDeep(root)).toBe(`{ label: "c", value: undefined, children: [ { label: "users", value: undefined, children: [ { label: "guest", value: { x: "guest" }, children: [] } ] } ] }`);

    const guestNode = TreePathed.findAnyChildByValue({ x: `guest` }, root);
    const usersNode = TreeArrayBacked.findAnyChildByValue({ label: `users`, value: undefined }, root, isEqualValueDefault);
    expect(guestNode).toBeTruthy();
    expect(usersNode).toBeTruthy();
  });

  it(`pathed-clearValuesByPath-keeps-node`, () => {
    const admin = TreePathed.addValueByPath({ x: `admin` }, `c.users.admin`, opts, undefined);
    const root = TreeArrayBacked.getRoot(admin);

    expect(TreePathed.clearValuesByPath(`c.users.admin`, root, opts)).toBe(true);

    const adminNode = TreeArrayBacked.findAnyChildByValue({ label: `admin`, value: undefined }, root, isEqualValueDefault);
    expect(adminNode).toBeTruthy();
  });

  it(`pathed-children-siblings-parent-functions`, () => {
    const admin = TreePathed.addValueByPath({ x: `admin` }, `c.users.admin`, opts, undefined);
    const root = TreeArrayBacked.getRoot(admin);
    TreePathed.addValueByPath({ x: `guest` }, `c.users.guest`, opts, root);
    TreePathed.addValueByPath({ x: `latest` }, `c.logs.latest`, opts, root);

    const userChildren = labelsFrom(TreePathed.children(`c.users`, root, opts)).sort();
    expect(userChildren).toEqual([`admin`, `guest`]);

    const adminSiblings = labelsFrom(TreePathed.siblings(`c.users.admin`, root, opts));
    expect(adminSiblings).toEqual([`guest`]);

    const parentNode = TreePathed.parent(`c.users.admin`, root, opts);
    expect(parentNode?.value?.label).toBe(`users`);

    expect([...TreePathed.children(`c.missing`, root, opts)]).toEqual([]);
    expect([...TreePathed.siblings(`c`, root, opts)]).toEqual([]);
    expect(TreePathed.parent(`c`, root, opts)).toBeUndefined();
  });

  it(`pathed-wrapper-children-siblings-parent`, () => {
    const tree = new TreePathed.Pathed();
    tree.add({ x: `admin` }, `c.users.admin`);
    tree.add({ x: `guest` }, `c.users.guest`);

    const userChildren = labelsFrom(tree.children(`c.users`)).sort();
    expect(userChildren).toEqual([`admin`, `guest`]);

    const adminSiblings = labelsFrom(tree.siblings(`c.users.admin`));
    expect(adminSiblings).toEqual([`guest`]);

    const parentNode = tree.parent(`c.users.admin`);
    expect(parentNode?.value?.label).toBe(`users`);
  });
});

function labelsFrom(nodes: Iterable<{ value?: { label?: string } }>) {
  return Array.from(nodes, n => n.value?.label);
}
