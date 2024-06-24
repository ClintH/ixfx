/**
 * Returns a copy of `object` with integer numbers as keys instead of whatever it has.
 * ```js
 * keysToNumbers({ '1': true }); // Yields: { 1: true }
 * ```
 * 
 * The `onInvalidKey` sets how to handle keys that cannot be converted to integers.
 * * 'throw' (default): throws an exception
 * * 'ignore': that key & value is ignored
 * * 'keep': uses the string key instead
 * 
 * 
 * ```js
 * keysToNumber({ hello: 'there' }, `ignore`); // Yields: {  }
 * keysToNumber({ hello: 'there' }, `throw`);  // Exception
 * keysToNumber({ hello: 'there' }, `keep`);   // Yields: { hello: 'there' }
 * ```
 * 
 * Floating-point numbers will be converted to integer by rounding.
 * ```js
 * keysToNumbers({ '2.4': 'hello' }); // Yields: { 2: 'hello' }
 * ```
 * @param object 
 * @param onInvalidKey 
 * @returns 
 */
export const keysToNumbers = <T>(object: Record<any, T>, onInvalidKey: `throw` | `ignore` | `keep` = `throw`): Record<number, T> => {
  const returnObject: Record<number, T> = {};
  for (const entry of Object.entries(object)) {
    const asNumber = Number.parseInt(entry[ 0 ]);
    if (Number.isNaN(asNumber)) {
      switch (onInvalidKey) {
        case `throw`: {
          throw new TypeError(`Cannot convert key '${ entry[ 0 ] }' to an integer`);
        }
        case `ignore`: {
          continue;
        }
        case `keep`: {
          (returnObject as any)[ entry[ 0 ] ] = entry[ 1 ];
          continue;
        }
        default: {
          throw new Error(`Param 'onInvalidKey' should be: 'throw', 'ignore' or 'keep'.`);
        }
      }
    }
    returnObject[ asNumber ] = entry[ 1 ];
  }
  return returnObject;
}
