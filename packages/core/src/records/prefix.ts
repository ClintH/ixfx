/**
 * Returns a new object based on `data` but with all
 * properties prefixed by `prefix`.
 * 
 * ```js
 * prefixProperties({ name: `x`, size: 10 }, `test-`);
 * 
 * // Yields:
 * // { test-name: `x`, test-size: 10 }
 * ```
 * @param data 
 * @param prefix 
 * @returns 
 */
export function prefixProperties(data: Record<string | number, any>[], prefix: string): Record<string, unknown>[] {
  const changed: Record<string, unknown>[] = [];
  for (const d of data) {
    const entries = Object.entries(d);
    const changedEntries: [ key: string, value: any ][] = [];
    for (const [ key, value ] of entries) {
      changedEntries.push([ prefix + key, value ]);
    }
    changed.push(Object.fromEntries(changedEntries));
  }
  return changed;
}