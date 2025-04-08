/* eslint-disable @typescript-eslint/unbound-method */
import { isEqualValueDefault } from "@ixfxfun/core";
import { initStream } from "../init-stream.js";
import type { ReactiveInitial, ReactiveNonInitial, ReactiveArray, Reactive } from "../types.js";
import type { ArrayObjectOptions } from "./types.js";
import { compareArrays, type ChangeRecord } from "@ixfxfun/core/records";
import { remove as ArraysRemove,insertAt as ArraysInsertAt } from '@ixfxfun/arrays';
/**
 * Wraps an array object.
 * 
 * It returns an reactive along with some array-ish functions to manipulating it.
 * @param initialValue 
 * @param options 
 * @returns 
 */
export function arrayObject<V>(initialValue: readonly V[] = [], options: Partial<ArrayObjectOptions<V>> = {}): ReactiveArray<V> & ReactiveInitial<readonly V[]> {
  const eq = options.eq ?? isEqualValueDefault;
  const setEvent = initStream<V[]>();
  //const diffEvent = initStream<Array<Immutable.Change<any>>>();
  const arrayEvent = initStream<ChangeRecord<number>[]>();
  let value: readonly V[] = initialValue;
  let disposed = false;

  const set = (replacement: V[] | readonly V[]) => {
    const diff = compareArrays<V>(value as V[], replacement as V[], eq);
    //console.log(`Rx.fromArray.set diff`, diff);
    //if (diff.length === 0) return;
    //diffEvent.set(diff);
    value = replacement;
    setEvent.set([ ...replacement ]);
  }

  const setAt = (index: number, v: V) => {
    (value as V[])[ index ] = v;
    setEvent.set([ ...value ]);
  }

  const push = (v: V) => {
    value = [ ...value, v ];
    setEvent.set([ ...value ]);
    const cr: ChangeRecord<number> = [ `add`, value.length - 1, v ];
    arrayEvent.set([ cr ]);
  }

  const deleteAt = (index: number) => {
    const valueChanged = ArraysRemove(value, index);
    if (valueChanged.length === value.length) return; // no change
    const diff = compareArrays<V>(value as V[], valueChanged, eq);
    //console.log(diff.summary);
    value = valueChanged;
    setEvent.set([ ...value ]);
    arrayEvent.set(diff.summary);
  }

  const deleteWhere = (filter: (value: V) => boolean) => {
    const valueChanged = value.filter(v => !filter(v));
    const count = value.length - valueChanged.length;
    const diff = compareArrays<V>(value as V[], valueChanged, eq);
    value = valueChanged;
    setEvent.set([ ...value ]);
    arrayEvent.set(diff.summary);
    return count;
  }

  const insertAt = (index: number, v: V) => {
    const valueChanged = ArraysInsertAt(value, index, v);
    const diff = compareArrays<V>(value as V[], valueChanged, eq);
    value = valueChanged;
    setEvent.set([ ...value ]);
    arrayEvent.set(diff.summary);
  }

  // const update = (toMerge: Partial<V>) => {
  //   // eslint-disable-next-line unicorn/prefer-ternary
  //   if (value === undefined) {
  //     value = toMerge as V;
  //   } else {
  //     const diff = Immutable.compareData(toMerge, value);
  //     // console.log(`Rx.fromObject.update value: ${ JSON.stringify(value) }`);
  //     // console.log(`Rx.fromObject.update  diff: ${ JSON.stringify(diff) }`);
  //     if (diff.length === 0) return; // No changes
  //     value = {
  //       ...value,
  //       ...toMerge
  //     }
  //     diffEvent.set(diff);
  //   }
  //   setEvent.set(value);
  // }

  const dispose = (reason: string) => {
    if (disposed) return;
    //diffEvent.dispose(reason);
    setEvent.dispose(reason);
    disposed = true;
  }

  const r = {
    dispose,
    isDisposed() {
      return disposed
    },
    last: () => value,
    on: setEvent.on,
    onArray: arrayEvent.on,
    onValue: setEvent.onValue,
    setAt,
    push,
    deleteAt,
    deleteWhere,
    insertAt,
    /**
     * Set the whole object
     */
    set
  }
  return r;
}
