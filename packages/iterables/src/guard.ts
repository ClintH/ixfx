

export const isAsyncIterable = (v: any): v is AsyncIterable<any> => {
  if (typeof v !== `object`) return false;
  if (v === null) return false;
  return Symbol.asyncIterator in v;

}

export const isIterable = (v: any): v is Iterable<any> => {
  if (typeof v !== `object`) return false;
  if (v === null) return false;
  return Symbol.iterator in v;

}

