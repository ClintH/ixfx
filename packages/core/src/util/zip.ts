export type ZippedTuple<T extends readonly (readonly unknown[])[]> = {
  [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never;
};

export const zip = <T extends readonly (readonly unknown[])[]>(
  ...arrays: T
): Array<ZippedTuple<T>> => {
  if (arrays.some((a) => !Array.isArray(a))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths = arrays.map((a) => (a as any[]).length);

  const returnValue: any[] = [];
  const length = lengths[ 0 ];

  for (let index = 0; index < length; index++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    returnValue.push(arrays.map((a) => a[ index ]));
  }
  return returnValue;
};