import { toStringAbbreviate } from '../../Text.js';
import { nullUndef } from '../../Guards.js';
import { last } from '../../generators/IterableSync.js';
import * as TreeArrayBacked from './TreeMutable.js';
import { isPrimitive } from '../../KeyValue.js';
import type { TraversableTree, TreeNode, SimplifiedNode } from './Types.js';
export type Entry = Readonly<{ name: string, sourceValue: any, nodeValue: any }>;
export type EntryWithAncestors = Readonly<{ name: string, sourceValue: any, nodeValue: any, ancestors: Array<string> }>;
export type EntryStatic = Readonly<{ name: string, value: any, ancestors?: Array<string> }>

/**
 * Options for parsing a path
 */
export type PathOpts = {
  /**
   * Separator for path, eg '.'
   */
  readonly separator?: string;

};

export function prettyPrintEntries(entries: ReadonlyArray<Entry>) {
  if (entries.length === 0) return `(empty)`;
  let t = ``;
  for (const [ index, entry ] of entries.entries()) {
    t += `  `.repeat(index);
    t += entry.name + ` = ` + JSON.stringify(entry.nodeValue) + `\n`;
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
 * @param defaultName
 * @returns
 */
export const prettyPrint = (
  node: object,
  indent = 0,
  options: Partial<ChildrenOptions> = {}
): string => {
  nullUndef(node, `node`);
  const defaultName = options.name ?? `node`;
  const entry = getNamedEntry(node, defaultName);
  const t = `${ `  `.repeat(indent) } + name: ${ entry.name } value: ${ JSON.stringify(entry.nodeValue) }`;
  const childrenAsArray = [ ...children(node, options) ];
  return childrenAsArray.length > 0 ? (
    t +
    `\n` +
    childrenAsArray.map((d) => prettyPrint(d.nodeValue, indent + 1, { ...options, name: d.name })).join(`\n`)
  ) : t;
};

export const toStringDeep = (node: TreeNode<Entry | EntryStatic>, indent = 0) => {
  let t = ` `.repeat(indent) + ` ` + node.value?.name;
  if (node.value !== undefined) {
    if (`sourceValue` in node.value && `nodeValue` in node.value) {
      let sourceValue = toStringAbbreviate(node.value?.sourceValue, 20);
      const nodeValue = toStringAbbreviate(node.value?.nodeValue, 20);
      sourceValue = sourceValue === nodeValue ? `` : `source: ` + sourceValue;
      t += ` = ${ nodeValue } ${ sourceValue }`
    } else if (`value` in node.value && node.value.value !== undefined) t += ` = ${ node.value.value }`;

    if (`ancestors` in node.value) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      t += ` (ancestors: ${ (node.value.ancestors!).join(`, `) })`;
    }
  }
  t += `\n`
  for (const c of node.childrenStore) {
    t += toStringDeep(c, indent + 1);
  }
  return t;
}

export type ChildrenOptions = Readonly<{
  filter: `none` | `leaves` | `branches`
  name: string
}>;

/**
 * Returns the direct children of a tree-like object as a pairing
 * of node name and value. Supports basic objects, Maps and arrays. 
 * 
 * Sub-children are included as an object blob.
 * 
 * @example Simple object
 * ```js
 * const o = {
 *  colour: {
 *    r: 0.5, g: 0.5, b: 0.5
 *  }
 * };
 * 
 * const children = [ ...Trees.children(o) ];
 * // Children:
 * // [
 * //  { name: "colour", value: { b: 0.5, g: 0.5, r: 0.5 } }
 * // ]
 * const subChildren = [ ...Trees.children(o.colour) ];
 * // [ { name: "r", value: 0.5 }, { name: "g", value: 0.5 }, { name: "b", value: 0.5 } ]
 * ```
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
export function* children<T extends object>(
  node: T,
  options: Partial<ChildrenOptions> = {}
): IterableIterator<Entry> {
  // ✔️ Unit tested
  nullUndef(node, `node`);
  //let defaultName = options.name;

  const filter = options.filter ?? `none`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //const valueFor = (v: any) => v;// options.valuesAtLeaves ? (v: any) => { if (isPrimitive(v)) return v; } : (v: any) => v;

  const filterByValue = (v: any): [ filter: boolean, isPrimitive: boolean ] => {
    if (filter === `none`) return [ true, isPrimitive(v) ];
    else if (filter === `leaves` && isPrimitive(v)) return [ true, true ];
    else if (filter === `branches` && !isPrimitive(v)) return [ true, false ];
    return [ false, isPrimitive(v) ];
  }

  if (Array.isArray(node)) {
    //if (options.name === undefined) defaultName = `array`;
    for (const [ index, element ] of node.entries()) {
      const f = filterByValue(element);
      if (f[ 0 ]) {
        yield { name: index.toString(), sourceValue: element, nodeValue: f[ 1 ] ? element : undefined };
        //yield { name: defaultName + `[` + index.toString() + `]`, sourceValue: element, nodeValue: f[ 1 ] ? element : undefined };
      }
    }
  } else if (typeof node === `object`) {
    const entriesIter = (`entries` in node) ? (node as any as Map<any, any>).entries() : Object.entries(node);
    for (const [ name, value ] of entriesIter) {
      //onsole.log(`children name: ${ name } type: ${ typeof value } isPrim: ${ isPrimitive(value) } filter: ${ filter }`);
      const f = filterByValue(value);
      if (f[ 0 ]) {
        yield { name: name, sourceValue: value, nodeValue: f[ 1 ] ? value : undefined };
      }
    }
  }
}

export function* depthFirst<T extends object>(node: T, options: Partial<ChildrenOptions> = {}, ancestors: Array<string> = []): IterableIterator<EntryWithAncestors> {
  for (const c of children(node, options)) {
    //onsole.log(`depthFirst name: ${ c.name } nodeValue: ${ toStringAbbreviate(c.nodeValue) }`)
    yield { ...c, ancestors: [ ...ancestors ] };
    yield* depthFirst(c.sourceValue, options, [ ...ancestors, c.name ]);
  }
}

/**
 * Finds a given direct child by name
 * @param name
 * @param node
 * @returns
 */
function childByName<T extends object>(
  name: string,
  node: T
): Entry | undefined {
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
 * @param opts Options for parsing path. By default '.' is used as a separator
 * @returns
 */
export function getByPath<T extends object>(
  path: string,
  node: T,
  opts: PathOpts = {}
): Entry {
  // ✔️ Unit tested
  const v = last(traceByPath(path, node, opts));
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
 * @param opts Options for path traversal logic
 * @returns
 */
export function* traceByPath<T extends object>(
  path: string,
  node: T,
  opts: PathOpts = {}
): Iterable<EntryWithAncestors> {
  // ✔️ Unit tested
  nullUndef(path, `path`);
  nullUndef(node, `node`);

  const separator = opts.separator ?? `.`;
  // const allowArrayIndexes = opts.allowArrayIndexes ?? true;
  const pathSplit = path.split(separator);

  const ancestors: Array<string> = [];
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
    //       entry = { name: p, sourceValue: entry.sourceValue[ arrayIndex ], nodeValue: entry.sourceValue[ arrayIndex ] };
    //     }
    //   }
    // }

    if (!entry) {
      yield { name: p, sourceValue: undefined, nodeValue: undefined, ancestors };
      return;
    }
    node = entry.sourceValue;
    yield { ...entry, ancestors: [ ...ancestors ] };
    ancestors.push(p);
  }
}

/**
 * Returns a projection of `node` as a dynamic traversable.

 * Note that the object identity of TraversableTree return results is not stable.
 * This is because they are created on-the-fly by reading fields of `node`.
 * 
 * ```js
  * const c1 = [ ...asDynamicTraversable(someObject).children() ];
 * const c2 = [ ...asDynamicTraversable(someObject).children() ];
 * 
 * // Object identity is not the same
 * c1[ 0 ] === c1[ 0 ]; // false
 * // ...even though its referring to the same value
 * c1[ 0 ].getValue() === c1[ 0 ].getValue(); // true
 * ```
 * 
 * Instead .getIdentity() to get a stable identity:
 * ```js
  * c1[ 0 ].getIdentity() === c2[ 0 ].getIdentity(); // true
 * ```
 * @param node 
 * @param defaultName 
 * @param parent 
 * @returns 
 */
export const asDynamicTraversable = <T extends object>(node: T, options: Partial<ChildrenOptions> = {}, ancestors: Array<string> = [], parent?: TraversableTree<EntryStatic> | undefined,): TraversableTree<EntryStatic> => {
  const name = options.name ?? `object`;
  const t: TraversableTree<EntryStatic> = {
    *children() {
      for (const c of children(node, options)) {
        yield asDynamicTraversable(c.sourceValue, { ...options, name: c.name }, [ ...ancestors, name ], t);
      }
    },
    getParent() {
      return parent;
    },
    getValue() {
      return { name, value: node, ancestors };
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
 * @param defaultName 
 * @returns 
 */
export const createWrapped = <T extends object>(node: T, options: Partial<CreateOptions>): TreeArrayBacked.WrappedNode<any> => {
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
 * Reads all fields and sub-fields of `node`, returning as a basic tree structure
 * @param node 
 * @param defaultName 
 * @returns 
 */
export const create = <T extends object>(node: T, options: Partial<CreateOptions> = {}): TreeNode<EntryStatic> => {
  const valuesAtLeaves = options.valuesAtLeaves ?? false;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const valueFor = valuesAtLeaves ? (v: any) => { if (isPrimitive(v)) return v; } : (v: any) => v;
  return createImpl(node, valueFor(node), options, []);
}

const createImpl = <T extends object>(sourceValue: T, nodeValue: T, options: Partial<CreateOptions> = {}, ancestors: Array<string>): TreeNode<EntryStatic> => {
  const defaultName = options.name ?? `object_ci`;
  //onsole.log(`createImpl name: ${ defaultName } nodeValue: ${ JSON.stringify(nodeValue) }`);
  const r = TreeArrayBacked.root<EntryStatic>({ name: defaultName, value: nodeValue, ancestors: [ ...ancestors ] });
  ancestors = [ ...ancestors, defaultName ];
  for (const c of children(sourceValue, options)) {
    const v = options.valuesAtLeaves ? c.nodeValue : c.sourceValue;
    TreeArrayBacked.add(createImpl(c.sourceValue, v, { ...options, name: c.name }, ancestors), r);
  }
  return r;
}

export const createSimplified = <T extends object>(node: T, options: Partial<CreateOptions> = {}): SimplifiedNode<EntryStatic> => {
  return TreeArrayBacked.stripParentage(create(node, options));
}

/**
 * Generates a name for a node.
 * Uses the 'name' property if it exists, otherwise uses `defaultName`
 * @param node
 * @param defaultName
 * @returns
 */
function getNamedEntry<T extends object>(node: T, defaultName = ``): Entry {
  if (`name` in node && `nodeValue` in node && `sourceValue` in node) return node as Entry;
  if (`name` in node) {
    return { name: node.name as string, nodeValue: node, sourceValue: node };
  }
  return { name: defaultName, nodeValue: node, sourceValue: node };
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