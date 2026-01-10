import * as TreeArrayBacked from "./tree-mutable.js";
import type { LabelledValue, LabelledNode, TreeNode } from "./types.js";
/**
 * Options for parsing a path
 */
export type PathOpts = Readonly<{
  /**
   * Separator for path, eg '.'
   */
  separator: string;
  /**
   * If two values are stored at same path, what to do? Default: overwrite
   * * overwrite: last-write wins
   * * ignore: first-write wins
   * * allow: allow multiple values
   */
  duplicates: `overwrite` | `allow` | `ignore`
}>;



/**
 * Creates a wrapper for working with 'pathed' trees.
 * An example is a filesystem.
 * 
 * ```js
 * const t = create();
 * // Store a value. Path implies a structure of
 * //   c -> users -> admin
 * // ...which is autoatically created
 * t.add({x:10}, `c.users.admin`);
 * 
 * t.add({x:20}, `c.users.guest`);
 * // Tree will now be:
 * // c-> users -> admin
 * //            -> guest
 * 
 * t.getValue(`c.users.guest`); // { x:20 }
 * ```
 * 
 * By default only a single value can be stored at a path.
 * Set options to allow this:
 * ```js
 * const t = create({ duplicates: `allow` });
 * t.add({x:10}, `c.users.admin`);
 * t.add({x:20}, `c.users.admin`);
 * t.getValue(`c.users.admin`);   // Throws an error because there are multiple values
 * t.getValues(`c.users.admin`);  // [ {x:10}, {x:20 } ]
 * ```
 * @param pathOpts 
 * @returns 
 */
export const create = <T>(pathOpts: Partial<PathOpts> = {}): { getRoot: () => TreeNode<LabelledValue<T>> | undefined; add: (value: T, path: string) => void; prettyPrint: () => string; remove: (path: string) => boolean; getValue: (path: string) => T | undefined; getValues: (path: string) => T[]; hasPath: (path: string) => boolean; childrenLength: (path: string) => number; getNode: (path: string) => LabelledNode<T> | undefined; clearValues: (path: string) => boolean; } => {
  let root: TreeNode<LabelledValue<T>> | undefined;

  const add = (value: T, path: string): void => {
    const n = addValueByPath(value, path, root, pathOpts);
    if (root === undefined) {
      root = TreeArrayBacked.getRoot(n);
    }
  }

  const prettyPrint = (): string => {
    if (root === undefined) return `(empty)`;
    return TreeArrayBacked.toStringDeep(root);
  }

  const getValue = (path: string): T | undefined => {
    if (root === undefined) return;
    return valueByPath(path, root, pathOpts);
  }

  const remove = (path: string): boolean => {
    if (root === undefined) return false;
    return removeByPath(path, root, pathOpts);
  }

  const hasPath = (path: string): boolean => {
    if (root === undefined) return false;
    const c = findChildByPath(path, root, pathOpts);
    return c !== undefined;
  }

  const getNode = (path: string): LabelledNode<T> | undefined => {
    if (root === undefined) return;
    const c = findChildByPath(path, root, pathOpts);
    return c;
  }

  const childrenLength = (path: string): number => {
    if (root === undefined) return 0;
    const c = findChildByPath(path, root, pathOpts);
    if (c === undefined) return 0;
    return c.childrenStore.length;
  }

  const getValues = (path: string): T[] => {
    if (root === undefined) return [];
    return valuesByPath(path, root, pathOpts);
  }

  const getRoot = (): TreeNode<LabelledValue<T>> | undefined => {
    return root;
  }
  const clearValues = (path: string): boolean => {
    if (root === undefined) return false;
    return clearValuesByPath(path, root, pathOpts);
  }
  return { getRoot, add, prettyPrint, remove, getValue, getValues, hasPath, childrenLength, getNode, clearValues }
}

/**
 * Adds a value by a string path, with '.' as a the default delimiter
 * Automatically generates intermediate nodes.
 *
 * ```js
 * const root = addValueByPath({}, 'c');
 * addValueByPath({x:'blah'}, 'c.users.admin', root);
 * ```
 *
 * Creates the structure:
 * ```
 * c          value: { }            label: c
 * + users    value: undefined      label: users
 *  + admin   value: { x: 'blah' }  label: admin
 * ```
 * 
 * By default, multiple values under same key are overwritten, with the most recent winning.
 * @param value
 * @param path
 * @param pathOpts
 */
