
export type ChangeKind = `mutate` | `add` | `del`
export type ChangeRecord = [ kind: ChangeKind, path: string, value: any ];



/**
 * Result of {@link compareData}
 */
export type CompareChangeSet = {
  /**
   * _True_ if there are any changes
   */
  hasChanged: boolean
  /**
   * Results for child objects
   */
  children: Record<string, CompareChangeSet>
  /**
   * Values that have changed
   */
  changed: Record<string, any>
  /**
   * Fields that have been added
   */
  added: Record<string, any>
  /**
   * Fields that have been removed
   */
  removed: Array<string>
  isArray: boolean
  summary: Array<ChangeRecord>
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
 * Under the hood, we use `{@link compareData}(a, b, true)`. If B has additional or removed fields,
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

const compareResultToObject = (r: CompareChangeSet, b: object): Record<string, any> | Array<any> => {
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
 * Compares A to B. Assumes they are simple objects, essentially key-value pairs, where the values are primitive values or other simple objects.
 * 
 * @param a 
 * @param b 
 */
export const compareData = (a: object, b: object, assumeSameShape = false): CompareChangeSet => {
  const entriesA = Object.entries(a);
  const entriesB = Object.entries(b);

  const scannedKeys = new Set<string>();
  const changed = {}
  const added = {}
  const children = {}
  const removed: Array<string> = [];
  const isArray = Array.isArray(a);

  const summary = new Array<ChangeRecord>();
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
      const r = compareData(aValue, bValue, assumeSameShape);
      if (r.hasChanged) hasChanged = true;
      (children as any)[ outputKey ] = r;
      const childSummary = r.summary.map(sum => { return [ sum[ 0 ], outputKey + `.` + sum[ 1 ], sum[ 2 ] ] }) as Array<ChangeRecord>;
      summary.push(...childSummary);
    } else {
      if (aValue !== bValue) {
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