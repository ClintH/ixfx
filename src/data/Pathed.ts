import * as TraversableObject from '../collections/tree/TraverseObject.js';
import { isPrimitive } from '../IsPrimitive.js';
import { isPlainObjectOrPrimitive } from '../util/GuardObject.js';
import { isInteger } from '../util/IsInteger.js';
import { isEqualContextString, type IsEqualContext } from './Util.js';
import { compareKeys } from './Compare.js';

export type PathData<V> = {
  path: string
  value: V
}

export type PathDataChange<V> = PathData<V> & {
  previous?: V
  state: `change` | `added` | `removed`
}

export type CompareDataOptions<V> = {
  pathPrefix: string
  /**
   * Comparison function for values. By default uses
   * JSON.stringify() to compare by value.
   */
  eq: IsEqualContext<V>
  /**
   * If true, inherited fields are also compared.
   * This is necessary for events, for example.
   * 
   * Only plain-object values are used, the other keys are ignored.
   */
  deepEntries: boolean

  /**
   * If _true_, includes fields that are present in B, but missing in A.
   * _False_ by default.
   */
  includeMissingFromA: boolean

  /**
   * If _true_, emits a change under the path of a parent if its child has changed.
   * If _false_ (default) only changed keys are emitted.
   * 
   * Eg if data is: 
   * `{ colour: { h:0.5, s: 0.3, l: 0.5 }}`
   * and we compare with:
   * `{ colour: { h:1, s: 0.3, l: 0.5 }}`
   * 
   * By default only 'colour.h' is emitted. If _true_ is set, 'colour' and 'colour.h' is emitted.
   */
  includeParents: boolean
}

const getEntries = <V extends Record<string, any>>(target: V, deepProbe: boolean) => {
  if (deepProbe) {
    const entries: Array<[ key: string, value: any ]> = [];
    for (const field in target) {
      const value = (target as any)[ field ];
      if (isPlainObjectOrPrimitive(value as unknown)) {
        entries.push([ field, value ]);
      }
    }
    return entries;
  } else {
    return Object.entries(target);
  }
}

/**
 * Scans object, producing a list of changed fields where B's value (newer) differs from A (older).
 * 
 * Options:
 * - `deepEntries` (_false_): If _false_ Object.entries are used to scan the object. However this won't work for some objects, eg event args, thus _true_ is needed.
 * - `eq` (JSON.stringify): By-value comparison function
 * - `includeMissingFromA` (_false): If _true_ includes fields present on B but missing on A.
 * @param a 
 * @param b 
 * @param pathPrefix 
 * @param options
 * @returns 
 */
export function* compareData<V extends Record<string, any>>(a: V, b: V, options: Partial<CompareDataOptions<V>> = {}): Generator<PathDataChange<any>> {
  if (a === undefined) {
    yield {
      path: options.pathPrefix ?? ``,
      value: b,
      state: `added`
    };
    return;
  }
  if (b === undefined) {
    yield { path: options.pathPrefix ?? ``, previous: a, value: undefined, state: `removed` }
    return;
  }
  const pathPrefix = options.pathPrefix ?? ``;
  const deepEntries = options.deepEntries ?? false;
  const eq = options.eq ?? isEqualContextString;
  const includeMissingFromA = options.includeMissingFromA ?? false;
  const includeParents = options.includeParents ?? false;
  //const changes: Array<PathDataChange<any>> = [];

  //console.log(`Immutable.compareData: a: ${ JSON.stringify(a) } b: ${ JSON.stringify(b) } prefix: ${ pathPrefix }`);

  if (isPrimitive(a) && isPrimitive(b)) {
    if (a !== b) yield { path: pathPrefix, value: b, previous: a, state: `change` };
    return;
  }

  const entriesA = getEntries(a, deepEntries);
  const entriesAKeys = new Set<string>();
  for (const [ key, valueA ] of entriesA) {
    entriesAKeys.add(key);
    //console.log(`Immutable.compareDataA key: ${ key } valueA: ${ JSON.stringify(valueA) }`);
    if (typeof valueA === `object`) {
      const sub = [ ...compareData(valueA, b[ key ], {
        ...options,
        pathPrefix: pathPrefix + key + `.`
      }) ];
      if (sub.length > 0) {
        for (const s of sub) yield s;
        if (includeParents) {
          yield { path: pathPrefix + key, value: b[ key ], previous: valueA, state: `change` };
        }
      }
    } else {
      const subPath = pathPrefix + key;
      if (key in b) {
        const valueB = b[ key ];
        if (!eq(valueA, valueB, subPath)) {
          //console.log(`  value changed. A: ${ valueA } B: ${ valueB } subPath: ${ subPath }`)
          yield { path: subPath, previous: valueA, value: valueB, state: `change` };
        }
      } else {
        yield { path: subPath, previous: valueA, value: undefined, state: `removed` };
      }
    }
  }

  if (includeMissingFromA) {
    const entriesB = getEntries(b, deepEntries);
    for (const [ key, valueB ] of entriesB) {
      if (entriesAKeys.has(key)) continue;
      // Key in B that's not in A
      //console.log(`Immutable.compareDataB key: ${ key } value: ${ valueB }`);
      yield { path: pathPrefix + key, previous: undefined, value: valueB, state: `added` };
    }
  }
}

