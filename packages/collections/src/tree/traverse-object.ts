import { toStringAbbreviate } from '@ixfx/core/text';
import { nullUndefTest, resultThrow } from '@ixfx/guards' //'../../util/GuardEmpty.js';
import { last } from '@ixfx/iterables/sync';
import * as TreeArrayBacked from './tree-mutable.js';
import { isPrimitive } from '@ixfx/core'; //'../../util/IsPrimitive.js';
import type { TraversableTree, TreeNode, SimplifiedNode, TraverseObjectEntry, TraverseObjectEntryStatic, TraverseObjectEntryWithAncestors, TraverseObjectPathOpts, WrappedNode } from './types.js';


/**
 * Helper function to get a 'friendly' string representation of an array of {@link TraverseObjectEntry}.
 * @param entries 
 * @returns 
 */
export function prettyPrintEntries(entries: readonly TraverseObjectEntry[]): string {
  if (entries.length === 0) return `(empty)`;
  let t = ``;
  for (const [ index, entry ] of entries.entries()) {
    t += `  `.repeat(index);
    t += entry.name + ` = ` + JSON.stringify(entry.leafValue) + `\n`;
  }
  return t;
}

/**
 * Returns a human-friendly debug string for a tree-like structure
 * ```js
 * console.log(Trees.prettyPrint(obj));
 * ```
 * @param indent
 * @param node
 * @param options
 * @returns
 */
export const prettyPrint = (
  node: object,
  indent = 0,
  options: Partial<ChildrenOptions> = {}
): string => {
  resultThrow(nullUndefTest(node, `node`));
  const defaultName = options.name ?? `node`;
  const entry = getNamedEntry(node, defaultName);
  const t = `${ `  `.repeat(indent) } + name: ${ entry.name } value: ${ JSON.stringify(entry.leafValue) }`;
  const childrenAsArray = [ ...children(node, options) ];
  return childrenAsArray.length > 0 ? (
    t +
    `\n` +
    childrenAsArray.map((d) => prettyPrint(d.leafValue as object, indent + 1, { ...options, name: d.name })).join(`\n`)
  ) : t;
};

/**
 * Returns a debug string representation of the node (recursive)
 * @param node 
 * @param indent 
 * @returns 
 */
export const toStringDeep = (node: TreeNode<TraverseObjectEntry | TraverseObjectEntryStatic>, indent = 0): string => {
  let t = ` `.repeat(indent) + ` ${ node.value?.name }`;
  if (node.value !== undefined) {
    if (`sourceValue` in node.value && `leafValue` in node.value) {
      let sourceValue = toStringAbbreviate(node.value.sourceValue, 20);
      const leafValue = toStringAbbreviate(node.value.leafValue, 20);
      sourceValue = sourceValue === leafValue ? `` : `source: ` + sourceValue;
      t += ` = ${ leafValue } ${ sourceValue }`
    } else if (`sourceValue` in node.value && node.value.sourceValue !== undefined) t += ` = ${ node.value.sourceValue }`;

    if (`ancestors` in node.value) {

      t += ` (ancestors: ${ (node.value.ancestors).join(`, `) })`;
    }
  }
  t += `\n`
  for (const c of node.childrenStore) {
    t += toStringDeep(c, indent + 1);
  }
  return t;
}

export type ChildrenOptions = Readonly<{
  /**
   * If set, only uses leaves or branches. 'none' means there is no filter.
   */
  filter: `none` | `leaves` | `branches`
  /**
   * Default name to use. This is necessary in some cases, eg a root object.
   */
  name: string
}>;

