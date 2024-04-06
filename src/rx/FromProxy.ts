import { fromObject } from "./FromObject.js";
import { symbol, type ReactiveDiff, type ReactiveInitial } from "./Types.js";

export type ReactiveProxied<V> = V & {
  [ symbol ]: ReactiveDiff<V> & ReactiveInitial<V>
}
/**
 * Creates a proxy of `target`, so that regular property setting will be intercepted and output
 * on a {@link Reactive} object as well.
 * 
 * ```js
 * const { proxy, rx } = fromProxy({ colour: `red`, x: 10, y: 20 });
 * 
 * rx.value(v => {
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
 * The benefit of `fromProxy` instead of {@link fromObject} is because the proxied object can be passed to other code that doesn't need
 * to know anything about Reactive objects.
 * 
 * You can assign the return values to more meaningful names using
 * JS syntax.
 * ```js
 * const { proxy:colour, rx:colourRx } = fromProxy({ colour: `red` });
 * ```
 * 
 * See also:
 * * {@link fromProxySymbol}: Instead of {proxy,rx} return result, puts the `rx` under a symbol on the proxy.
 * @param target 
 * @returns 
 */
export const fromProxy = <V extends object>(target: V): { proxy: V, rx: ReactiveDiff<V> & ReactiveInitial<V> } => {
  const rx = fromObject(target);

  const proxy = new Proxy(target, {
    set(target, p, newValue, _receiver) {

      const isArray = Array.isArray(target);
      //console.log(`Rx.fromProxy set. Target: ${ JSON.stringify(target) } (${ typeof target } array: ${ Array.isArray(target) }) p: ${ JSON.stringify(p) } (${ typeof p }) newValue: ${ JSON.stringify(newValue) } recv: ${ _receiver }`);

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

/**
 * Same as {@link fromProxy}, but the return value is the proxied object along with 
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
 * This means of access can be useful as the return result is a bit neater, being a single object instead of two. 
 * @param target 
 * @returns 
 */
export const fromProxySymbol = <V extends object>(target: V): ReactiveProxied<V> => {
  const { proxy, rx } = fromProxy(target);

  const p = proxy as ReactiveProxied<V>;
  p[ symbol ] = rx;
  return p;
}