/**
 * Returns a copy of `source` with `changes` applied.
 * @param source 
 * @param changes 
 */
export const applyChanges = <V extends Record<string, any>>(source: V, changes: Array<PathDataChange<any>>): V => {
  for (const change of changes) {
    source = updateByPath(source, change.path, change.value);
  }
  return source;
}

/**
 * Returns a copy of `target` object with a specified path changed to `value`.
 * 
 * ```js
 * const a = {
 *  message: `Hello`,
 *  position: { x: 10, y: 20 }
 * }
 * 
 * const a1 = updateByPath(a, `message`, `new message`);
 * // a1 = { message: `new message`, position: { x: 10, y: 20 }}
 * const a2 = updateByPath(a, `position.x`, 20);
 * // a2 = { message: `hello`, position: { x: 20, y: 20 }}
 * ```
 * 
 * Paths can also be array indexes:
 * ```js
 * updateByPath([`a`,`b`,`c`], 2, `d`);
 * // Yields: [ `a`, `b`, `d` ]
 * ```
 * 
 * By default, only existing array indexes can be updated. Use the `allowShapeChange` parameter 
 * to allow setting arbitrary indexes.
 * ```js
 * // Throws because array index 3 is undefined
 * updateByPath([ `a`, `b`, `c` ], `3`, `d`);
 * 
 * // With allowShapeChange flag
 * updateByPath([ `a`, `b`, `c` ], `3`, `d`, true);
 * // Returns: [ `a`, `b`, `c`, `d` ]
 * ```
 * 
 * Throws an error if:
 * * `path` cannot be resolved (eg. `position.z` in the above example)
 * * `value` applied to `target` results in the object having a different shape (eg missing a field, field
 * changing type, or array index out of bounds). Use `allowShapeChange` to suppress this error.
 * * Path is undefined or not a string
 * * Target is undefined/null
 * @param target Object to update
 * @param path Path to set value
 * @param value Value to set
 * @param allowShapeChange By default _false_, throwing an error if an update change the shape of the original object.
 * @returns 
 */
export const updateByPath = <V extends Record<string, any>>(target: V, path: string, value: any, allowShapeChange = false): V => {
  if (path === undefined) throw new Error(`Parameter 'path' is undefined`);
  if (typeof path !== `string`) throw new Error(`Parameter 'path' should be a string. Got: ${ typeof path }`);
  if (target === undefined) throw new Error(`Parameter 'target' is undefined`);
  if (target === null) throw new Error(`Parameter 'target' is null`);

  const split = path.split(`.`);
  const r = updateByPathImpl(target, split, value, allowShapeChange);
  return r as V;
}

const updateByPathImpl = (o: any, split: Array<string>, value: any, allowShapeChange: boolean): any => {
  if (split.length === 0) {
    //console.log(`Immutable.updateByPathImpl o: ${ JSON.stringify(o) } value: ${ JSON.stringify(value) }`);

    if (allowShapeChange) return value; // yolo

    if (Array.isArray(o) && !Array.isArray(value)) throw new Error(`Expected array value, got: '${ JSON.stringify(value) }'. Set allowShapeChange=true to ignore.`);
    if (!Array.isArray(o) && Array.isArray(value)) throw new Error(`Unexpected array value, got: '${ JSON.stringify(value) }'. Set allowShapeChange=true to ignore.`);

    if (typeof o !== typeof value) throw new Error(`Cannot reassign object type. (${ typeof o } -> ${ typeof value }). Set allowShapeChange=true to ignore.`);

    // Make sure new value has the same set of keys
    if (typeof o === `object` && !Array.isArray(o)) {
      const c = compareKeys(o, value);
      if (c.a.length > 0) {
        throw new Error(`New value is missing key(s): ${ c.a.join(`,`) }`);
      }
      if (c.b.length > 0) {
        throw new Error(`New value cannot add new key(s): ${ c.b.join(`,`) }`);
      }
    }
    return value;
  }
  const start = split.shift();
  if (!start) return value;

  const isInt = isInteger(start);
  if (isInt && Array.isArray(o)) {
    const index = Number.parseInt(start);
    if (index >= o.length && !allowShapeChange) throw new Error(`Array index ${ index.toString() } is outside of the existing length of ${ o.length.toString() }. Use allowShapeChange=true to permit this.`);
    const copy = [ ...o ];
    copy[ index ] = updateByPathImpl(copy[ index ], split, value, allowShapeChange);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return copy;
  } else if (start in o) {
    const copy = { ...o };
    copy[ start ] = updateByPathImpl(copy[ start ], split, value, allowShapeChange);
    return copy;
  } else {
    throw new Error(`Path ${ start } not found in data`);
  }
}