/**
 * Yields the direct (ie. non-recursive) children of a tree-like object as a pairing
 * of node name and value. Supports basic objects, Maps and arrays.
 * 
 * To iterate recursively, consider {@link depthFirst}
 * 
 * Each child is returned in an {@link TraverseObjectEntry} structure:
 * ```typescript
 * type Entry = Readonly<{
 *  // Property name
 *  name: string, 
 *  // Value of property, as if you called `object[propertyName]`
 *  sourceValue: any,
 *  // Branch nodes will have _undefined_, leaf nodes will contain the value
 *  leafValue: any 
 * }>;
 * ```
 * 
 * For example, iterating over a flat object:
 * ```js
 * const verySimpleObject = { field: `hello`, flag: true }
 * const kids = [ ...children(verySimpleObject) ];
 * // Yields:
 * // [ { name: "field", sourceValue: `hello`, leafValue: `hello` },
 * //  { name: "flag", sourceValue: true, leafValue: true } ]
 * ```
 * 
 * For objects containing objects:
 * ```js
 * const lessSimpleObject = { field: `hello`, flag: true, colour: { `red`, opacity: 0.5 } }
 * const kids = [ ...children(verySimpleObject) ];
 * // Yields as before, plus:
 * //  { name: "colour", sourceValue: { name: 'red', opacity: 0.5 }, leafValue: undefined }
 * ```
 * 
 * Note that 'sourceValue' always contains the property value, as if you 
 * access it via `object[propName]`. 'leafValue' only contains the value if it's a leaf
 * node.
 * 
 * Arrays are assigned a name based on index.
 * @example Arrays
 * ```js
 * const colours = [ { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 }, { r: 0, g: 0, b: 1 } ];
 * // Children: 
 * // [
 * //  { name: "array[0]", value: {r:1,g:0,b:0} },
 * //  { name: "array[1]", value: {r:0,g:1,b:0} },
 * //  { name: "array[2]", value: {r:0,g:0,b:1} },
 * // ]
 * ```
 * 
 * Pass in `options.name` (eg 'colours') to have names generated as 'colours[0]', etc.
 * Options can also be used to filter children. By default all direct children are returned.
 * @param node 
 * @param options  
 */
export function* children(
  node: object,
  options: Partial<ChildrenOptions> = {}
): IterableIterator<TraverseObjectEntry> {
  resultThrow(nullUndefTest(node, `node`));

  const filteringOption = options.filter ?? `none`;

  const filterByValue = (v: any): [ filter: boolean, isPrimitive: boolean ] => {
    if (filteringOption === `none`) return [ true, isPrimitive(v) ];
    else if (filteringOption === `leaves` && isPrimitive(v)) return [ true, true ];
    else if (filteringOption === `branches` && !isPrimitive(v)) return [ true, false ];
    return [ false, isPrimitive(v) ];
  }

  if (Array.isArray(node)) {
    //if (options.name === undefined) defaultName = `array`;
    for (const [ index, element ] of node.entries()) {
      const f = filterByValue(element);
      if (f[ 0 ]) {
        yield { name: index.toString(), _kind: `entry`, sourceValue: element, leafValue: f[ 1 ] ? element : undefined };
        //yield { name: defaultName + `[` + index.toString() + `]`, sourceValue: element, leafValue: f[ 1 ] ? element : undefined };
      }
    }
  } else if (typeof node === `object`) {
    const entriesIter = (`entries` in node) ? (node as any as Map<any, any>).entries() : Object.entries(node);
    for (const [ name, value ] of entriesIter) {
      //console.log(`children name: ${ name } type: ${ typeof value } isPrim: ${ isPrimitive(value) } filter: ${ filter }`);
      const [ filter, isPrimitive ] = filterByValue(value);
      if (filter) {
        yield { name: name, _kind: `entry`, sourceValue: value, leafValue: isPrimitive ? value : undefined };
      }
    }
  }
}

export function* depthFirst(node: object, options: Partial<ChildrenOptions> = {}, ancestors: string[] = []): IterableIterator<TraverseObjectEntryWithAncestors> {
  for (const c of children(node, options)) {
    //onsole.log(`depthFirst name: ${ c.name } leafValue: ${ toStringAbbreviate(c.leafValue) }`)
    yield { ...c, ancestors: [ ...ancestors ], _kind: `entry-ancestors` };
    yield* depthFirst(c.sourceValue as object, options, [ ...ancestors, c.name ]);
  }
}

/**
 * Finds a given direct child by name
 * @param name
 * @param node
 * @returns
 */
function childByName(
  name: string,
  node: object
): TraverseObjectEntry | undefined {
  for (const d of children(node)) {
    if (d.name === name) return d;
  }
}

/**
 * Returns the closest matching entry, tracing `path` in an array, Map or simple object.
 * Returns an entry with _undefined_ value at the point where tracing stopped.
 * Use {@link traceByPath} to step through all the segments.
 *
 * ```js
  * const people = {
    *  jane: {
 *   address: {
 *    postcode: 1000,
    *    street: 'West St',
    *    city: 'Blahville'
 *   },
 * colour: 'red'
  *  }
 * }
 * Trees.getByPath('jane.address.postcode', people); // '.' default separator
 * // ['postcode', 1000]
 * Trees.getByPath('jane.address.country.state', people);
 * // ['country', undefined] - since full path could not be resolved.
 * ```
 * @param path Path, eg `jane.address.postcode`
 * @param node Node to look within
 * @param options Options for parsing path. By default '.' is used as a separator
 * @returns
 */
