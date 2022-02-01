import { sort } from 'fp-ts/Array.js';
import { pipe } from 'fp-ts/function.js';
import * as S from 'fp-ts/string.js';
import * as N from 'fp-ts/number.js';
import { reverse as reverseOrd, contramap } from 'fp-ts/Ord.js';


/// ✔ Sorting functions are unit tested

type Primitive = string | number;
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