export const addValueByPath = <T>(value: T, path: string, node?: LabelledNode<T>, pathOpts: Partial<PathOpts> = {}): LabelledNode<T> => {
  const separator = pathOpts.separator ?? `.`;
  const duplicatePath = pathOpts.duplicates ?? `overwrite`;
  const split = path.split(separator);
  let count = 0;
  for (const p of split) {
    const lastEntry = count === split.length - 1;
    //onsole.log(`p: ${ p }`);
    const found = findChildByLabel(p, node);
    if (found === undefined) {
      //onsole.log(`  - not found`);
      const labelled: LabelledValue<T> = {
        value: (lastEntry ? value : undefined),
        label: p
      };
      node = TreeArrayBacked.createNode(labelled, node);
    } else {
      node = found;
      if (lastEntry) {
        switch (duplicatePath) {
          case `ignore`: {
            break;
          }
          case `allow`: {
            const existing = getValuesFromNode(node);
            node.value = {
              values: [ ...existing, value ],
              label: p
            }
            break;
          }
          case `overwrite`: {
            node.value = {
              value,
              label: p
            }
            break;
          }
        }
      } else {
        //onsole.log(`  - found!`, found.value);
        node = found;
      }
    }
    count++;
  }
  if (node === undefined) throw new Error(`Could not create tree`);
  return node;
}

export const removeByPath = <T>(path: string, root: LabelledNode<T>, pathOpts: Partial<PathOpts> = {}): boolean => {
  if (root === undefined) return false;
  const c = findChildByPath(path, root, pathOpts);
  if (c === undefined) return false;
  TreeArrayBacked.remove(c);
  return true;
}

export const clearValuesByPath = <T>(path: string, root: LabelledNode<T>, pathOpts: Partial<PathOpts> = {}): boolean => {
  if (root === undefined) return false;
  const c = findChildByPath(path, root, pathOpts);
  if (c === undefined) return false;
  c.value = {
    label: c.value?.label ?? ``,
    value: undefined
  }
  return true;
}
export const childrenLengthByPath = <T>(path: string, node: LabelledNode<T>, pathOpts: Partial<PathOpts> = {}): number => {
  if (node === undefined) return 0;
  const c = findChildByPath(path, node, pathOpts);
  if (c === undefined) return 0;
  return c.childrenStore.length;
}
/**
 * Searches direct children, returning the node that has the given `label`
 * @param label
 * @returns
 */
const findChildByLabel = <T>(label: string, node: LabelledNode<T> | undefined): LabelledNode<T> | undefined => {
  if (node === undefined) return undefined;
  if (label === undefined) throw new Error(`Parameter 'label' cannot be undefined`);
  if (node.value?.label === label) return node;
  for (const c of node.childrenStore) {
    if (c.value?.label === label) return c;
  }
}

export const valueByPath = <T>(path: string, node: LabelledNode<T>, pathOpts: Partial<PathOpts> = {}): T | undefined => {
  const values = valuesByPath(path, node, pathOpts);
  if (values.length === 0) return undefined;
  if (values.length > 1) throw new Error(`Multiple values at path. Use getValues instead`);
  return values[ 0 ];
}

const getValuesFromNode = <T>(c: LabelledNode<T>): T[] => {
  if (c.value === undefined) return [];
  if (`values` in c.value) return c.value.values;
  if (`value` in c.value) {
    if (c.value.value === undefined) return [];
    return [ c.value.value ];
  }
  return [];
}

const findChildByPath = <T>(path: string, node: LabelledNode<T>, pathOpts: Partial<PathOpts> = {}) => {
  const separator = pathOpts.separator ?? `.`;
  const split = path.split(separator);
  let c: LabelledNode<T> | undefined = node;
  for (const p of split) {
    c = findChildByLabel(p, c);
    if (c === undefined) {
      return;
    }
  }
  return c;
}

export const valuesByPath = <T>(path: string, node: LabelledNode<T>, pathOpts: Partial<PathOpts> = {}): T[] => {
  const separator = pathOpts.separator ?? `.`;
  const split = path.split(separator);
  let c: LabelledNode<T> | undefined = node;
  for (const p of split) {
    //onsole.log(`getValue p: ${ p }`);
    c = findChildByLabel(p, c);
    if (c === undefined) {
      //onsole.log(`getValue  - could not find. node: ${ JSON.stringify(node.value) }`);
      return [];
    }
  }
  return getValuesFromNode(c);
}