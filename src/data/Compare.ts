import { mapKeys } from '../util/MapKeys.js';
import { isEqualDefault, type IsEqual } from '../util/IsEqual.js';
import { compareValuesShallow as IterableCompareValues } from '../iterables/CompareValues.js';
export type ChangeKind = `mutate` | `add` | `del`
export type ChangeRecord<TKey extends string | number | symbol> = [ kind: ChangeKind, path: TKey, value: any ];

/**
 * Result of {@link compareData}
 */
export type CompareChangeSet<TKey extends string | number> = {
  /**
   * _True_ if there are any changes
   */
  hasChanged: boolean
  /**
   * Results for child objects
   */
  children: Record<TKey, CompareChangeSet<any>>
  /**
   * Values that have changed
   */
  changed: Record<TKey, any>
  /**
   * Fields that have been added
   */
  added: Record<TKey, any>
  /**
   * Fields that have been removed
   */
  removed: Array<TKey>
  isArray: boolean
  /**
   * Summary of changes
   */
  summary: Array<ChangeRecord<TKey>>
}

/**
 * Compares the keys of two objects, returning a set of those in
 * common, and those in either A or B exclusively.
 * ```js
 * const a = { colour: `red`, intensity: 5 };
 * const b = { colour: `pink`, size: 10 };
 * const c = compareKeys(a, b);
 * // c.shared = [ `colour` ]
 * // c.a = [ `intensity` ]
 * // c.b = [ `size`  ]
 * ```
 * @param a 
 * @param b 
 * @returns 
 */
export const compareKeys = (a: object, b: object) => {
  const c = IterableCompareValues(Object.keys(a), Object.keys(b));
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
 * Under the hood, we use {@link compareData}(a, b, true). If B has additional or removed fields,
 * this is considered an error.
 * 
 * If a field is an array, the whole array is returned, rather than a diff.
 * @param a 
 * @param b 
 */
export const changedDataFields = (a: object, b: object) => {
  const r = compareData(a, b, true);
  if (Object.entries(r.added).length > 0) throw new Error(`Shape of data has changed`);
  if (Object.entries(r.removed).length > 0) throw new Error(`Shape of data has changed`);

  const output = compareResultToObject(r, b);
  return output;
}

const compareResultToObject = (r: CompareChangeSet<any>, b: object): Record<string, any> | Array<any> => {
  const output = {}

  if (r.isArray) {
    return b;
  }

  for (const entry of Object.entries(r.changed)) {
    (output as any)[ entry[ 0 ] ] = entry[ 1 ];
  }

  for (const entry of Object.entries(r.added)) {
    (output as any)[ entry[ 0 ] ] = entry[ 1 ];
  }


  for (const childEntry of Object.entries(r.children)) {
    if (childEntry[ 1 ].hasChanged) {
      (output as any)[ childEntry[ 0 ] ] = compareResultToObject(childEntry[ 1 ], (b as any)[ childEntry[ 0 ] ]);
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
export const compareArrays = <TValue>(a: Array<TValue>, b: Array<TValue>, eq: IsEqual<TValue> = isEqualDefault<TValue>): CompareChangeSet<number> => {
  if (!Array.isArray(a)) throw new Error(`Param 'a' is not an array`);
  if (!Array.isArray(b)) throw new Error(`Param 'b' is not an array`);
  const c = compareData(a, b, false, eq);
  if (!c.isArray) throw new Error(`Change set does not have arrays as parameters`);

  const convert = (key: string) => {
    if (key.startsWith(`_`)) {
      return Number.parseInt(key.slice(1));
    } else throw new Error(`Unexpected key '${ key }'`);
  }
  const cc: CompareChangeSet<number> = {
    ...c,
    added: mapKeys(c.added, convert),
    changed: mapKeys(c.changed, convert),
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
export const compareData = (a: object, b: object, assumeSameShape = false, eq: IsEqual<any> = isEqualDefault): CompareChangeSet<string> => {
  const entriesA = Object.entries(a);
  const entriesB = Object.entries(b);

  const scannedKeys = new Set<string>();
  const changed = {}
  const added = {}
  const children = {}
  const removed: Array<string> = [];
  const isArray = Array.isArray(a);

  const summary = new Array<ChangeRecord<string>>();
  let hasChanged = false;

  // Look for existing entries of A that are modified
  for (const entry of entriesA) {
    const outputKey = isArray ? `_${ entry[ 0 ] }` : entry[ 0 ]
    const aValue = entry[ 1 ];
    const bValue = (b as any)[ entry[ 0 ] ];
    scannedKeys.add(entry[ 0 ]);

    if (bValue === undefined) {
      // B does not have a key from A
      hasChanged = true;
      if (assumeSameShape && !isArray) {
        // If we're assuming it's the same shape, then _undefined_ is actually the value
        (changed as any)[ outputKey ] = bValue;
        summary.push([ `mutate`, outputKey, bValue ]);
      } else {
        // Key removed
        removed.push(outputKey);
        summary.push([ `del`, outputKey, aValue ]);
      }
      continue;
    }

    if (typeof aValue === `object`) {
      const r = compareData(aValue, bValue, assumeSameShape, eq);
      if (r.hasChanged) hasChanged = true;
      (children as any)[ outputKey ] = r;
      const childSummary = r.summary.map(sum => { return [ sum[ 0 ], outputKey + `.` + sum[ 1 ], sum[ 2 ] ] }) as Array<ChangeRecord<string>>;
      summary.push(...childSummary);
    } else {
      if (!eq(aValue, bValue)) {
        (changed as any)[ outputKey ] = bValue;
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
      (added as any)[ key ] = entry[ 1 ];
      hasChanged = true;
      summary.push([ `add`, key, entry[ 1 ] ])
    }
  }
  return {
    changed, added, removed, children, hasChanged, isArray, summary
  }
}