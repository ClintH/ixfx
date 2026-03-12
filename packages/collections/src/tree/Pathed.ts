import type { IsEqual } from "@ixfx/core";
import type { Result } from "@ixfx/guards";
import type { LabelledNode, LabelledValue, TreeNode } from "./types.js";
import { isEqualDefault, isEqualValueDefault } from "@ixfx/core";
import { throwIfFailed } from "@ixfx/guards";
import { isMultiValue, isSingleValue } from "./labelled.js";
import * as TreeArrayBacked from "./tree-mutable.js";
/**
 * Options for parsing a path
 */
export type PathOpts = Readonly<{
  /**
   * If _true_, paths are expeced to start with the separator char.
   * Default: _false_
   *
   * For a *nix file system, this would be _true_
   */
  startsWithSeparator: boolean;

  /**
   * Separator for path, eg '.'
   */
  separator: string;
  /**
   * If two values are stored at same path, what to do? Default: overwrite
   * overwrite: last-write wins
   * ignore: first-write wins
   * allow: allow multiple values
   */
  duplicates: `overwrite` | `allow` | `ignore`;
}>;

/**
 * Creates a wrapper for working with 'pathed' trees.
 * An example is a filesystem.
 *
 * ```js
 * const t = new Pathed();
 * // Store a value. Path implies a structure of
 * //   c -> users -> admin
 * // ...which is automatically created
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
 * const t = new Pathed({ duplicates: `allow` });
 * t.add({x:10}, `c.users.admin`);
 * t.add({x:20}, `c.users.admin`);
 * t.getValue(`c.users.admin`);   // Throws an error because there are multiple values
 * t.getValues(`c.users.admin`);  // [ {x:10}, {x:20 } ]
 * ```
 * @param pathOpts
 * @returns
 */
export class Pathed<T> {
  #root: TreeNode<LabelledValue<T>> | undefined;
  #pathOpts: PathOpts;

