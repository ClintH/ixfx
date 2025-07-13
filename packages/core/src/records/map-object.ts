import type { RemapObjectPropertyType } from "../ts-utility.js";

/**
 * Maps the top-level properties of an object through a map function.
 * That is, run each of the values of an object through a function,
 * setting the result onto the same key structure as original.
 * 
 * It is NOT recursive.
 *
 * The mapping function gets a single args object, consisting of `{ value, field, index }`,
 * where 'value' is the value of the field, 'field' the name, and 'index' a numeric count.
 * @example Double the value of all fields
 * ```js
 * const rect = { width: 100, height: 250 };
 * const doubled = mapObjectShallow(rect, args => {
 *  return args.value*2;
 * });
 * // Yields: { width: 200, height: 500 }
 * ```
 *
 * Since the map callback gets the name of the property, it can do context-dependent things.
 * ```js
 * const rect = { width: 100, height: 250, colour: 'red' }
 * const doubled = mapObjectShallow(rect, args => {
 *  if (args.field === 'width') return args.value*3;
 *  else if (typeof args.value === 'number') return args.value*2;
 *  return args.value;
 * });
 * // Yields: { width: 300, height: 500, colour: 'red' }
 * ```
 * In addition to bulk processing, it allows remapping of property types.
 *
 * In terms of type-safety, the mapped properties are assumed to have the
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
 * const oAvg = mapObjectShallow(o, args => {
 *  return movingAverage(10);
 * });
 *
 * // Instead of { x:number, y:number... }, we now have { x:movingAverage(), y:movingAverage()... }
 * // Add a value to the averager
 * oAvg.x.add(20);
 * ```
 */
export const mapObjectShallow = <
  TSource extends Record<string, any>,
  TFieldValue,
>(
  object: TSource,
  mapFunction: (args: MapObjectArgs) => TFieldValue

): RemapObjectPropertyType<TSource, TFieldValue> => {
  type MapResult = [ field: string, value: TFieldValue ];
  const entries = Object.entries(object);
  const mapped = entries.map(([ sourceField, sourceFieldValue ], index) => [
    sourceField,
    mapFunction({ value: sourceFieldValue, field: sourceField, index, path: sourceField }),
  ]) as MapResult[];
  return Object.fromEntries(mapped) as RemapObjectPropertyType<TSource, TFieldValue>;
};

export type MapObjectArgs = {
  field: string
  path: string
  value: any
  index: number
}

/**
 * Maps the contents of `data` using `mapper` as a structured set of map functions.
 * ```js
 * const a = {
 *  person: {
 *    size: 20
 *  }
 *  hello: `there`
 * }
 * mapObjectByObject(a, {
 *  person: {
 *    size: (value, context) => {
 *      return value * 2
 *    }
 *  }
 * });
 * // Yields: { person: { size: 40 }, hello: `there` }
 * ```
 * @param data 
 * @param mapper 
 * @returns 
 */
export function mapObjectByObject(data: object, mapper: Record<string, (value: any, context: any) => any>) {
  const entries = Object.entries(data);
  for (const entry of entries) {
    if (entry[ 0 ] in mapper) {
      const m = mapper[ entry[ 0 ] ];
      entry[ 1 ] = (typeof m === `object`) ?
        mapObjectByObject(entry[ 1 ] as object, m) :
        m(entry[ 1 ], data);
    }
  }
  return Object.fromEntries(entries);
}