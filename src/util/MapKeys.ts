export const mapKeys = <TKey extends string | number | symbol>(object: Record<any, any>, mapFunction: (key: string) => TKey) => {
  // @ts-expect-error
  const destinationObject: Record<TKey, any> = {};
  for (const entries of Object.entries(object)) {
    const key = mapFunction(entries[ 0 ]);
    destinationObject[ key ] = entries[ 1 ];
  }
  return destinationObject;
}