  /**
   * Create, using default options
   * @param pathOpts
   */
  constructor(pathOpts: Partial<PathOpts> = {}) {
    this.#pathOpts = {
      separator: `.`,
      startsWithSeparator: false,
      duplicates: `overwrite`,
      ...pathOpts,
    };
  }

  /**
   * Adds a value at the string path, automatically creating intermediate nodes as needed.
   * By default, if a value already exists at the path, it will be overwritten. Set options to change this.
   * @param value Value to associate with path
   * @param path Path
   */
  add(value: T, path: string): void {
    throwIfFailed(this.validate(path));

    const n = addValueByPath(value, path, this.#pathOpts, this.#root);
    if (this.#root === undefined) {
      this.#root = TreeArrayBacked.getRoot(n);
    }
  }

  validate(path: string): Result<string, string> {
    if (this.#pathOpts.startsWithSeparator && !path.startsWith(this.#pathOpts.separator)) {
      return { success: false, error: `Path must start with separator when 'startsWithSeparator' is enabled. Got: ${path}` };
    }
    return { success: true, value: path };
  }

  /**
   * Returns a string representation of tree
   * @returns Returns a string representation of tree
   */
  prettyPrint(): string {
    if (this.#root === undefined)
      return `(empty)`;
    return TreeArrayBacked.toStringDeep(this.#root);
  }

  /**
   * Removes the value at the given path, returning _true_
   * if there was a value. This will delete tree nodes if they become empty
   * @param path
   * @returns _true_ if value was removed
   */
  remove(path: string): boolean {
    throwIfFailed(this.validate(path));

    if (this.#root === undefined)
      return false;
    return removeValueByPath(path, this.#root, this.#pathOpts);
  }

  /**
   * Returns _true_ if we have a value at `path`
   * @param path
   * @returns _true_ if value exists at path
   */
  hasPath(path: string): boolean {
    throwIfFailed(this.validate(path));

    if (this.#root === undefined)
      return false;
    const c = findChildByPath(path, this.#root, this.#pathOpts);
    return c !== undefined;
  }

  /**
   * Returns a tree node for a given path, or _undefined_
   * if path does not exist.
   *
   * Use {@link getValue} to get the value at a node instead.
   * @param path
   * @returns The tree node for the given path, or _undefined_ if not found
   */
  getNode(path: string): LabelledNode<T> | undefined {
    throwIfFailed(this.validate(path));

    if (this.#root === undefined)
      return;
    const c = findChildByPath(path, this.#root, this.#pathOpts);
    return c;
  }

  /**
   * Returns the value at the path, or _undefined_ if path is not found.
   * Use {@link getNode} to get the tree node instead.
   * @param path
   * @returns The value at the path, or _undefined_ if path is not found
   */
  getValue(path: string): T | undefined {
    throwIfFailed(this.validate(path));

    if (this.#root === undefined)
      return;
    return valueByPath(path, this.#root, this.#pathOpts);
  }

  /**
   * Gets the containing path to `node`. If _includeNode_ is true, we also include the
   * node's own label.
   */
  getPath(node: LabelledNode<T>, includeNode: boolean): string {
    if (this.#root === undefined)
      return ``;
    const segments: string[] = [];
    if (includeNode && node.value) {
      segments.push(node.value?.label);
    }
    for (const p of parentValues(node)) {
      segments.unshift(p.label);
    }
    let path = segments.join(this.#pathOpts.separator);
    if (this.#pathOpts.startsWithSeparator) {
      if (!path.startsWith(this.#pathOpts.separator)) {
        path = this.#pathOpts.separator + path;
      }
      if (!path.endsWith(this.#pathOpts.separator) && (node.childrenStore.length > 0 || !includeNode)) {
        path += this.#pathOpts.separator;
      }
    }
    return path;
  }

  /**
   * Gets the number of children at a given path.
   * Returns NaN if path does not exist or has no children.
   * @param path
   * @returns The number of children at the path, or NaN if path is not found
   */
  childrenLength(path: string): number {
    throwIfFailed(this.validate(path));

    if (this.#root === undefined)
      return Number.NaN;
    const c = findChildByPath(path, this.#root, this.#pathOpts);
    if (c === undefined)
      return Number.NaN;
    return c.childrenStore.length;
  }

  /**
   * Get all the values stored at a path, if multiple values are allowed. Returns an empty array if path does not exist or has no value.
   * @param path
   * @returns An array of values at the path, or an empty array if path is not found
   */
  getValues(path: string): T[] | undefined {
    throwIfFailed(this.validate(path));

    if (this.#root === undefined)
      return undefined;
    return valuesByPath(path, this.#root, this.#pathOpts);
  }

  /**
   * Removes all values at the given path, but leaves the structure of the tree intact. Returns _true_ if there was a value to clear.
   * @param path
   * @returns _true_ if there was a value to clear at the path
   */
  clearValues(path: string): boolean {
    throwIfFailed(this.validate(path));

    if (this.#root === undefined)
      return false;
    return clearValuesByPath(path, this.#root, this.#pathOpts);
  }

  /**
   * Iterate all children of this path
   */
  *children(path: string): IterableIterator<LabelledNode<T>> {
    throwIfFailed(this.validate(path));

    if (this.#root === undefined)
      return;
    yield* children(path, this.#root, this.#pathOpts);
  }

  /**
   * Iterate all siblings of this path
   */
  *siblings(path: string): IterableIterator<LabelledNode<T>> {
    throwIfFailed(this.validate(path));

    if (this.#root === undefined)
      return;
    yield* siblings(path, this.#root, this.#pathOpts);
  }

  /**
   * Iterate all siblings of this path
   */
  *siblingsValues(path: string): IterableIterator<LabelledValue<T>> {
    throwIfFailed(this.validate(path));

    if (this.#root === undefined)
      return;
    yield* siblingsValues(path, this.#root, this.#pathOpts);
  }

  /**
   * Returns the parent node of `path`, or _undefined_ if not found or at root.
   */
  parent(path: string): LabelledNode<T> | undefined {
    throwIfFailed(this.validate(path));

    if (this.#root === undefined)
      return;
    return parent(path, this.#root, this.#pathOpts);
  }

  get separator(): string {
    return this.#pathOpts.separator;
  }

  /**
   * Returns the root tree node.
   * @returns   The root tree node, or _undefined_ if tree is empty
   */
  get root(): TreeNode<LabelledValue<T>> | undefined {
    return this.#root;
  }
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
 * @param value Value to add
 * @param path Path to add at
 * @param node Node to insert
 * @param pathOpts Options
 */
export function addValueByPath<T>(value: T, path: string, pathOpts: PathOpts, node?: LabelledNode<T>): LabelledNode<T> {
  const separator = pathOpts.separator;
  const duplicatePath = pathOpts.duplicates;
  const split = path.split(separator);
  let count = 0;
  for (const p of split) {
    const lastEntry = count === split.length - 1;
    // onsole.log(`p: ${ p }`);
    const found = findChildByLabel(p, node);
    if (found === undefined) {
      // onsole.log(`  - not found`);
      const labelled: LabelledValue<T> = {
        value: (lastEntry ? value : undefined),
        label: p,
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
              values: [...existing, value],
              label: p,
            };
            break;
          }
          case `overwrite`: {
            node.value = {
              value,
              label: p,
            };
            break;
          }
        }
      } else {
        // onsole.log(`  - found!`, found.value);
        node = found;
      }
    }
    count++;
  }
  if (node === undefined)
    throw new Error(`Could not create tree`);
  return node;
}

/**
 * Removes the value at the given path, returning _true_ if there was something to remove.
 * @param node
 * @returns _true_ if something removed
 */
function isLabelledNodeEmpty<T>(node: LabelledNode<T>): boolean {
  if (node.value === undefined)
    return true;
  if (`values` in node.value)
    return node.value.values.length === 0;
  if (`value` in node.value)
    return node.value.value === undefined;
  return true;
}

function pruneLabelledBranch<T>(node: LabelledNode<T>): void {
  if (node.childrenStore.length > 0)
    return;
  if (!isLabelledNodeEmpty(node))
    return;
  const parent = node.parent as LabelledNode<T> | undefined;
  if (!parent)
    return;
  TreeArrayBacked.remove(node);
  pruneLabelledBranch(parent);
}

export function removeValueByPath<T>(path: string, root: LabelledNode<T>, pathOpts: PathOpts): boolean {
  if (root === undefined)
    return false;
  const c = findChildByPath(path, root, pathOpts);
  if (c === undefined)
    return false;

  c.value = undefined;
  pruneLabelledBranch(c);
  return true;
}

export function clearValuesByPath<T>(path: string, root: LabelledNode<T>, pathOpts: PathOpts): boolean {
  if (root === undefined)
    return false;
  const c = findChildByPath(path, root, pathOpts);
  if (c === undefined)
    return false;
  c.value = {
    label: c.value?.label ?? ``,
    value: undefined,
  };
  return true;
}

/**
 * Return the length of children of `path`, or NaN if path not found.
 */
export function childrenLengthByPath<T>(path: string, searchStart: LabelledNode<T>, pathOpts: PathOpts): number {
  if (searchStart === undefined)
    return Number.NaN;
  const c = findChildByPath(path, searchStart, pathOpts);
  if (c === undefined)
    return Number.NaN;
  return c.childrenStore.length;
}

/**
 * Iterate over all the children of `path`
 */
export function *children<T>(path: string, searchStart: LabelledNode<T>, pathOpts: PathOpts): IterableIterator<LabelledNode<T>> {
  if (searchStart === undefined)
    return;
  const c = findChildByPath(path, searchStart, pathOpts);
  if (c === undefined)
    return;
  for (const ch of c.childrenStore) {
    yield ch;
  }
}

/**
 * Iterate over all the siblings of `path`, excluding the node at `path` itself.
 * Yields LabelledNode instances, which allow you to traverse tree. If all you care about is the values, use {@link siblingsValues} instead.
 */
export function *siblings<T>(path: string, searchStart: LabelledNode<T>, pathOpts: PathOpts): IterableIterator<LabelledNode<T>> {
  if (searchStart === undefined)
    return;
  const c = findChildByPath(path, searchStart, pathOpts);
  if (c === undefined)
    return;
  const parent = c.parent;
  if (parent === undefined)
    return;
  for (const ch of parent.childrenStore) {
    if (ch === c)
      continue;
    if (typeof ch === `undefined`) {
      throw new TypeError(`Unexpected undefined child node`);
    }
    yield ch;
  }
}

/**
 * Iterate over the values of all the siblings of `path`, excluding the node at `path` itself. If you need to traverse tree, use {@link siblings} instead.
 * @param path
 * @param searchStart
 * @param pathOpts
 */
export function *siblingsValues<T>(path: string, searchStart: LabelledNode<T>, pathOpts: PathOpts): IterableIterator<LabelledValue<T>> {
  for (const s of siblings(path, searchStart, pathOpts)) {
    if (s.value === undefined)
      continue;
    yield s.value;
  }
}

/**
 * Return the parent node of `path`, or undefined if not found or at root.
 */
export function parent<T>(path: string, searchStart: LabelledNode<T>, pathOpts: PathOpts): LabelledNode<T> | undefined {
  if (searchStart === undefined)
    return;
  const c = findChildByPath(path, searchStart, pathOpts);
  if (c === undefined)
    return;
  return c.parent;
}

export function *parentValues<T>(start: LabelledNode<T>): IterableIterator<LabelledValue<T>> {
  for (const p of TreeArrayBacked.parents(start)) {
    if (p.value === undefined)
      continue;
    yield p.value;
  }
}

/**
 * Searches direct children, returning the node that has the given `label`
 * @param label
 * @param node
 * @returns Child node, or _undefined_
 */
function findChildByLabel<T>(label: string, node: LabelledNode<T> | undefined): LabelledNode<T> | undefined {
  if (node === undefined)
    return undefined;
  if (label === undefined)
    throw new Error(`Parameter 'label' cannot be undefined`);
  if (node.value?.label === label)
    return node;
  for (const c of node.childrenStore) {
    if (c.value?.label === label)
      return c;
  }
}

/**
 * Searches children, returning the node that has the given `value`.
 * @param value Value
 * @param node Node to start search from
 * @param maxDepth Maximum depth, defaults to full recursion
 * @param eq Equality function
 * @returns Child, or _undefined_ if not found
 */
export function findAnyChildByValue<T>(value: T, node: LabelledNode<T>, maxDepth: number = Number.MAX_SAFE_INTEGER, eq: IsEqual<T> = isEqualValueDefault): LabelledNode<T> | undefined {
  if (typeof node === `undefined`)
    throw new TypeError(`Param 'node' is undefined`);
  if (maxDepth <= 0)
    return;
  if (typeof value === `undefined`)
    throw new Error(`Param 'value' cannot be undefined`);

  // Check all the children
  for (const c of node.childrenStore) {
    if (hasValue(value, c, eq))
      return c;
  }

  // Recurse into each child
  for (const c of node.childrenStore) {
    const result = findAnyChildByValue(value, c, maxDepth - 1, eq);
    if (typeof result !== `undefined`)
      return result;
  }
}

export function hasValue<T>(value: T, node: LabelledNode<T>, eq: IsEqual<T> = isEqualDefault): boolean {
  if (typeof node.value === `undefined`)
    return false;
  if (isSingleValue(node.value)) {
    if (eq(node.value.value as T, value))
      return true;
  } else if (isMultiValue(node.value)) {
    for (const v of node.value.values) {
      if (eq(v, value))
        return true;
    }
  }
  return false;
}

export function valueByPath<T>(path: string, node: LabelledNode<T>, pathOpts: Partial<PathOpts> = {}): T | undefined {
  const values = valuesByPath(path, node, pathOpts);
  if (typeof values === `undefined`)
    return;
  if (values.length === 0)
    return undefined;
  if (values.length > 1)
    throw new Error(`Multiple values at path. Use getValues instead`);
  return values[0];
}

function getValuesFromNode<T>(node: LabelledNode<T>): T[] {
  if (node.value === undefined)
    return [];
  if (`values` in node.value)
    return node.value.values;
  if (`value` in node.value) {
    if (node.value.value === undefined)
      return [];
    return [node.value.value];
  }
  return [];
}

function findChildByPath<T>(path: string, searchStart: LabelledNode<T>, pathOpts: PathOpts) {
  // Chop off separator at end if we also start with seperator
  if (path.endsWith(pathOpts.separator) && pathOpts.startsWithSeparator) {
    path = path.slice(0, -pathOpts.separator.length);
  }
  const split = path.split(pathOpts.separator);
  let c: LabelledNode<T> | undefined = searchStart;
  for (const p of split) {
    c = findChildByLabel(p, c);
    if (c === undefined) {
      return;
    }
  }
  return c;
}

export function valuesByPath<T>(path: string, searchStart: LabelledNode<T>, pathOpts: Partial<PathOpts> = {}): T[] | undefined {
  const separator = pathOpts.separator ?? `.`;
  const split = path.split(separator);
  let c: LabelledNode<T> | undefined = searchStart;
  for (const p of split) {
    // onsole.log(`getValue p: ${ p }`);
    c = findChildByLabel(p, c);
    if (c === undefined) {
      // onsole.log(`getValue  - could not find. node: ${ JSON.stringify(node.value) }`);
      return undefined;
    }
  }
  return getValuesFromNode(c);
}

function formatInspectValue(v: unknown): string {
  if (v === undefined)
    return `undefined`;
  if (v === null)
    return `null`;
  if (typeof v === `string`)
    return `"${v}"`;
  if (typeof v === `number` || typeof v === `boolean`)
    return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0)
      return `[]`;
    return `[ ${v.map(formatInspectValue).join(`, `)} ]`;
  }
  if (typeof v === `object`) {
    const entries = Object.entries(v).map(([k, val]) => `${k}: ${formatInspectValue(val)}`);
    return `{ ${entries.join(`, `)} }`;
  }
  return String(v);
}

/**
 * Returns a string representation of a LabelledNode tree.
 * Format: `{ label: "x", value: ..., children: [...] }`
 */
export function toStringDeep<T>(node: LabelledNode<T>): string {
  const label = node.value?.label ?? `?`;
  const innerValue = node.value === undefined
    ? undefined
    : `values` in node.value
      ? node.value.values
      : `value` in node.value
        ? node.value.value
        : undefined;
  const children = node.childrenStore.map(c => toStringDeep(c as LabelledNode<T>));
  const childrenStr = children.length === 0 ? `[]` : `[ ${children.join(`, `)} ]`;
  return `{ label: "${label}", value: ${formatInspectValue(innerValue)}, children: ${childrenStr} }`;
}