export function getByPath(
  path: string,
  node: object,
  options: TraverseObjectPathOpts = {}
): TraverseObjectEntryWithAncestors {
  // ✔️ Unit tested
  const v = last(traceByPath(path, node, options));
  if (!v) throw new Error(`Could not trace path: ${ path } `);
  return v;
}

/**
 * Enumerates over children of `node` towards the node named in `path`.
 * This is useful if you want to get the interim steps to the target node.
 * 
 * Use {@link getByPath} if you don't care about interim steps.
 *
 * ```js
  * const people = {
    *  jane: {
 *   address: {
 *    postcode: 1000,
    *    street: 'West St',
    *    city: 'Blahville'
 *   },
 * colour: 'red'
  *  }
 * }
 * for (const p of Trees.traceByPath('jane.address.street', people)) {
 * // { name: "jane", value: { address: { postcode: 1000,street: 'West St', city: 'Blahville' }, colour: 'red'} },
 * // { name: "address", value: { postcode: 1000, street: 'West St', city: 'Blahville' } },
 * // { name: "street", value: "West St" } }
 * }
 * ```
 *
 * Results stop when the path can't be followed any further.
 * The last entry will have a name of the last sought path segment, and _undefined_ as its value.
 * 
 * @param path Path to traverse
 * @param node Starting node
 * @param options Options for path traversal logic
 * @returns
 */
export function* traceByPath(
  path: string,
  node: object,
  options: TraverseObjectPathOpts = {}
): Iterable<TraverseObjectEntryWithAncestors> {
  resultThrow(
    nullUndefTest(path, `path`),
    nullUndefTest(node, `node`)
  );

  const separator = options.separator ?? `.`;
  // const allowArrayIndexes = opts.allowArrayIndexes ?? true;
  const pathSplit = path.split(separator);

  const ancestors: string[] = [];
  for (const p of pathSplit) {
    const entry = childByName(p, node);
    //onsole.log(`traceByPath: entry: ${ entry?.name } path: '${ path }' p: '${ p }' source: ${ JSON.stringify(entry?.sourceValue) }`);
    // if (allowArrayIndexes) {
    //   const [ withoutBrackets, arrayIndexString ] = betweenChomp(p, `[`, `]`);
    //   //onsole.log(`  withoutBrackets: ${ withoutBrackets } str: ${ arrayIndexString } without: ${ withoutBrackets }`);
    //   const arrayIndex = integerParse(arrayIndexString, `positive`, -1);
    //   if (arrayIndex >= 0) {
    //     // Get array by name without the []
    //     entry = childByName(withoutBrackets, node);
    //     //onsole.log(`  entry: ${ entry?.name }`);
    //     if (entry && Array.isArray(entry.sourceValue)) {
    //       // Result was array as expected
    //       entry = { name: p, sourceValue: entry.sourceValue[ arrayIndex ], leafValue: entry.sourceValue[ arrayIndex ] };
    //     }
    //   }
    // }

    if (!entry) {
      yield { name: p, sourceValue: undefined, leafValue: undefined, ancestors, _kind: `entry-ancestors` };
      return;
    }
    node = entry.sourceValue;
    yield { ...entry, ancestors: [ ...ancestors ], _kind: `entry-ancestors` };
    ancestors.push(p);
  }
}

/**
 * Returns a projection of `node` as a dynamic traversable.
 * This means that the tree structure is dynamically created as last-minute as possible.
 * 
 * The type when calling `getValue()` is {@link TraverseObjectEntryStatic}:
 * ```typescript
 * type EntryStatic = Readonly<{ 
 *  name: string,
 *  value: any
 *  ancestors: string[] 
 * }>
 * ```
 * 
 * Note that the object identity of TraversableTree return results is not stable.
 * This is because they are created on-the-fly by reading fields of `node`.
 * 
 * ```js
 * const c1 = [ ...asDynamicTraversable(someObject).children() ];
 * const c2 = [ ...asDynamicTraversable(someObject).children() ];
 * 
 * // Object identity is not the same
 * c1[ 0 ] === c1[ 0 ]; // false
 * 
 * // ...even though its referring to the same value
 * c1[ 0 ].getValue() === c1[ 0 ].getValue(); // true
 * ```
 * 
 * Instead .getIdentity() to get a stable identity:
 * ```js
 * c1[ 0 ].getIdentity() === c2[ 0 ].getIdentity(); // true
 * ```
 * 
 * @example
 * ```js
 * import { Trees } from "https://unpkg.com/@ixfx/collections/bundle"
 * const myObj = { name: `Pedro`, size: 45, colour: `orange` };
 * const root = Trees.FromObject.asDynamicTraversable(myObj);
 * for (const v of Trees.Traverse.breadthFirst(root)) {
 * // v.getValue() yields:
 * // { name: 'name', sourceValue: 'Pedro' ...}, 
 * // { name: 'size', sourceValue: 45 ... }
 * // ...
 * }
 * ```
 * @param node Object to read
 * @param options Options when creating traversable
 * @param ancestors Do not use
 * @param parent Do not use
 * @returns 
 */
