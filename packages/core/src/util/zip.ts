export const zip = (
  ...arrays: any[][] | readonly any[][] | readonly (readonly any[])[]
): any[] => {
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