/**
 * Gets the data at `path` in `object`. Assumes '.' separates each segment of path.
 * ```js
 * getField({ name: { first: `Thom`, last: `Yorke` }}, `name.first`); // 'Thom'
 * getField({ colours: [`red`, `green`, `blue` ]}, `colours.1`); // `green`
 * ```
 * 
 * Returns _undefined_ if path could not be resolved.
 * 
 * Throws if:
 * * `path` is not a string or empty
 * * `object` is _undefined_ or null
 * @param object 
 * @param path 
 * @returns 
 */
export const getField = <V>(object: Record<string, any>, path: string): V => {
  if (typeof path !== `string`) throw new Error(`Parameter 'path' ought to be a string. Got: '${ typeof path }'`);
  if (path.length === 0) throw new Error(`Parameter 'path' is empty`);
  if (object === undefined) throw new Error(`Parameter 'object' is undefined`);
  if (object === null) throw new Error(`Parameter 'object' is null`);

  const split = path.split(`.`);
  const v = getFieldImpl<V>(object, split);
  return v;
}

const getFieldImpl = <V>(object: Record<string, any>, split: Array<string>): V => {
  if (object === undefined) throw new Error(`Parameter 'object' is undefined`);
  if (split.length === 0) throw new Error(`Path run out`);
  const start = split.shift();
  if (!start) throw new Error(`Unexpected empty split path`);

  const isInt = isInteger(start);
  if (isInt && Array.isArray(object)) { //(arrayStart === 0 && arrayEnd === start.length - 1 && Array.isArray(o)) {
    const index = Number.parseInt(start); //start.slice(1, -1));
    // eslint-disable-next-line unicorn/prefer-ternary
    if (split.length === 0) {
      return object[ index ] as V;
    } else {
      return getFieldImpl(object[ index ], split);
    }
  } else if (start in object) {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (split.length === 0) {
      return object[ start ] as V;
    } else {
      return getFieldImpl(object[ start ], split);
    }
  } else {
    throw new Error(`Path '${ start }' not found in data`);
  }
}


/**
 * Iterates 'paths' for all the fields on `o`
 * ```
 * const d = {
 *  accel: { x: 1, y: 2, z: 3 },
 *  gyro: { x: 4, y: 5, z: 6 }
 * };
 * const paths = [...getFieldPaths(d)];
 * // Yields [ `accel`, `gyro`, `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
 * ```
 *
 * Use {@link getField} to fetch data based on a path
 *
 * If object is _null_ or _undefined_, not results are returned.
 * 
 * If `onlyLeaves` is _true_ (default: _false_), only 'leaf' nodes are included. 
 * Leaf nodes are those that contain a primitive value.
 * ```js
 * const paths = getFieldPaths(d, true);
 * // Yields [ `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
 * ```
 *
 * @param object Object to get paths for.
 * @param onlyLeaves If true, only paths with a primitive value are returned.
 * @returns
 */
export function* getPaths(object: object | null, onlyLeaves = false): Generator<string> {
  if (object === undefined || object === null) return;
  const iter = TraversableObject.depthFirst(object);
  for (const c of iter) {
    if (c.nodeValue === undefined && onlyLeaves) continue;
    let path = c.name;
    if (c.ancestors.length > 0) path = c.ancestors.join(`.`) + `.` + path;
    yield path;
  }
};

/**
 * Returns a representation of the object as a set of paths and data.
 * ```js
 * const o = { name: `hello`, size: 20, colour: { r:200, g:100, b:40 } }
 * const pd = [...getPathsAndData(o)];
 * // Yields:
 * // [ 
 * // { path: `name`, value: `hello` },
 * // { path: `size`, value: `20` },
 * // { path: `colour.r`, value: `200` },
 * // { path: `colour.g`, value: `100` },
 * // { path: `colour.b`, value: `40` }
 * //]
 * ```
 * @param o Object to get paths and data for
 * @param maxDepth Set maximum recursion depth. By default unlimited.
 * @param prefix Manually set a path prefix if it's necessary
 * @returns 
 */
export function* getPathsAndData(o: object, maxDepth = Number.MAX_SAFE_INTEGER, prefix = ``): Generator<PathData<any>> {
  if (o === null) return;
  if (o === undefined) return;
  yield* getPathsAndDataImpl(o, prefix, maxDepth);
}

function* getPathsAndDataImpl(o: object, prefix: string, maxDepth: number): Generator<PathData<any>> {
  if (maxDepth <= 0) return;
  if (typeof o !== `object`) return;
  for (const entries of Object.entries(o)) {
    const sub = (prefix.length > 0 ? prefix + `.` : ``) + entries[ 0 ];
    yield { path: sub, value: entries[ 1 ] };
    yield* getPathsAndDataImpl(entries[ 1 ], sub, maxDepth - 1);
  }
}