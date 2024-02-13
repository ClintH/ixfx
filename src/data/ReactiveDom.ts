import { resolveEl } from "../dom/Util.js";
import * as Rx from "./Reactive.js";
import type { Change } from "../Immutable.js";

export type DomBindOptions<V> = {
  /**
   * If set, this DOM element field is set. Eg 'textContent'
   */
  elField: string
  /**
   * If set, this DOM attribute is set, Eg 'width'
   */
  attribName: string
  /**
   * If set, this CSS variable is set, Eg 'hue' (sets '--hue')
   */
  cssVariable: string
  /**
   * Field from source value to pluck and use.
   * This will also be the value passed to the transform
   */
  sourceField: keyof V
  transform: (input: V) => string
}

export type DomCreateOptions = {
  tagName: string
  parentEl: string | HTMLElement
}

export type PipeDomBinding = {
  /**
   * Remove binding and optionally delete element (false by default)
   */
  remove(deleteElement: boolean): void

  get el(): HTMLElement
}
/**
 * Updates an element's `textContent` when the source value changes
 * ```js
 * bindTextContent(`#blah`, source);
 * // Use function to get text value from source value
 * bindTextContent(myEl, source, v => v.name);
 * ```
 * 
 * Uses {@link bind}, with `{field:'textContent'}` as the options
 * @param elOrQuery 
 * @param source 
 * @param transformer 
 */
export const bindTextContent = <V>(elOrQuery: string | HTMLElement, source: Rx.Reactive<V>, bindOpts: Partial<DomBindOptions<V>> = {}) => {
  return bind(elOrQuery, source, { ...bindOpts, elField: `textContent` });
}

/**
 * Shortcut to bind to innerHTML
 * @param elOrQuery
 * @param source 
 * @param bindOpts 
 * @returns 
 */
export const bindHtmlContent = <V>(elOrQuery: string | HTMLElement, source: Rx.Reactive<V>, bindOpts: Partial<DomBindOptions<V>> = {}) => {
  return bind(elOrQuery, source, { ...bindOpts, elField: `innerHTML` });
}

/**
 * Shortcut to bind to an elements attribute
 * @param elOrQuery
 * @param source 
 * @param attribute 
 * @param bindOpts 
 * @returns 
 */
export const bindAttribute = <V>(elOrQuery: string | HTMLElement, source: Rx.Reactive<V>, attribute: string, bindOpts: Partial<DomBindOptions<V>> = {}) => {
  return bind(elOrQuery, source, { ...bindOpts, attribName: attribute });
}

/**
 * Shortcut to bind to a CSS variable
 * @param elOrQuery
 * @param source 
 * @param cssVariable 
 * @param bindOpts 
 * @returns 
 */
export const bindCssVariable = <V>(elOrQuery: string | HTMLElement, source: Rx.Reactive<V>, cssVariable: string, bindOpts: Partial<DomBindOptions<V>> = {}) => {
  return bind(elOrQuery, source, { ...bindOpts, cssVariable: cssVariable });
}

/**
 * Creates a new HTML element, calling {@link bind} on it to update when `source` emits new values.
 * 
 * 
 * ```js
 * // Set textContent of a SPAN with values from `source`
 * create(source, { tagName: `span`, parentEl: document.body })
 * ```
 * 
 * If `parentEl` is not given in the options, the created element needs to be manually added
 * ```js
 * const b = create(source);
 * someEl.append(b.el); // Append manually
 * ```
 * 
 * ```
 * // Set 'title' attribute based on values from `source`
 * create(source, { parentEl: document.body, attribName: `title` })
 * ```
 * @param source 
 * @param options 
 * @returns 
 */
export const create = <V>(source: Rx.Reactive<V>, options: Partial<DomCreateOptions> & Partial<DomBindOptions<V>> = {}): PipeDomBinding => {
  const nodeType = options.tagName ?? `DIV`;

  const el = document.createElement(nodeType);
  const b = bind(el, source, options);

  if (options.parentEl) {
    const parentElementOrQuery = resolveEl(options.parentEl);
    if (parentElementOrQuery === undefined) throw new Error(`Parent element could not be resolved`);
    parentElementOrQuery.append(el);
  }
  return b;
}

