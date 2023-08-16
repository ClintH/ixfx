import { number as guardNumber } from './Guards.js';
import { untilMatch } from './Text.js';
export * as IterableAsync from './IterableAsync.js';
export * as Debug from './Debug.js';

/**
 * Returns `fallback` if `v` is NaN, otherwise returns `v`.
 *
 * Throws if `v` is not a number type.
 * @param v
 * @param fallback
 * @returns
 */
export const ifNaN = (v: number, fallback: number): number => {
  // ✔️ Unit tested

  if (Number.isNaN(v)) return fallback;
  if (typeof v !== 'number') {
    throw new Error(`v is not a number. Got: ${typeof v}`);
  }
  return v;
};

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
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapObject = <
  SourceType extends Record<string, any>,
  DestinationFieldType,
>(
  object: SourceType,
  mapFn: (fieldValue: any, field: string, index: number) => DestinationFieldType
): RemapObjectPropertyType<SourceType, DestinationFieldType> => {
  type MapResult = [field: string, value: DestinationFieldType];
  const entries = Object.entries(object);
  const mapped = entries.map(([sourceField, sourceFieldValue], i) => [
    sourceField,
    mapFn(sourceFieldValue, sourceField, i),
  ]) as MapResult[];
  // @ts-ignore
  return Object.fromEntries(mapped);
};

export type RemapObjectPropertyType<OriginalType, PropType> = {
  readonly [Property in keyof OriginalType]: PropType;
};

/**
 * Returns true if `x` is a power of two
 * @param x
 * @returns True if `x` is a power of two
 */
export const isPowerOfTwo = (x: number) => Math.log2(x) % 1 === 0;

/**
 * Returns the relative difference from the `initial` value
 * ```js
 * const rel = relativeDifference(100);
 * rel(100); // 1
 * rel(150); // 1.5
 * rel(50);  // 0.5
 * ```
 *
 * The code for this is simple:
 * ```js
 * const relativeDifference = (initial) => (v) => v/initial
 * ```
 * @param {number} initial
 * @returns
 */
export const relativeDifference = (initial: number) => (v: number) =>
  v / initial;

// try {
//   if (typeof window !== `undefined`) {
//     //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
//     (window as any).ixfx = {...(window as any).ixfx, clamp, clampIndex, flip, interpolate, interpolateAngle, proportion, relativeDifference, scale, scalePercent, wrap, wrapInteger, wrapRange};
//   }
// } catch { /* no-op */ }

/**
 * Returns a field on object `o` by a dotted path.
 * ```
 * const d = {
 *  accel: {x: 1, y: 2, z: 3},
 *  gyro:  {x: 4, y: 5, z: 6}
 * };
 * getFieldByPath(d, `accel.x`); // 1
 * getFieldByPath(d, `gyro.z`);  // 6
 * getFieldByPath(d, `gyro`);    // {x:4, y:5, z:6}
 * getFieldByPath(d, ``);        // Returns original object
 * ```
 *
 * If a field does not exist, `undefined` is returned.
 * Use {@link getFieldPaths} to get a list of paths.
 *
 * Throws if `o` is not an object.
 * @param o
 * @param path
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldByPath = (o: any, path: string = ``): any | undefined => {
  if (o === null) throw new Error(`Parameter 'o' is null`);
  if (typeof o !== 'object') {
    throw new Error(`Parameter 'o' is not an object. Got: ${typeof o}`);
  }
  if (path.length === 0) return o;
  if (path in o) {
    return o[path];
  } else {
    const start = untilMatch(path, `.`);
    if (start in o) {
      return getFieldByPath(o[start], path.substring(start.length + 1));
    } else {
      return undefined;
    }
  }
};

/**
 * Returns a list of paths for all the fields on `o`
 * ```
 * const d = {
 *  accel: {x: 1, y: 2, z: 3},
 *  gyro:  {x: 4, y: 5, z: 6}
 * };
 * const paths = getFieldPaths(d);
 * // Yields [ `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
 * ```
 *
 * Use {@link getFieldByPath} to fetch data by this 'path' string.
 *
 * If object is _null_, and empty array is returned.
 * @param o
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldPaths = (o: any): readonly string[] => {
  if (o === null) return [];
  if (typeof o !== 'object') {
    throw new Error(`Parameter o should be an object. Got: ${typeof o}`);
  }
  const paths: string[] = [];
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const probe = (o: any, prefix = ``) => {
    if (typeof o === `object`) {
      const keys = Object.keys(o);
      if (prefix.length > 0) prefix += `.`;
      keys.forEach((k) => probe(o[k], prefix + k));
    } else {
      //eslint-disable-next-line functional/immutable-data
      paths.push(prefix);
    }
  };
  probe(o);
  return paths;
};

/**
 * Rounds `v` up to the nearest multiple of `multiple`
 * ```
 * roundMultiple(19, 20); // 20
 * roundMultiple(21, 20); // 40
 * ```
 * @param v
 * @param multiple
 * @returns
 */
export const roundUpToMultiple = (v: number, multiple: number): number => {
  guardNumber(v, `nonZero`, `v`);
  guardNumber(multiple, `nonZero`, `muliple`);
  return Math.ceil(v / multiple) * multiple;
};

export type ToString<V> = (itemToMakeStringFor: V) => string;

/**
 * Function that returns true if `a` and `b` are considered equal
 */
export type IsEqual<V> = (a: V, b: V) => boolean;

