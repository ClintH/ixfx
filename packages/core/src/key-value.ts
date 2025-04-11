
import type { KeyValue } from './types.js'
//import { minMaxAvg as arrayMinMaxAvg } from '../../ixfx/src/numbers-compute.js';

import { defaultComparer } from './comparers.js';

// const byKey = (reverse = false) => pipe(
//   reverse ? reverseOrd(S.Ord) : S.Ord,
//   contramap((v: KeyValue) => v[ 0 ])
// );

// export const byValueString = (reverse = false) => pipe(
//   reverse ? reverseOrd(S.Ord) : S.Ord,
//   contramap((v: KeyValue) => v[ 1 ] as string)
// );

// const byValueNumber = (reverse = false) => pipe(
//   reverse ? reverseOrd(N.Ord) : N.Ord,
//   contramap((v: KeyValue) => v[ 1 ] as number)
// );

// export const sortByKey = (reverse = false) => sort<KeyValue>(byKey(reverse));
// export const sortByValueString = (reverse = false) => sort<KeyValue>(byValueString(reverse));
// export const sortByValueNumber = (reverse = false) => sort<KeyValue>(byValueNumber(reverse));

export type KeyValueSorter = (data: KeyValue[]) => KeyValue[];

const sorterByValueIndex = (index: number, reverse = false) => {
  return (values: KeyValue[]) => {
    const s = values.toSorted((a, b) => {
      return defaultComparer(a[ index ], b[ index ]);
    });
    if (reverse) return s.reverse();
    return s;
  }
}

export type KeyValueSortSyles = `value` | `value-reverse` | `key` | `key-reverse`;
export const keyValueSorter = (sortStyle: KeyValueSortSyles): KeyValueSorter => {
  switch (sortStyle) {
    case `value`: {
      return sorterByValueIndex(1, false);
    }
    case `value-reverse`: {
      return sorterByValueIndex(1, true);
    }
    case `key`: {
      return sorterByValueIndex(0, false);
    }
    case `key-reverse`: {
      return sorterByValueIndex(0, true);
    }
    default: {
      throw new Error(`Unknown sorting value '${ (sortStyle as string) }'. Expecting: value, value-reverse, key or key-reverse`);
    }
  }
};


// export const minMaxAvg = (entries: readonly KeyValue[], conversionFunction?: (v: KeyValue) => number) => {
//   const converter = conversionFunction ?? ((v: KeyValue) => v[ 1 ] as number);
//   const values = entries.map<number>(entry => converter(entry));
//   return arrayMinMaxAvg(values);
// };