/**
 * Update a DOM element's field, attribute or CSS variable when `source` produces a value.
 * 
 * ```js
 * // Access via DOM query. Binds to 'textContent' by default
 * bind(`#someEl`, readableSource);
 * 
 * // Set innerHTML instead
 * bind(someEl, readableSource, { elField: `innerHTML` });
 * 
 * // An attribute
 * bind(someEl, readableSource, { attribName: `width` });
 * 
 * // A css variable ('--' optiona)
 * bind(someEl, readableSource, { cssVariable: `hue` });
 * 
 * // Pluck a particular field from source data.
 * // Ie someEl.textContent = value.colour
 * bind(someEl, readableSource, { sourceField: `colour` });
 * 
 * // Transform value before setting it to field
 * bind(someEl, readableSource, { 
 *  field: `innerHTML`, 
 *  transform: (v) => `Colour: ${v.colour}`
 * })
 * ```
 * 
 * If `source` has an initial value, this is used when first bound.
 * 
 * Returns a {@link PipeDomBinding} to control binding
 * ```js
 * const bind = bind(`#someEl`, source);
 * bind.unbind(); // 
 * ```
 * 
 * If several fields need to be updated based on a new value, consider using {@link bindUpdate} instead.
 * @param elOrQuery 
 * @param source 
 * @param bindOpts 
 */
export const bind = <V>(elOrQuery: string | HTMLElement, source: Rx.Reactive<V>, bindOpts: Partial<DomBindOptions<V>> = {}): PipeDomBinding => {
  const el = resolveEl(elOrQuery);
  const sourceField = bindOpts.sourceField;

  const transformer = bindOpts.transform ?? ((v: V) => {
    if (typeof v === `object`) return JSON.stringify(v);
    return v as string;
  })

  let update = (_: any) => { /* no-op */ }

  if (bindOpts.elField !== undefined || (bindOpts.cssVariable === undefined && bindOpts.attribName === undefined)) {
    const field = bindOpts.elField ?? `textContent`;
    update = (v: any) => {
      (el as any)[ field ] = v;
    }
  }
  if (bindOpts.attribName !== undefined) {
    const attrib = bindOpts.attribName;
    update = (v: any) => {
      el.setAttribute(attrib, v);
    }
  }
  if (bindOpts.cssVariable !== undefined) {
    let css = bindOpts.cssVariable;
    if (!css.startsWith(`--`)) css = `--` + css;
    update = (v: any) => {
      el.style.setProperty(css, v);
    }
  }

  const unsub = source.on(message => {
    if (Rx.messageHasValue(message)) {
      if (sourceField) update(transformer((message.value as any)[ sourceField ]));
      else update(transformer(message.value));
    } else if (Rx.messageIsSignal(message)) {
      console.warn(message);
    }
  });

  if (Rx.hasLast(source)) {
    update(source.last());
  }

  return {
    remove: (removeElement: boolean) => {
      unsub();
      if (removeElement) {
        el.remove();
      }
    },
    el
  }
}

/**
 * Calls `updater` whenever `source` produces a value. Useful when several fields from a value
 * are needed to update an element.
 * ```js
 * bindUpdate(`#someEl`, source, (v, el) => {
 *  el.setAttribute(`width`, v.width);
 *  el.setAttribute(`height`, v.height);
 * });
 * ```
 * 
 * Returns a {@link PipeDomBinding} to manage binding
 * ```js
 * const b = bindUpdate(...);
 * b.remove();     // Disconnect binding
 * b.remove(true); // Disconnect binding and remove element
 * b.el;           // HTML element
 * ```
 * @param elOrQuery 
 * @param source 
 * @param updater 
 * @returns 
 */