export const asDynamicTraversable = (node: object, options: Partial<ChildrenOptions> = {}, ancestors: string[] = [], parent?: TraversableTree<TraverseObjectEntryStatic>): TraversableTree<TraverseObjectEntryStatic> => {
  const name = options.name ?? `object`;
  const t: TraversableTree<TraverseObjectEntryStatic> = {
    *children() {
      for (const { name: childName, sourceValue, leafValue } of children(node, options)) {
        yield asDynamicTraversable(sourceValue as object, { ...options, name: childName }, [ ...ancestors, name ], t);
      }
    },
    getParent() {
      return parent;
    },
    getValue() {
      return { name, sourceValue: node, ancestors, _kind: `entry-static` };
    },
    getIdentity() {
      return node;
    }
  }
  return t;
}

/**
 * Reads all fields and sub-fields of `node`, returning as a 'wrapped' tree structure.
 * @param node 
 * @param options 
 * @returns 
 */
export const createWrapped = (node: object, options: Partial<CreateOptions>): WrappedNode<any> => {
  return TreeArrayBacked.wrap(create(node, options));
};

export type CreateOptions = {
  name: string
  /**
   * If _true_, only leaf nodes have values. This avoids repetition (important
   * when comparing trees), with semantics being in the tree itself.
   * 
   * When _false_ (default) values get decomposed down the tree. This
   * makes it easy to get all the data for a branch of the tree.
   * 
   * 
   * Eg if storing { person: { address { state: `qld` } } }
   * When _true_, the tree would be:
   * ```
   * person, value: undefined
   *  + address, value: undefined
   *    + state, value: 'qld'
   * ```
   * But when _false_, the tree would be:
   * ```
   * person, value: { address: { state: `qld } }
   *  + address, value: { state: `qld` }
   *    + state, value: `qld`
   * ```
   */
  valuesAtLeaves: boolean
}

/**
 * Reads all fields and sub-fields of `node`, returning as a basic tree structure.
 * The structure is a snapshot of the object. If the object changes afterwards, the tree will
 * remain the same.
 * 
 * Alternatively, consider {@link asDynamicTraversable} which reads the object dynamically.
 * @example
 * ```js
 * import { Trees } from "https://unpkg.com/@ixfx/collections/bundle"
 * const myObj = { name: `Pedro`, size: 45, colour: `orange` };
 * const root = Trees.FromObject.create(myObj);
 * for (const v of Trees.Traverse.breadthFirst(root)) {
 * // v.getValue() yields:
 * // { name: 'name', sourceValue: 'Pedro' ...}, 
 * // { name: 'size', sourceValue: 45 ... }
 * // ...
 * }
 * ```
 * @param node 
 * @param options 
 * @returns 
 */
export const create = (node: object, options: Partial<CreateOptions> = {}): TreeNode<TraverseObjectEntryStatic> => {
  const valuesAtLeaves = options.valuesAtLeaves ?? false;

  const valueFor = valuesAtLeaves ? (v: any) => { if (isPrimitive(v)) return v; } : (v: any) => v;
  return createImpl(node, valueFor(node), options, []);
}

const createImpl = <T extends object>(sourceValue: T, leafValue: T, options: Partial<CreateOptions> = {}, ancestors: string[]): TreeNode<TraverseObjectEntryStatic> => {
  const defaultName = options.name ?? `object_ci`;
  //onsole.log(`createImpl name: ${ defaultName } leafValue: ${ JSON.stringify(leafValue) }`);
  const r = TreeArrayBacked.root<TraverseObjectEntryStatic>({ name: defaultName, sourceValue: leafValue, ancestors: [ ...ancestors ], _kind: `entry-static` });
  ancestors = [ ...ancestors, defaultName ];
  for (const c of children(sourceValue, options)) {
    const v = options.valuesAtLeaves ? c.leafValue : c.sourceValue;
    TreeArrayBacked.add(createImpl(c.sourceValue, v, { ...options, name: c.name }, ancestors), r);
  }
  return r;
}

