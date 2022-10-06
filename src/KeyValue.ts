import { sort } from 'fp-ts/lib/Array.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as S from 'fp-ts/lib/string.js';
import * as N from 'fp-ts/lib/number.js';
import { reverse as reverseOrd, contramap } from 'fp-ts/lib/Ord.js';
import {minMaxAvg as arrayMinMaxAg} from './collections/Arrays.js';

/// ✔ Sorting functions are unit tested

export type Primitive = string | number;
export type KeyValue = readonly [key: string, value: Primitive];

const byKey = (reverse:boolean = false) => pipe(
  reverse ? reverseOrd(S.Ord) : S.Ord, 
  contramap((v:KeyValue) => v[0])
);

export const byValueString = (reverse:boolean = false) => pipe(
  reverse ? reverseOrd(S.Ord) : S.Ord, 
  contramap((v:KeyValue) => v[1] as string)
);

const byValueNumber = (reverse:boolean = false) => pipe(
  reverse ? reverseOrd(N.Ord) : N.Ord, 
  contramap((v:KeyValue) => v[1] as number)
);

export const sortByKey = (reverse:boolean = false) => sort<KeyValue>(byKey(reverse));
export const sortByValueString = (reverse:boolean = false) => sort<KeyValue>(byValueString(reverse));
export const sortByValueNumber = (reverse:boolean = false) => sort<KeyValue>(byValueNumber(reverse));

// eslint-disable-next-line functional/prefer-readonly-type
export type SortingFn = (data:KeyValue[]) => KeyValue[];

export const getSorter = (sortStyle:`value` | `valueReverse` | `key` | `keyReverse`) => {
  switch (sortStyle) {
  case `value`:
    return sortByValueNumber(false);
  case `valueReverse`:
    return sortByValueNumber(true);
  case `key`:
    return sortByKey(false);
  case `keyReverse`:
    return sortByKey(true);
  default:
    throw new Error(`Unknown sorting value '${sortStyle}'. Expecting: value, valueReverse, key or keyReverse`);
  }
};


export const minMaxAvg = (entries:readonly KeyValue[], conversionFn?:(v:KeyValue) => number) => {
  if (conversionFn === undefined) conversionFn = (v:KeyValue) => v[1] as number;
  const values = entries.map<number>(conversionFn);
  return arrayMinMaxAg(values);
};