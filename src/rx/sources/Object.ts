/* eslint-disable @typescript-eslint/unbound-method */
import { DispatchList } from "../../flow/DispatchList.js";
import * as Immutable from "../../Immutable.js";
import { initStream } from "../InitStream.js";
import type { ReactiveDiff, ReactiveInitial, ReactiveNonInitial } from "../Types.js";
import type { ObjectOptions } from "./Types.js";

type ObjectFieldHandler = (value: any, fieldName: string) => void
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
 * o.on(value => {
 *  const changed = value.value;
 * });
 * o.set({ name: `mary`, level: 3 });
 * 
 * // `on` will get called, with `changed` having a value of:
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
  const eq = options.eq ?? Immutable.isEqualContextString;
  const setEvent = initStream<V>();
  const diffEvent = initStream<Array<Immutable.Change<any>>>();

  const fieldChangeEvents = new Map<string, DispatchList<ObjectFieldHandler>>;

  let value: V | undefined = initialValue;
  let disposed = false;

  const set = (v: V) => {
    if (value !== undefined) {
      const diff = Immutable.compareData(value, v, { ...options, includeMissingFromA: true });
      //console.log(`Rx.fromObject.set diff`, diff);
      if (diff.length === 0) return;
      diffEvent.set(diff);
    }
    value = v;
    setEvent.set(v);
  }

  const fireFieldUpdate = (field: string, value: any) => {
    const l = fieldChangeEvents.get(field.toLowerCase());
    if (l === undefined) return;
    l.notify(value);
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
      const diff = Immutable.compareData(value, toMerge);
      const diffWithoutRemoved = diff.filter(d => d.state !== `removed`);
      if (diffWithoutRemoved.length === 0) return value; // No changes
      value = {
        ...value,
        ...toMerge
      }
      //console.log(`diff: ${ JSON.stringify(diff) }`);
      diffEvent.set(diff);
      setEvent.set(value);
      for (const d of diffWithoutRemoved) {
        fireFieldUpdate(d.path, d.value);
      }
      return value;
    }
  }

  const updateField = (path: string, valueForField: any) => {
    if (value === undefined) throw new Error(`Cannot update value when it has not already been set`);
    //console.log(`Rx.fromObject.updateField path: ${ path } value: ${ JSON.stringify(valueForField) }`);

    const existing = Immutable.getField<any>(value, path);
    //console.log(`Rx.fromObject.updateField path: ${ path } existing: ${ JSON.stringify(existing) }`);
    if (eq(existing, valueForField, path)) {
      //console.log(`Rx.object.updateField identical existing: ${ existing } value: ${ valueForField } path: ${ path }`);
      return;
    }
    let diff = Immutable.compareData(existing, valueForField, { ...options, includeMissingFromA: true });
    diff = diff.map(d => {
      if (d.path.length > 0) return { ...d, path: path + `.` + d.path };
      return { ...d, path };
    })

    //console.log(`Rx.fromObject.updateField diff path: ${ path }`, diff);
    const o = Immutable.updateByPath(value, path, valueForField, true);
    value = o;
    //diffEvent.set([ { path, value: valueForField, previous: existing } ]);

    diffEvent.set(diff);
    setEvent.set(o);
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
    onDiff: diffEvent.on,
    onField(fieldName: string, handler: (value: any, fieldName: string) => void) {
      let listeners = fieldChangeEvents.get(fieldName.toLowerCase());
      if (listeners === undefined) {
        listeners = new DispatchList();
        fieldChangeEvents.set(fieldName.toLowerCase(), listeners);
      }
      const id = listeners.add((value) => {
        setTimeout(() => { handler(value, fieldName) }, 1);
      });
      return () => listeners.remove(id);
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