/**
 * Returns a copy of `node` with its (and all its children's) parent information removed.
 * @param node 
 * @param options 
 * @returns 
 */
export const createSimplified = (node: object, options: Partial<CreateOptions> = {}): SimplifiedNode<TraverseObjectEntryStatic> => {
  return TreeArrayBacked.stripParentage(create(node, options));
}

/**
 * Generates a name for a node.
 * Uses the 'name' property if it exists, otherwise uses `defaultName`
 * @param node
 * @param defaultName
 * @returns
 */
function getNamedEntry(node: object, defaultName = ``): TraverseObjectEntry {
  if (`name` in node && `leafValue` in node && `sourceValue` in node) return {
    name: node.name as string,
    _kind: `entry`,
    leafValue: node.leafValue,
    sourceValue: node.sourceValue
  };
  if (`name` in node) {
    return { name: node.name as string, leafValue: node, sourceValue: node, _kind: `entry` };
  }
  return { name: defaultName, leafValue: node, sourceValue: node, _kind: `entry` };
}

// /**
//  * Depth-first traversal over object, array, Map or TreeNode
//  * @param root
//  * @returns
//  */
// export function* depthFirst(root: object): IterableIterator<Entry> {
//   if (!root) return;
//   const stack = new StackMutable<Entry>();
//   //eslint-disable-next-line functional/immutable-data
//   stack.push(getEntry(root, `root`));
//   //eslint-disable-next-line functional/no-let,functional/immutable-data
//   let entry = stack.pop();
//   while (entry) {
//     yield entry;
//     if (entry) {
//       //eslint-disable-next-line functional/immutable-data
//       stack.push(...directChildren(entry.value, entry.name));
//     }
//     if (stack.isEmpty) break;
//     //eslint-disable-next-line functional/immutable-data
//     entry = stack.pop();
//   }
// }

// /**
//  * Breadth-first traversal over object, array, Map or TreeNode
//  * @param root
//  * @returns
//  */
// export function* breadthFirst(root: object): IterableIterator<Entry> {
//   if (!root) return;
//   const queue = new QueueMutable<Entry>();
//   queue.enqueue(getEntry(root, `root`));
//   //eslint-disable-next-line functional/no-let
//   let entry = queue.dequeue();
//   while (entry) {
//     yield entry;
//     if (entry) {
//       queue.enqueue(...directChildren(entry.value, entry.name));
//     }
//     if (queue.isEmpty) break;
//     entry = queue.dequeue();
//   }
// }


// export const fromUnknown = (node: object, name: string, parents: Array<TreeNode<any>> = []): TreeNode<any> => {
//   const parentsWithUs = [ ...parents ];
//   const enumerator = Array.isArray(node) ? enumerateArrayChildren : enumerateObjectChildren;

//   const thisNode: TreeNode<any> = {
//     getLengthChildren() {
//       return [ ...enumerator(node, parentsWithUs, name) ].length
//     },
//     *children() {
//       for (const c of enumerator(node, parentsWithUs, name)) {
//         yield c;
//       }
//     },
//     parents() {
//       return parents.values()
//     },
//     name: name,
//     value: node
//   }
//   parentsWithUs.push(thisNode);
//   return thisNode;
// }

// function* enumerateObjectChildren(node: object, name: string): IterableIterator<Entry> {
//   if (`entries` in node) {
//     for (const entry of (node as any as Map<any, any>)) {
//       yield fromUnknown(entry[ 1 ], entry[ 0 ], parents);
//     }
//   } else {
//     for (const entry of Object.entries(node)) {
//       yield fromUnknown(entry[ 1 ], entry[ 0 ], parents);
//     }
//   }
// }

// function* enumerateArrayChildren(node: object, parents: Array<TreeNode<any>>, name: string): IterableIterator<TreeNode<any>> {
//   const nodeArray = node as Array<any>;

//   // eslint-disable-next-line unicorn/no-for-loop
//   for (let index = 0; index < nodeArray.length; index++) {
//     yield fromUnknown(nodeArray[ index ], name + `[ ` + index.toString() + ` ]`, parents);
//   }
// }