export const bindUpdate = <V>(elOrQuery: string | HTMLElement, source: Rx.Reactive<V>, updater: (v: V, el: HTMLElement) => void): PipeDomBinding => {
  const el = resolveEl(elOrQuery);

  const update = (value: V) => {
    updater(value, el);
  }

  const unsub = source.on(message => {
    if (Rx.messageHasValue(message)) {
      console.log(message);
      update(message.value);
    } else {
      console.warn(message);
    }
  });

  if (Rx.hasLast(source)) {
    update(source.last());
  }

  return {
    remove: (removeElement: boolean) => {
      unsub();
      if (removeElement) {
        el.remove();
      }
    },
    el
  }
}

export type BindUpdateOpts<V> = {
  initial: (v: V, el: HTMLElement) => void
}

/**
 * Updates a HTML element based on diffs on an object.
 * ```js
 * // Wrap an object
 * const o = Rx.object({ name: `Jane`, ticks: 0 });
 * const b = bindDiffUpdate(`#test`, o, (diffs, el) => {
 *  // el = reference to #test
 * // diff = Array of Changes, 
 * //  eg [ { path: `ticks`, value: 797, previous: 0 } ]
 *  for (const diff of diffs) {
 *    if (diff.path === `ticks`) el.textContent = `${diff.previous} -> ${diff.value}`
 *  }
 * })
 * 
 * // Eg. update field
 * o.updateField(`ticks`, Math.floor(Math.random()*1000));
 * ```
 * 
 * If `initial` is provided as an option, this will be called if `source` has an initial value. Without this, the DOM won't be updated until the first data
 * update happens.
 * ```js
 * bindDiffUpdate(el, source, updater, { 
 *  initial: (v, el) => {
 *    el.innerHTML = v.name;
 *  }
 * })
 * ```
 * @param elOrQuery 
 * @param source 
 * @param updater 
 * @param opts 
 * @returns 
 */
export const bindDiffUpdate = <V>(
  elOrQuery: string | HTMLElement,
  source: Rx.ReactiveDiff<V>,
  updater: (diffs: Array<Change<any>>, el: HTMLElement) => void,
  opts: Partial<BindUpdateOpts<V>> = {}
): PipeDomBinding & { refresh: () => void } => {
  const el = resolveEl(elOrQuery);

  const update = (value: Array<Change<any>>) => {
    updater(value, el);
  }

  const unsub = source.onDiff(message => {
    if (Rx.messageHasValue(message)) {
      update(message.value);
    } else {
      console.warn(message);
    }
  });

  const init = () => {
    if (Rx.hasLast(source) && opts.initial) opts.initial(source.last(), el);
  }

  init();

  return {
    refresh: () => {
      init();
    },
    remove: (removeElement: boolean) => {
      unsub();
      if (removeElement) {
        el.remove();
      }
    },
    el
  }
}
/**
 * Creates a new HTML element and calls `bindUpdate` so values from `source` can be used
 * to update it.
 * 
 * 
 * ```js
 * // Creates a span, adding it to <body>
 * const b = createUpdate(dataSource, (value, el) => {
 *  el.width = value.width;
 *  el.height = value.height;
 * }, { 
 *  tagName: `SPAN`,
 *  parentEl: document.body
 * })
 * ```
 * @param source 
 * @param updater 
 * @param options 
 * @returns 
 */
export const createUpdate = <V>(source: Rx.Reactive<V>, updater: (v: V, el: HTMLElement) => void, options: Partial<DomCreateOptions> = {}): PipeDomBinding => {
  const tag = options.tagName ?? `DIV`;
  const el = document.createElement(tag);
  if (options.parentEl) {
    const parent = resolveEl(options.parentEl);
    parent.append(el);
  }
  const b = bindUpdate(el, source, updater);
  return b;
}

export function win() {
  const generateRect = () => ({ width: window.innerWidth, height: window.innerHeight });

  const size = Rx.event(window, `resize`, {
    lazy: true,
    process: () => generateRect(),
  });
  const pointer = Rx.event(window, `pointermove`, {
    lazy: true,
    process: (args: Event | undefined) => {
      if (args === undefined) return { x: 0, y: 0 };
      const pe = args as PointerEvent;
      return { x: pe.x, y: pe.y }
    }
  });
  const dispose = (reason = `Reactive.win.dispose`) => {
    size.dispose(reason);
    pointer.dispose(reason);
  }
  return { dispose, size, pointer };
}