/**
 * Default comparer function is equiv to checking `a === b`
 */
export const isEqualDefault = <V>(a: V, b: V): boolean => a === b;

/**
 * Comparer returns true if string representation of `a` and `b` are equal.
 * Uses `toStringDefault` to generate a string representation (`JSON.stringify`)
 * @returns True if the contents of `a` and `b` are equal
 */
export const isEqualValueDefault = <V>(a: V, b: V): boolean => {
  // ✔ UNIT TESTED
  if (a === b) return true; // Object references are the same, or string values are the same
  return toStringDefault(a) === toStringDefault(b); // String representations are the same
};

/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */
export const toStringDefault = <V>(itemToMakeStringFor: V): string =>
  typeof itemToMakeStringFor === `string`
    ? itemToMakeStringFor
    : JSON.stringify(itemToMakeStringFor);

export const runningiOS = () =>
  [
    `iPad Simulator`,
    `iPhone Simulator`,
    `iPod Simulator`,
    `iPad`,
    `iPhone`,
    `iPod`,
  ].includes(navigator.platform) ||
  // iPad on iOS 13 detection
  (navigator.userAgent.includes(`Mac`) && `ontouchend` in document);

export type CompareResult = number; // 0 | 1 | -1;
export type Comparer<V> = (a: V, b: V) => CompareResult;

/**
 * Sort numbers in ascending order.
 *
 * ```js
 * [10, 4, 5, 0].sort(numericComparer);
 * // Yields: [0, 4, 5, 10]
 * [10, 4, 5, 0].sort(comparerInverse(numericComparer));
 * // Yields: [ 10, 5, 4, 0]
 * ```
 * @param x
 * @param y
 * @returns
 */
export const numericComparer = (x: number, y: number): CompareResult => {
  // ✔️ Unit tested
  if (x === y) return 0;
  if (x > y) return 1;
  return -1;
};

// /**
//  * Sorts numbers in descending order
//  * @param x
//  * @param y
//  * @returns
//  */
// export const numericComparerInverse = (x: number, y: number): CompareResult => {
//   // ✔️ Unit tested
//   if (x === y) return 0;
//   if (x > y) return -1;
//   return 1;
// };

/**
 * Default sort comparer, following same sematics as Array.sort.
 * Consider using {@link defaultComparer} to get more logical sorting of numbers.
 *
 * Note: numbers are sorted in alphabetical order, eg:
 * ```js
 * [ 10, 20, 5, 100 ].sort(jsComparer); // same as .sort()
 * // Yields: [10, 100, 20, 5]
 * ```
 * @param x
 * @param y
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const jsComparer = (x: any, y: any): CompareResult => {
  // ✔️ Unit tested

  // Via https://stackoverflow.com/questions/47334234/how-to-implement-array-prototype-sort-default-compare-function
  if (x === undefined && y === undefined) return 0;
  if (x === undefined) return 1;
  if (y === undefined) return -1;

  const xString = defaultToString(x);
  const yString = defaultToString(y);

  if (xString < yString) return -1;
  if (xString > yString) return 1;
  return 0;
};

// export const jsComparerInverse = (x: any, y: any): CompareResult =>
//   jsComparer(x, y) * -1;

/**
 * Compares numbers by numeric value, otherwise uses the default
 * logic of string comparison.
 *
 * Is an ascending sort:
 *  b, a, c -> a, b, c
 *  10, 5, 100 -> 5, 10, 100
 * @param x
 * @param y
 * @see {@link defaultComparerInverse} Inverted order
 * @returns
 */
export const defaultComparer = (x: any, y: any): CompareResult => {
  if (typeof x === `number` && typeof y === `number`) {
    return numericComparer(x, y);
  }
  return jsComparer(x, y);
};

// /**
//  * Compares numbers by numeric value, otherwise uses the default
//  * logic of string comparison.
//  *
//  * Is an descending sort:
//  *  b, a, c -> c, a, b
//  *  10, 5, 100 -> 100, 10, 5
//  * @param x
//  * @param y
//  * @returns
//  * @see {@link defaultComparer} Asending
//  */
// export const defaultComparerInverse = (x: any, y: any): CompareResult => {
//   if (typeof x === `number` && typeof y === `number`) {
//     return numericComparerInverse(x, y);
//   }
//   return jsComparerInverse(x, y);
// };

/**
 * Inverts the source comparer.
 * @param fn
 * @returns
 */
export const comparerInverse = <V>(fn: Comparer<V>): Comparer<V> => {
  return (x: V, y: V) => {
    const v = fn(x, y);
    return v * -1;
  };
};

/**
 * If values are strings, uses that as the key.
 * Otherwise uses `JSON.stringify`.
 * @param a
 * @returns
 */
export const defaultKeyer = <V>(a: V) => {
  if (typeof a === `string`) {
    return a;
  } else {
    return JSON.stringify(a);
  }
};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultToString = (obj: any) => {
  //ECMA specification: http://www.ecma-international.org/ecma-262/6.0/#sec-tostring
  if (obj === null) return `null`;
  if (typeof obj === `boolean` || typeof obj === `number`) {
    return obj.toString();
  }

  if (typeof obj === `string`) return obj;
  if (typeof obj === `symbol`) throw new TypeError();
  return obj.toString();
};

try {
  if (typeof window !== `undefined`) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (window as any).ixfx = {
      ...(window as any).ixfx,
      getFieldByPath,
      getFieldPaths,
    };
  }
} catch {
  /* no-op */
}
