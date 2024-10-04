import { object } from "./Object.js";
import { symbol, type ReactiveArray, type ReactiveDiff, type ReactiveInitial } from "../Types.js";
import { array } from "./Array.js";
import { arrayObject } from "./ArrayObject.js";

export type ReactiveProxied<V> = V & {
  [ symbol ]: ReactiveDiff<V> & ReactiveInitial<V>
}
/**
 * Creates a proxy of `target` object (or array), so that regular property setting will be intercepted and output
 * on a {@link Reactive} object as well.
 * 
 * ```js
 * const { proxy, rx } = Rx.From.objectProxy({ colour: `red`, x: 10, y: 20 });
 * 
 * rx.onValue(v => {
 *  // Get notified when proxy is changed
 * });
 * 
 * // Get and set properties as usual
 * console.log(proxy.x);
 * proxy.x = 20; // Triggers Reactive
 * ```
 * 
 * Keep in mind that changing `target` directly won't affect the proxied object or Reactive. Thus,
 * only update the proxied object after calling `fromProxy`.
 * 
 * The benefit of `objectProxy` instead of {@link Rx.From.object} is because the proxied object can be passed to other code that doesn't need
 * to know anything about Reactive objects.
 * 
 * You can assign the return values to more meaningful names using
 * JS syntax.
 * ```js
 * const { proxy:colour, rx:colourRx } = Rx.From.objectProxy({ colour: `red` });
 * ```
 * 
 * If `target` is an array, it's not possible to change the shape of the array by adding or removing
 * elements, only by updating existing ones. This follows the same behaviour of objects. Alternatively, use {@link arrayProxy}.
 * 
 * See also:
 * * {@link objectProxySymbol}: Instead of {proxy,rx} return result, puts the `rx` under a symbol on the proxy.
 * * {@link arrayProxy}: Proxy an array, allowing inserts and deletes.
 * @param target 
 * @returns 
 */
export const objectProxy = <V extends object>(target: V): { proxy: V, rx: ReactiveDiff<V> & ReactiveInitial<V> } => {

  const rx = object(target);

  const proxy = new Proxy(target, {
    set(target, p, newValue, _receiver) {

      const isArray = Array.isArray(target);
      console.log(`Rx.Sources.object set. Target: ${ JSON.stringify(target) } (${ typeof target } array: ${ Array.isArray(target) }) p: ${ JSON.stringify(p) } (${ typeof p }) newValue: ${ JSON.stringify(newValue) } recv: ${ _receiver }`);

      // Ignore length if target is array
      if (isArray && p === `length`) return true;

      if (typeof p === `string`) {
        rx.updateField(p, newValue);
      }

      // If target is array and field looks like an array index...
      if (isArray && typeof p === `string`) {
        const pAsNumber = Number.parseInt(p);
        if (!Number.isNaN(pAsNumber)) {
          target[ pAsNumber ] = newValue;
          return true;
        }
      }
      (target as any)[ p ] = newValue;
      return true;
    }
  });
  return { proxy, rx }
}

export const arrayProxy = <V, T extends Array<V>>(target: T): { proxy: T, rx: ReactiveArray<V> & ReactiveInitial<ReadonlyArray<V>> } => {
  const rx = arrayObject(target);
  const proxy = new Proxy(target, {
    set(target, p, newValue, _receiver) {

      //console.log(`Rx.Sources.arrayProxy set. Target: ${ JSON.stringify(target) } (${ typeof target } array: ${ Array.isArray(target) }) p: ${ JSON.stringify(p) } (${ typeof p }) newValue: ${ JSON.stringify(newValue) } recv: ${ _receiver }`);

      // Ignore length if target is array
      if (p === `length`) return true;
      if (typeof p !== `string`) throw new Error(`Expected numeric index, got type: ${ typeof p } value: ${ JSON.stringify(p) }`);
      const pAsNumber = Number.parseInt(p);
      if (!Number.isNaN(pAsNumber)) {
        rx.setAt(pAsNumber, newValue);
        target[ pAsNumber ] = newValue;

        return true;
      } else {
        throw new Error(`Expected numeric index, got: '${ p }'`);
      }
    }
  });
  return { proxy, rx }
}

/**
 * Same as {@link proxy}, but the return value is the proxied object along with 
 * the Reactive wrapped as symbol property.
 * 
 * ```js
 * const person = Rx.fromProxySymbol({name: `marie` });
 * person.name = `blah`;
 * person[Rx.symbol].on(msg => {
 *  // Value changed...
 * });
 * ```
 * 
 * This means of access can be useful as the return result
 * is a bit neater, being a single object instead of two. 
 * @param target 
 * @returns 
 */
export const objectProxySymbol = <V extends object>(target: V): ReactiveProxied<V> => {
  const { proxy, rx } = objectProxy(target);

  const p = proxy as ReactiveProxied<V>;
  p[ symbol ] = rx;
  return p;
}