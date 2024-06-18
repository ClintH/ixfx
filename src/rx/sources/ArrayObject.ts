/* eslint-disable @typescript-eslint/unbound-method */
import { isEqualValueDefault } from "../../util/IsEqual.js";
import * as Arrays from '../../collections/arrays/index.js';
import { initStream } from "../InitStream.js";
import type { ReactiveInitial, ReactiveNonInitial, ReactiveArray, Reactive } from "../Types.js";
import type { ArrayObjectOptions } from "./Types.js";
import { compareArrays, type ChangeRecord } from "../../data/Compare.js";

/**
 * Wraps an array object
 * @param initialValue 
 * @param options 
 * @returns 
 */
export function arrayObject<V>(initialValue: ReadonlyArray<V> = [], options: Partial<ArrayObjectOptions<V>> = {}): Reactive<ReadonlyArray<V>> & ReactiveArray<V> & (ReactiveInitial<ReadonlyArray<V>> | ReactiveNonInitial<ReadonlyArray<V>>) {
  const eq = options.eq ?? isEqualValueDefault;
  const setEvent = initStream<Array<V>>();
  //const diffEvent = initStream<Array<Immutable.Change<any>>>();
  const arrayEvent = initStream<Array<ChangeRecord<number>>>();
  let value: ReadonlyArray<V> = initialValue;
  let disposed = false;

  const set = (replacement: Array<V> | ReadonlyArray<V>) => {
    const diff = compareArrays<V>(value as Array<V>, replacement as Array<V>, eq);
    //console.log(`Rx.fromArray.set diff`, diff);
    //if (diff.length === 0) return;
    //diffEvent.set(diff);
    value = replacement;
    setEvent.set([ ...replacement ]);
  }

  const setAt = (index: number, v: V) => {
    (value as Array<V>)[ index ] = v;
    setEvent.set([ ...value ]);
  }

  const push = (v: V) => {
    value = [ ...value, v ];
    setEvent.set([ ...value ]);
    const cr: ChangeRecord<number> = [ `add`, value.length - 1, v ];
    arrayEvent.set([ cr ]);
  }

  const deleteAt = (index: number) => {
    const valueChanged = Arrays.remove(value, index);
    if (valueChanged.length === value.length) return; // no change
    const diff = compareArrays<V>(value as Array<V>, valueChanged, eq);
    //console.log(diff.summary);
    value = valueChanged;
    setEvent.set([ ...value ]);
    arrayEvent.set(diff.summary);
  }

  const deleteWhere = (filter: (value: V) => boolean) => {
    const valueChanged = value.filter(v => !filter(v));
    const count = value.length - valueChanged.length;
    const diff = compareArrays<V>(value as Array<V>, valueChanged, eq);
    value = valueChanged;
    setEvent.set([ ...value ]);
    arrayEvent.set(diff.summary);
    return count;
  }

  const insertAt = (index: number, v: V) => {
    const valueChanged = Arrays.insertAt(value, index, v);
    const diff = compareArrays<V>(value as Array<V>, valueChanged, eq);
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
