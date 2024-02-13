import { resolveEl } from "../dom/Util.js";
import { isReadableValue, type IReadable } from "./Pipe.js";

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
export const bindTextContent = <V>(elOrQuery: string | HTMLElement, source: IReadable<V>, bindOpts: Partial<DomBindOptions<V>> = {}) => {
  return bind(elOrQuery, source, { ...bindOpts, elField: `textContent` });
}

/**
 * Shortcut to bind to innerHTML
 * @param elOrQuery
 * @param source 
 * @param bindOpts 
 * @returns 
 */
export const bindHtmlContent = <V>(elOrQuery: string | HTMLElement, source: IReadable<V>, bindOpts: Partial<DomBindOptions<V>> = {}) => {
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
export const bindAttribute = <V>(elOrQuery: string | HTMLElement, source: IReadable<V>, attribute: string, bindOpts: Partial<DomBindOptions<V>> = {}) => {
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
export const bindCssVariable = <V>(elOrQuery: string | HTMLElement, source: IReadable<V>, cssVariable: string, bindOpts: Partial<DomBindOptions<V>> = {}) => {
  return bind(elOrQuery, source, { ...bindOpts, cssVariable: cssVariable });
}

export const create = <V>(source: IReadable<V>, options: Partial<DomCreateOptions> & Partial<DomBindOptions<V>> = {}): PipeDomBinding => {
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
 * Update a DOM element's field, attribute or CSS variable when source produces a value.
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
 * If the source is a {@link IReadableValue}, its value is used to set the initial state.
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
export const bind = <V>(elOrQuery: string | HTMLElement, source: IReadable<V>, bindOpts: Partial<DomBindOptions<V>> = {}): PipeDomBinding => {
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

  const sub = source.on.value(v => {
    if (sourceField) update(transformer((v as any)[ sourceField ]));
    else update(transformer(v));
  });

  if (isReadableValue(source)) {
    update(source.value);
  }

  return {
    remove: (removeElement: boolean) => {
      sub.off();
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
export const bindUpdate = <V>(elOrQuery: string | HTMLElement, source: IReadable<V>, updater: (v: V, el: HTMLElement) => void): PipeDomBinding => {
  const el = resolveEl(elOrQuery);

  const update = (v: V) => {
    updater(v, el);
  }

  const sub = source.on.value(update);

  if (isReadableValue(source)) {
    update(source.value);
  }

  return {
    remove: (removeElement: boolean) => {
      sub.off();
      if (removeElement) {
        el.remove();
      }
    },
    el
  }
}


export const createUpdate = <V>(source: IReadable<V>, updater: (v: V, el: HTMLElement) => void, options: Partial<DomCreateOptions> = {}): PipeDomBinding => {
  const tag = options.tagName ?? `DIV`;
  const el = document.createElement(tag);
  if (options.parentEl) {
    const parent = resolveEl(options.parentEl);
    parent.append(el);
  }
  const b = bindUpdate(el, source, updater);
  return b;
}