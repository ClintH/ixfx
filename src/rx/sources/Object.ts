/* eslint-disable @typescript-eslint/unbound-method */
import { DispatchList } from "../../flow/DispatchList.js";
import * as Pathed from "../../data/Pathed.js";
import { initStream } from "../InitStream.js";
import type { ObjectFieldHandler, ReactiveDiff, ReactiveInitial, ReactiveNonInitial } from "../Types.js";
import type { ObjectOptions } from "./Types.js";
import { isEqualContextString } from "../../data/Util.js";
import { throwResult } from "../../util/Results.js";
import { wildcard } from "../../Text.js";

//type ObjectFieldHandler = (value: any, fieldName: string) => void

export function object<V extends Record<string, any>>(initialValue: V, options?: Partial<ObjectOptions<V>>): ReactiveDiff<V> & ReactiveInitial<V>;
export function object<V extends Record<string, any>>(initialValue: undefined, options?: Partial<ObjectOptions<V>>): ReactiveDiff<V> & ReactiveNonInitial<V>;


/**
 * Creates a Reactive wrapper with the shape of the input object.
 * 
 * Changing the wrapped object directly does not update the Reactive. 
 * Instead, to update values use:
 * * `set()`, 'resets' the whole object
 * * `update()` changes a particular field
 * 
 * Consider using {@link Rx.From.objectProxy} to return a object with properties that can be
 * set in the usual way yet is also Reactive.
 * 
 * ```js
 * const o = Rx.From.object({ name: `bob`, level: 2 });
 * o.onValue(changed => {
 * });
 * o.set({ name: `mary`, level: 3 });
 * 
 * // `onValue` will get called, with `changed` having a value of:
 * // { name: `mary`, level: 3 }
 * ```
 * 
 * Use `last()` to get the most recently set value.
 * 
 * `onDiff` subscribes to a rough diff of the object.
 * 
 * ```js
 * const o = Rx.From.object({ name: `bob`, level: 2 });
 * o.onDiff(diffValue => {
 *  const diff = diffValue.value;
 * })
 * o.set({ name: `mary`, level: 3 });
 * 
 * // onDiff would fire with `diff` of:
 * [
 *  { path: `name`, previous: `bob`, value: `mary` },
 *  { path: `level`, previous: 2, value: 3 }
 * ]
 * ```
 * 
 * You can also listen to updates on a field via `onField`.
 * ```js
 * o.onField(`name`, value => {
 *  // Called whenever the 'name' field is updated
 * });
 * ```
 * @param initialValue  Initial value
 * @param options Options
 * @returns 
 */
