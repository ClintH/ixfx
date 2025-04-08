//import { query as DomQuery } from "../../dom/Query.js";

import type { GenOrData, Link } from "./Types.js";
import { resolveToGen } from "./Util.js";
import { resolveEl } from "../../dom/ResolveEl.js";
import { toStringDefault } from "../../util/index.js";

export type QueryOptions = {
  baseElement: HTMLElement;
}

export type CreateOptions<In> = {
  /**
   * Parent element to create elements in. Defaults to `document.body`.
   */
  parentEl: string | HTMLElement
  /**
   * When set, provide a custom function to return a unique key for a value.
   * This is used for matching values with elements when using immutable data.
   * 
   * By default uses the
   * JSON.stringify() representation.
   * 
   * To match elements with values by reference, set `byReference` instead.
   * 
   * @param value 
   * @returns 
   */
  key: (value: In) => string
  /**
   * Default: _false_. When _true_, associate created elements
   * to values by reference rather than value. This can be useful with mutable values.
   * 
   * Use this _or_ the `key` option.
   */
  byReference: boolean
  /**
   * What kind of HTML element to make, defaults to DIV
   */
  tagName: string
  /**
   * Called whenever an element is created but not yet added to parent element
   * @param element 
   * @returns 
   */
  beforeInsert: (element: HTMLElement) => void
  /**
   * Called after an element is inserted to the parent element
   */
  afterInsert: (element: HTMLElement) => void
  /**
   * Called after an element has been removed
   * @param element 
   * @returns 
   */
  beforeRemove: (element: HTMLElement) => void
}

const createMap = <T, TValue>(key?: (value: T) => string) => {
  const keyFunction = key ?? ((value: T) => value);

  const map = new Map<ReturnType<typeof keyFunction>, TValue>();
  return {
    has(key: T) {
      return map.has(keyFunction(key));
    },
    get(key: T) {
      return map.get(keyFunction(key));
    },
    set(key: T, value: TValue) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      //console.log(`Chains.Dom.createMap: key: ${ keyFunction(key) } value: ${ value }`);
      map.set(keyFunction(key), value);
    },
    entries() {
      return map.entries();
    },
    delete(key: T | string) {
      map.delete(key);
    }
  }

}

export type ElementWithValue<T> = {
  el: HTMLElement
  value: T
}

/**
 * Creates a HTML element per value. By default compares
 * values by `JSON.stringify`. Set `byReference:true` to
 * compare values based on reference. Or provide a toString
 * function via `key`.
 * 
 * ```js
 * // Generate a random number between 0...4 every second
 * const looper = Generators.interval(() => Math.floor(Math.random()*5), 1000);
 * 
 * // Make a chain
 * const ch = Chains.run(
 *  looper,
 *  Chains.Links.delay({before:1000}),
 *  Chains.Dom.perValue()
 * );
 *
 * setTimeout(async () => {
 *    for await (const v of ch) {
 *      const {el,value} = v;
 *      el.textContent = `${value} - ${Date.now().toString()}`;
 *    }
 *    console.log(`ch iteration done`);
 *  });
 * ```
 */
export function perValue<In>(options: Partial<CreateOptions<In>> = {}): Link<In, ElementWithValue<In>> {
  const byReference = options.byReference;
  const tagName = options.tagName ?? `div`;
  if (byReference && options.key) throw new Error(`byReference and key options are mutually exclusive`);
  const keyFunction = byReference ? undefined : options.key ?? toStringDefault;
  const map = createMap<In, HTMLElement>(keyFunction);
  const parentElementOrQuery = options.parentEl ?? document.body;
  const parentEl = resolveEl(parentElementOrQuery);

  const usedElements = new Set<HTMLElement>();

  async function* perValue(input: GenOrData<In>): AsyncGenerator<ElementWithValue<In>> {
    for await (const value of resolveToGen(input)) {
      let el = map.get(value);
      if (!el) {
        el = document.createElement(tagName);
        map.set(value, el);
        if (options.beforeInsert) options.beforeInsert(el);
        parentEl.append(el);
        if (options.afterInsert) options.afterInsert(el);
      }
      usedElements.add(el);
      yield { el, value };
    }

    // Remove unused elements
    for (const [ id, el ] of map.entries()) {
      if (usedElements.has(el)) continue;
      if (options.beforeRemove) options.beforeRemove(el);
      el.remove();
      map.delete(id);
    }
  }
  perValue._name = `dom.perValue`;
  return perValue;
}

//export type Link<In, Out> = (input: GenOrData<In>) => AsyncGenerator<Out>;

/**
 * From an input stream of strings, yields an output of HTMLElememnts
 * @param options 
 * @returns 
 */
export function query(options: Partial<QueryOptions> = {}): Link<string, HTMLElement> {
  const baseElement = options.baseElement ?? document;

  async function* query(input: GenOrData<string>): AsyncGenerator<HTMLElement> {
    const gen = resolveToGen(input);
    for await (const value of gen) {
      for (const element of baseElement.querySelectorAll(value)) {
        yield element as HTMLElement;
      }
    }
  }
  query._name = `dom.query`;
  return query;
}

