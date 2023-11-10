/** Utilities for working with immutable objects */
import JSON5 from 'json5';
import { isInteger, isPlainObjectOrPrimitive } from "./Util.js";
import * as TraversableObject from './collections/tree/TraverseObject.js';

/**
 * Return _true_ if `a` and `b` ought to be considered equal
 * at a given path
 */
export type IsEqualContext<V> = (a: V, b: V, path: string) => boolean

/**
 * Returns _true_ if `a` and `b are equal based on their JSON representations.
 * `path` is ignored.
 * @param a 
 * @param b 
 * @param path 
 * @returns 
 */
export const isEqualContextString: IsEqualContext<any> = (a: any, b: any, _path: string): boolean => {
  return JSON5.stringify(a) === JSON5.stringify(b);
}

export type Change<V> = {
  path: string
  previous?: V
  value: V
}

export type CompareDataOptions<V> = {
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
}

/**
 * Scans object, producing a list of changed fields.
 * 
 * @param a 
 * @param b 
 * @param pathPrefix 
 * @returns 
 */
export const compareData = <V extends Record<string, any>>(a: V, b: V, pathPrefix = ``, options: Partial<CompareDataOptions<V>> = {}): Array<Change<any>> => {

  const deepProbe = options.deepEntries ?? false;
  const eq = options.eq ?? isEqualContextString;
  const changes: Array<Change<any>> = [];

  let entries: Array<[ key: string, value: any ]> = [];
  if (deepProbe) {
    for (const field in a) {
      const value = (a as any)[ field ];
      if (isPlainObjectOrPrimitive(value as unknown)) {
        entries.push([ field, value ]);
      }
    }
  } else {
    entries = Object.entries(a);
  }

  //const isArray = Array.isArray(a);
  for (const [ key, valueA ] of entries) {
    if (typeof valueA === `object`) {
      changes.push(...compareData(valueA, b[ key ], key + `.`, options));
    } else {
      const valueB = b[ key ];
      const sub = pathPrefix + key;// isArray ? untilMatch(pathPrefix, `.`, { fromEnd: true }) + `[${ key }]` : pathPrefix + key;
      //onsole.log(`sub: ${ sub } isArray: ${ isArray } pathPrefix: ${ pathPrefix } key: ${ key }`)
      if (!eq(valueA, valueB, sub)) {
        changes.push({ path: sub, previous: valueA, value: valueB });
      }
    }
  }
  return changes;
}

/**
 * Returns a copy of `a` with changes applied.
 * @param a 
 * @param changes 
 */
export const applyChanges = <V extends Record<string, any>>(a: V, changes: Array<Change<any>>): V => {
  for (const change of changes) {
    a = updateByPath(a, change.path, change.value);
  }
  return a;
}

/**
 * Returns a copy of an object with a specified path changed to `value`.
 * 
 * ```js
 * const a = {
 *  message: `Hello`,
 *  position: { x: 10, y: 20 }
 * }
 * 
 * const a1 = updateByPath(a, `message`, `new message`);
 * const a2 = updateByPath(a, `position.x`, 20);
 * ```
 * 
 * If the path cannot be resolved, an exception is thrown
 * @param o 
 * @param path 
 * @param value 
 * @returns 
 */
export const updateByPath = <V extends Record<string, any>>(o: V, path: string, value: any, createIfNecessary = false): V => {
  if (path === undefined) throw new Error(`Parameter 'path' is undefined`);
  if (typeof path !== `string`) throw new Error(`Parameter 'path' should be a string. Got: ${ typeof path }`);
  if (o === undefined) throw new Error(`Parameter 'o' is undefined`);
  if (o === null) throw new Error(`Parameter 'o' is null`);

  const split = path.split(`.`);
  const r = updateByPathImpl(o, split, value, createIfNecessary);
  return r as V;
}

const updateByPathImpl = (o: any, split: Array<string>, value: any, createIfNecessary: boolean): any => {
  if (split.length === 0) return value;

  const start = split.shift();
  if (!start) return value;

  // const arrayStart = start.indexOf(`[`);
  // const arrayEnd = start.indexOf(`]`, arrayStart);
  // if (arrayStart > 0 && arrayEnd > arrayStart) {
  //   const field = start.slice(0, arrayStart);
  //   const index = start.slice(arrayStart, arrayEnd + 1);
  //   split.unshift(index);
  //   const copy = { ...o };
  //   copy[ field ] = updateByPathImpl(copy[ field ], split, value, createIfNecessary);
  //   return copy;
  // }

  const isInt = isInteger(start);
  if (isInt && Array.isArray(o)) { //if (start.startsWith(`[`) && start.endsWith(`]`) && Array.isArray(o)) {
    const index = Number.parseInt(start); //start.slice(1, -1));
    const copy = [ ...o ];
    copy[ index ] = updateByPathImpl(copy[ index ], split, value, createIfNecessary);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return copy;
  } else if (start in o) {
    const copy = { ...o };
    copy[ start ] = updateByPathImpl(copy[ start ], split, value, createIfNecessary);
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
  if (typeof path !== `string`) throw new Error(`Parameter 'path' ought to be a string`);
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
    throw new Error(`Path ${ start } not found in data`);
  }
}

