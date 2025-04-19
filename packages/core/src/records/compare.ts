import { mapObjectKeys } from '@ixfx/core/records';
import { compareIterableValuesShallow, isEqualDefault, type IsEqual } from '@ixfx/core';
import type { ChangeRecord, CompareChangeSet } from '../types-compare.js';


/**
 * Compares the keys of two objects, returning a set of those in
 * common, and those in either A or B exclusively.
 * ```js
 * const a = { colour: `red`, intensity: 5 };
 * const b = { colour: `pink`, size: 10 };
 * const c = compareObjectKeys(a, b);
 * // c.shared = [ `colour` ]
 * // c.a = [ `intensity` ]
 * // c.b = [ `size`  ]
 * ```
 * @param a 
 * @param b 
 * @returns 
 */
export const compareObjectKeys = (a: object, b: object) => {
  const c = compareIterableValuesShallow(Object.keys(a), Object.keys(b));
  return c;
}

/**
 * Returns the changed fields from A -> B. It's assumed that A and B have the same shape.
 * ie. returns an object that only consists of fields which have changed in B compared to A.
 * 
 * ```js
 * const a = { msg: `hi`, v: 10 };
 * 
 * changedDataFields(a, { msg: `hi`,   v: 10 }); // {}
 * changedDataFields(a, { msg: `hi!!`, v: 10 }); // { msg: `hi!!` }
 * changedDataFields(a, { msg: `hi!!` });       // { msg: `hi!!`, v: undefined }
 * ```
 * 
 * Under the hood, we use {@link compareObjectData}(a, b, true). If B has additional or removed fields,
 * this is considered an error.
 * 
 * If a field is an array, the whole array is returned, rather than a diff.
 * @param a 
 * @param b 
 */
export const changedObjectDataFields = (a: object, b: object) => {
  const r = compareObjectData(a, b, true);
  if (Object.entries(r.added).length > 0) throw new Error(`Shape of data has changed`);
  if (Object.entries(r.removed).length > 0) throw new Error(`Shape of data has changed`);

  const output = compareResultToObject(r, b);
  return output;
}

const compareResultToObject = <TKey extends string | number>(r: CompareChangeSet<TKey>, b: object): Record<string, unknown> | object[] => {
  const output = {}

  if (r.isArray) {
    return b as object[];
  }

  for (const entry of Object.entries(r.changed)) {
    (output as object)[ entry[ 0 ] ] = entry[ 1 ];
  }

  for (const entry of Object.entries(r.added)) {
    (output as object)[ entry[ 0 ] ] = entry[ 1 ];
  }


  for (const childEntry of Object.entries(r.children)) {
    const childResult = childEntry[ 1 ] as CompareChangeSet<TKey>;
    if (childResult.hasChanged) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      (output as object)[ childEntry[ 0 ] ] = compareResultToObject(childResult, b[ childEntry[ 0 ] ]);
    }
  }
  return output;
}

/**
 * Produces a {@link CompareChangeSet} between two arrays.
 * 
 * @param a Earlier array to compare
 * @param b Later array to compare
 * @param eq Equality comparison for values
 * @returns Change set.
 */
export const compareArrays = <TValue>(a: TValue[], b: TValue[], eq: IsEqual<TValue> = isEqualDefault<TValue>): CompareChangeSet<number> => {
  if (!Array.isArray(a)) throw new Error(`Param 'a' is not an array`);
  if (!Array.isArray(b)) throw new Error(`Param 'b' is not an array`);
  const c = compareObjectData(a, b, false, eq);
  if (!c.isArray) throw new Error(`Change set does not have arrays as parameters`);

  const convert = (key: string): number => {
    if (key.startsWith(`_`)) {
      return Number.parseInt(key.slice(1));
    } else throw new Error(`Unexpected key '${ key }'`);
  }
  const cc: CompareChangeSet<number> = {
    ...c,
    added: mapObjectKeys(c.added, convert),
    changed: mapObjectKeys(c.changed, convert),
    removed: c.removed.map(v => convert(v)),
    summary: c.summary.map(value => {
      return [ value[ 0 ], convert(value[ 1 ]), value[ 2 ] ];
    })
  }
  return cc;
}

/**
 * Compares A to B. Assumes they are simple objects, essentially key-value pairs, where the 
 * values are primitive values or other simple objects. It also works with arrays.
 * 
 * Uses === equality semantics by default.
 * @param a 
 * @param b 
 */
export const compareObjectData = <T>(a: object | null, b: object | null, assumeSameShape = false, eq: IsEqual<T> = isEqualDefault): CompareChangeSet<string> => {
  a ??= {};
  b ??= {};
  const entriesA = Object.entries(a);
  const entriesB = Object.entries(b);

  const scannedKeys = new Set<string>();
  const changed = {}
  const added = {}
  const children = {}
  const removed: string[] = [];
  const isArray = Array.isArray(a);

  const summary = new Array<ChangeRecord<string>>();
  let hasChanged = false;

  // Look for existing entries of A that are modified
  for (const entry of entriesA) {
    const outputKey = isArray ? `_${ entry[ 0 ] }` : entry[ 0 ]
    const aValue = entry[ 1 ] as unknown;
    const bValue = b[ entry[ 0 ] ] as unknown;
    scannedKeys.add(entry[ 0 ]);

    if (bValue === undefined) {
      // B does not have a key from A
      hasChanged = true;
      if (assumeSameShape && !isArray) {
        // If we're assuming it's the same shape, then _undefined_ is actually the value
        changed[ outputKey ] = bValue;
        summary.push([ `mutate`, outputKey, bValue ]);
      } else {
        // Key removed
        removed.push(outputKey);
        summary.push([ `del`, outputKey, aValue ]);
      }
      continue;
    }

    if (typeof aValue === `object`) {
      const r = compareObjectData(aValue, bValue as object, assumeSameShape, eq);
      if (r.hasChanged) hasChanged = true;
      children[ outputKey ] = r;
      const childSummary = r.summary.map(sum => { return [ sum[ 0 ], outputKey + `.` + sum[ 1 ], sum[ 2 ] ] }) as ChangeRecord<string>[];
      summary.push(...childSummary);
    } else {
      if (!eq(aValue as T, bValue as T)) {
        changed[ outputKey ] = bValue;
        hasChanged = true;
        summary.push([ `mutate`, outputKey, bValue ]);
      }
    }
  }

  // Look for entries in B that weren't in A
  if (!assumeSameShape || isArray) {
    for (const entry of entriesB) {
      const key = isArray ? `_${ entry[ 0 ] }` : entry[ 0 ]

      if (scannedKeys.has(entry[ 0 ])) continue;
      added[ key ] = entry[ 1 ] as unknown;
      hasChanged = true;
      summary.push([ `add`, key, entry[ 1 ] ])
    }
  }
  return {
    changed, added, removed, children, hasChanged, isArray, summary
  }
}