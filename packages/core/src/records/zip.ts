/**
 * Merge corresponding objects from arrays `a` and `b`.
 * 
 * Arrays must be the same length. When merging objects, the key-values of 'b' override those of 'a'.
 * @param a 
 * @param b 
 */
export function* zipRecords<TKey extends string | symbol | number, TValue>(a: Record<TKey, TValue>[], b: Record<TKey, TValue>[]) {
  if (!Array.isArray(a)) throw new TypeError(`Param 'a' is expected to be an array`);
  if (!Array.isArray(b)) throw new TypeError(`Param 'b' is expected to be an array`);

  if (a.length !== b.length) throw new TypeError(`Array length mismatch. A: ${ a.length } B: ${ b.length }`);

  const zipSingle = (aa: Record<TKey, TValue>, bb: Record<TKey, TValue>) => {
    return {
      ...aa,
      ...bb,
    };
  };

  for (let index = 0; index < a.length; index++) {
    yield zipSingle(a[ index ], b[ index ]);
  }
}