export function object<V extends Record<string, any>>(initialValue?: V, options: Partial<ObjectOptions<V>> = {}): ReactiveDiff<V> & (ReactiveInitial<V> | ReactiveNonInitial<V>) {
  const eq = options.eq ?? isEqualContextString;
  const setEvent = initStream<V>();
  const diffEvent = initStream<Array<Pathed.PathDataChange<any>>>();

  //const fieldChangeEvents = new Map<string, DispatchList<ObjectFieldHandler>>;
  const fieldChangeEvents: Array<[ matcher: (value: string) => boolean, pattern: string, DispatchList<ObjectFieldHandler> ]> = [];

  let value: V | undefined = initialValue;
  let disposed = false;

  const set = (v: V) => {
    const diff = [ ...Pathed.compareData(value ?? {} as V, v, { ...options, includeMissingFromA: true }) ];
    if (diff.length === 0) return;
    value = v;
    setEvent.set(v);
    diffEvent.set(diff);
  }

  const fireFieldUpdate = (field: string, value: any) => {
    for (const [ matcher, pattern, list ] of fieldChangeEvents) {
      if (matcher(field)) {
        list.notify({ fieldName: field, pattern, value });
      }
    }
    //const l = fieldChangeEvents.get(field.toLowerCase());
    //if (l === undefined) return;
    //l.notify(value);
  }

  const updateCompareOptions: Partial<Pathed.CompareDataOptions<V>> = {
    asPartial: true,
    includeParents: true
  }

  const update = (toMerge: Partial<V>) => {
    //console.log(`Rx.From.object update: toMerge: ${ JSON.stringify(toMerge) } value: ${ JSON.stringify(value) }`);
    // eslint-disable-next-line unicorn/prefer-ternary
    if (value === undefined) {
      value = toMerge as V;
      setEvent.set(value);
      for (const [ k, v ] of Object.entries(toMerge as V)) {
        fireFieldUpdate(k, v);
      }
      return value;
    } else {
      const diff = [ ...Pathed.compareData(value, toMerge, updateCompareOptions) ];
      //const diffWithoutRemoved = diff.filter(d => d.state !== `removed`);
      if (diff.length === 0) return value; // No changes
      value = {
        ...value,
        ...toMerge
      }
      setEvent.set(value);
      diffEvent.set(diff);
      //console.log(`diff`, diff);
      for (const d of diff) {
        fireFieldUpdate(d.path, d.value);
      }
      return value;
    }
  }

  const updateField = (path: string, valueForField: any) => {
    if (value === undefined) throw new Error(`Cannot update value when it has not already been set`);
    //console.log(`Rx.fromObject.updateField path: ${ path } value: ${ JSON.stringify(valueForField) }`);

    const existing = Pathed.getField<any>(value, path);
    throwResult(existing); // Eg if path not found

    //console.log(`Rx.fromObject.updateField path: ${ path } existing: ${ JSON.stringify(existing) }`);
    if (eq(existing.value, valueForField, path)) {
      //console.log(`Rx.object.updateField identical existing: ${ existing } value: ${ valueForField } path: ${ path }`);
      return;
    }
    let diff = [ ...Pathed.compareData(existing.value, valueForField, { ...options, includeMissingFromA: true }) ];
    diff = diff.map(d => {
      if (d.path.length > 0) return { ...d, path: path + `.` + d.path };
      return { ...d, path };
    })

    //console.log(`Rx.fromObject.updateField diff path: ${ path }`, diff);
    const o = Pathed.updateByPath(value, path, valueForField, true);
    value = o;
    //diffEvent.set([ { path, value: valueForField, previous: existing } ]);

    setEvent.set(o);
    diffEvent.set(diff);
    fireFieldUpdate(path, valueForField);
    //console.log(`Rx.fromObject.updateField: path: '${ path }' value: '${ JSON.stringify(valueForField) }' o: ${ JSON.stringify(o) }`);
  }

  const dispose = (reason: string) => {
    if (disposed) return;
    diffEvent.dispose(reason);
    setEvent.dispose(reason);
    disposed = true;
  }

  return {
    dispose,
    isDisposed() {
      return disposed
    },
    /**
     * Update a field.
     * Exception is thrown if field does not exist
     */
    updateField,
    last: () => value,
    on: setEvent.on,
    onValue: setEvent.onValue,
    onDiff: diffEvent.onValue,
    onField(fieldPattern: string, handler: (result: ObjectFieldHandler) => void) {
      const matcher = wildcard(fieldPattern);
      const listeners = new DispatchList<ObjectFieldHandler>();
      fieldChangeEvents.push([ matcher, fieldPattern, listeners ]);
      const id = listeners.add(handler);
      return () => listeners.remove(id);
      // let listeners = fieldChangeEvents.get(fieldName.toLowerCase());
      // if (listeners === undefined) {
      //   listeners = new DispatchList();
      //   fieldChangeEvents.set(fieldName.toLowerCase(), listeners);
      // }
      // const id = listeners.add((value) => {
      //   setTimeout(() => { handler(value, fieldName) }, 1);
      // });
      // return () => listeners.remove(id);
    },
    /**
     * Set the whole object
     */
    set,
    /**
     * Update the object with a partial set of fields and values
     */
    update
  }
}
