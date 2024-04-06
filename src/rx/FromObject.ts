import { Immutable } from "../index.js";
import { initStream } from "./InitStream.js";
import type { ObjectOptions, ReactiveDiff, ReactiveInitial, ReactiveNonInitial, ReactiveDisposable } from "./Types.js";

export function fromObject<V extends Record<string, any>>(initialValue: V, options?: Partial<ObjectOptions<V>>): ReactiveDiff<V> & ReactiveInitial<V>;

export function fromObject<V extends Record<string, any>>(initialValue: undefined, options?: Partial<ObjectOptions<V>>): ReactiveDiff<V> & ReactiveNonInitial<V>;


/**
 * Creates a Reactive wrapper with the shape of the input object.
 * 
 * Changing the wrapped object directly does not update the Reactive. 
 * Instead, to update values use:
 * * `set()`, 'resets' the whole object
 * * `update()` changes a particular field
 * 
 * Consider using {@link fromProxy} to return a object with properties that can be
 * set in the usual way yet is also Reactive.
 * 
 * ```js
 * const o = fromObject({ name: `bob`, level: 2 });
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
 * const o = fromObject({ name: `bob`, level: 2 });
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
 * @param initialValue  Initial value
 * @param options Options
 * @returns 
 */
export function fromObject<V extends Record<string, any>>(initialValue?: V, options: Partial<ObjectOptions<V>> = {}): ReactiveDisposable & ReactiveDiff<V> & (ReactiveInitial<V> | ReactiveNonInitial<V>) {
  const eq = options.eq ?? Immutable.isEqualContextString;
  const setEvent = initStream<V>();
  const diffEvent = initStream<Array<Immutable.Change<any>>>();

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

  const update = (toMerge: Partial<V>) => {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (value === undefined) {
      value = toMerge as V;
    } else {
      const diff = Immutable.compareData(toMerge, value);
      // console.log(`Rx.fromObject.update value: ${ JSON.stringify(value) }`);
      // console.log(`Rx.fromObject.update  diff: ${ JSON.stringify(diff) }`);
      if (diff.length === 0) return; // No changes
      value = {
        ...value,
        ...toMerge
      }
      diffEvent.set(diff);
    }
    setEvent.set(value);
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
    value: setEvent.value,
    onDiff: diffEvent.on,
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
