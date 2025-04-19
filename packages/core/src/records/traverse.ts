import { throwNullUndef } from '@ixfx/guards';
import { isPrimitive } from '../is-primitive.js';

export type RecordEntry = Readonly<{ name: string, sourceValue: any, nodeValue: any }>;
export type RecordEntryWithAncestors = Readonly<{ name: string, sourceValue: any, nodeValue: any, ancestors: string[] }>;
export type RecordEntryStatic = Readonly<{ name: string, value: any, ancestors: string[] }>

/**
 * Options for parsing a path
 */
export type PathOpts = {
  /**
   * Separator for path, eg '.'
   */
  readonly separator?: string;
};

export type RecordChildrenOptions = Readonly<{
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
 * Helper function to get a 'friendly' string representation of an array of {@link RecordEntry}.
 * @param entries 
 * @returns 
 */
export function prettyPrintEntries(entries: readonly RecordEntry[]) {
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
 * @param options
 * @returns
 */
export const recordEntryPrettyPrint = (
  node: object,
  indent = 0,
  options: Partial<RecordChildrenOptions> = {}
): string => {
  throwNullUndef(node, `node`);
  const defaultName = options.name ?? `node`;
  const entry = getNamedRecordEntry(node, defaultName);
  const t = `${ `  `.repeat(indent) } + name: ${ entry.name } value: ${ JSON.stringify(entry.nodeValue) }`;
  const childrenAsArray = [ ...recordChildren(node, options) ];
  return childrenAsArray.length > 0 ? (
    t +
    `\n` +
    childrenAsArray.map((d) => recordEntryPrettyPrint(d.nodeValue, indent + 1, { ...options, name: d.name })).join(`\n`)
  ) : t;
};



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
export function* recordChildren<T extends object>(
  node: T,
  options: Partial<RecordChildrenOptions> = {}
): IterableIterator<RecordEntry> {
  throwNullUndef(node, `node`);

  const filter = options.filter ?? `none`;

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

export function* recordEntriesDepthFirst<T extends object>(node: T, options: Partial<RecordChildrenOptions> = {}, ancestors: string[] = []): IterableIterator<RecordEntryWithAncestors> {
  for (const c of recordChildren(node, options)) {
    //onsole.log(`depthFirst name: ${ c.name } nodeValue: ${ toStringAbbreviate(c.nodeValue) }`)
    yield { ...c, ancestors: [ ...ancestors ] };
    yield* recordEntriesDepthFirst(c.sourceValue, options, [ ...ancestors, c.name ]);
  }
}

/**
 * Finds a given direct child by name
 * @param name
 * @param node
 * @returns
 */
function recordEntryChildByName<T extends object>(
  name: string,
  node: T
): RecordEntry | undefined {
  for (const d of recordChildren(node)) {
    if (d.name === name) return d;
  }
}

/**
 * Returns the closest matching entry, tracing `path` in an array, Map or simple object.
 * Returns an entry with _undefined_ value at the point where tracing stopped.
 * Use {@link traceRecordEntryByPath} to step through all the segments.
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
export function getRecordEntryByPath<T extends object>(
  path: string,
  node: T,
  options: PathOpts = {}
): RecordEntry {
  const paths = [ ...traceRecordEntryByPath(path, node, options) ];
  if (paths.length === 0) throw new Error(`Could not trace path: ${ path } `);
  return paths.at(-1) as RecordEntry;
}

/**
 * Enumerates over children of `node` towards the node named in `path`.
 * This is useful if you want to get the interim steps to the target node.
 * 
 * Use {@link getRecordEntryByPath} if you don't care about interim steps.
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
export function* traceRecordEntryByPath<T extends object>(
  path: string,
  node: T,
  options: PathOpts = {}
): Iterable<RecordEntryWithAncestors> {
  // ✔️ Unit tested
  throwNullUndef(path, `path`);
  throwNullUndef(node, `node`);

  const separator = options.separator ?? `.`;
  const pathSplit = path.split(separator);

  const ancestors: string[] = [];
  for (const p of pathSplit) {
    const entry = recordEntryChildByName(p, node);
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
 * Generates a name for a node.
 * Uses the 'name' property if it exists, otherwise uses `defaultName`
 * @param node
 * @param defaultName
 * @returns
 */
function getNamedRecordEntry<T extends object>(node: T, defaultName = ``): RecordEntry {
  if (`name` in node && `nodeValue` in node && `sourceValue` in node) return node as RecordEntry;
  if (`name` in node) {
    return { name: node.name as string, nodeValue: node, sourceValue: node };
  }
  return { name: defaultName, nodeValue: node, sourceValue: node };
}