/**
 * Maps the properties of an object through a map function.
 * That is, run each of the values of an object through a function, an return
 * the result.
 *
 * @example Double the value of all fields
 * ```js
 * const rect = { width: 100, height: 250 };
 * const doubled = mapObject(rect, (fieldValue) => {
 *  return fieldValue*2;
 * });
 * // Yields: { width: 200, height: 500 }
 * ```
 *
 * Since the map callback gets the name of the property, it can do context-dependent things.
 * ```js
 * const rect = { width: 100, height: 250, colour: 'red' }
 * const doubled = mapObject(rect, (fieldValue, fieldName) => {
 *  if (fieldName === 'width') return fieldValue*3;
 *  else if (typeof fieldValue === 'number') return fieldValue*2;
 *  return fieldValue;
 * });
 * // Yields: { width: 300, height: 500, colour: 'red' }
 * ```
 * In addition to bulk processing, it allows remapping of property types.
 *
 * In terms of typesafety, the mapped properties are assumed to have the
 * same type.
 *
 * ```js
 * const o = {
 *  x: 10,
 *  y: 20,
 *  width: 200,
 *  height: 200
 * }
 *
 * // Make each property use an averager instead
 * const oAvg = mapObject(o, (value, key) => {
 *  return movingAverage(10);
 * });
 *
 * // Add a value to the averager
 * oAvg.x.add(20);
 * ```
 */
export const map = <
  SourceType extends Record<string, any>,
  DestinationFieldType,
>(
  // eslint-disable-next-line indent
  object: SourceType,
  // eslint-disable-next-line indent
  mapFunction: (fieldValue: any, field: string, index: number) => DestinationFieldType
  // eslint-disable-next-line indent
): RemapObjectPropertyType<SourceType, DestinationFieldType> => {
  type MapResult = [ field: string, value: DestinationFieldType ];
  const entries = Object.entries(object);
  const mapped = entries.map(([ sourceField, sourceFieldValue ], index) => [
    sourceField,
    mapFunction(sourceFieldValue, sourceField, index),
  ]) as Array<MapResult>;
  // @ts-expect-error
  return Object.fromEntries(mapped);
};

export type RemapObjectPropertyType<OriginalType, PropertyType> = {
  readonly [ Property in keyof OriginalType ]: PropertyType;
};

/**
 * Returns a list of paths for all the fields on `o`
 * ```
 * const d = {
 *  accel: { x: 1, y: 2, z: 3 },
 *   gyro: { x: 4, y: 5, z: 6 }
 * };
 * const paths = getFieldPaths(d);
 * // Yields [ `accel`, `gyro`, `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
 * ```
 *
 * Use {@link getField} to fetch data by this 'path' string.
 *
 * If object is _null_, and empty array is returned.
 * 
 * If `onlyLeaves` is _true_, only leaf nodes are included. _false_ by default.
 * ```js
 * const paths = getFieldPaths(d, true);
 * // Yields [ `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
 * ```
 *
 * @param object Object to get paths for
 * @param onlyLeaves If true, only paths with a primitive value are returned.
 * @returns
 */
export const getPaths = (object: object | null, onlyLeaves = false): ReadonlyArray<string> => {
  if (object === undefined) throw new Error(`Parameter 'object' is undefined`);
  if (object === null) return []

  const result: Array<string> = [];
  const iter = TraversableObject.depthFirst(object);

  for (const c of iter) {
    if (c.nodeValue === undefined && onlyLeaves) continue;
    let path = c.name;
    if (c.ancestors.length > 0) path = c.ancestors.join(`.`) + `.` + path;
    result.push(path);
  }
  return result;

};

/**
 * Returns a representation of the object
 * @param o 
 * @returns 
 */
export const getPathsAndData = (o: object): Array<Change<any>> => {
  if (o === null) return [];
  if (o === undefined) return [];
  const result: Array<Change<any>> = [];
  getPathsAndDataImpl(o, ``, result);
  return result;
}

const getPathsAndDataImpl = (o: object, prefix: string, result: Array<Change<any>>) => {
  if (typeof o === `object`) {
    for (const entries of Object.entries(o)) {
      const sub = (prefix.length > 0 ? prefix + `.` : ``) + entries[ 0 ];
      result.push({ path: sub, value: entries[ 1 ] });
      getPathsAndDataImpl(entries[ 1 ], sub, result);
    }
  }
  return result;
}