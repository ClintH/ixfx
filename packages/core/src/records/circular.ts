export const removeCircularReferences = (value: object, replaceWith: any = null, seen = new WeakSet(), path = ``) => {
  if (value === null) return value;
  if (typeof value !== `object`) throw new TypeError(`Param 'value' must be an object. Got type: ${ typeof value }`);

  seen.add(value);
  const entries = Object.entries(value);
  for (const entry of entries) {
    if (entry[ 1 ] === null) continue;
    if (typeof entry[ 1 ] !== `object`) continue;

    if (seen.has(entry[ 1 ] as WeakKey)) {
      //value[ entry[0] ] = replaceWith;
      entry[ 1 ] = replaceWith;
      continue;
    }
    entry[ 1 ] = removeCircularReferences(entry[ 1 ] as object, replaceWith, seen, `${ entry[ 0 ] }.`);
  }
  return Object.fromEntries(entries);
};