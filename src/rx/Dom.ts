import * as Immutable from "../Immutable.js";
import { resolveEl } from "../dom/ResolveEl.js";
import * as Rx from "./index.js";
import type { ElementsOptions, PipeDomBinding, BindUpdateOpts, DomBindResolvedSource, DomBindSourceValue, DomBindValueTarget, ElementBind } from './Types.js';
import { hasLast, messageHasValue, messageIsSignal } from "./Util.js";
import type { Change } from "../Immutable.js";
import { getFromKeys } from "../collections/map/MapFns.js";
import { afterMatch, beforeMatch } from "../Text.js";
import { stringSegmentsEndToEnd, stringSegmentsStartToEnd, stringSegmentsStartToStart } from "../generators/index.js";
import { QueueMutable } from "src/collections/index.js";

/**
 * Updates an element's `textContent` when the source value changes
 * ```js
 * bindText(source, `#blah`);
 * ```
 * 
 * Uses {@link bindElement}, with `{elField:'textContent'}` as the options
 * @param elOrQuery 
 * @param source 
 * @param bindOpts 
 */
export const bindText = <V>(source: Rx.Reactive<V>, elOrQuery: string | HTMLElement | null, bindOpts: Partial<Rx.DomBindSourceValue<V>> = {}) => {
  return bindElement(source, elOrQuery, { ...bindOpts, elField: `textContent` });
}

/**
 * Updates an element's `innerHTML` when the source value changes
 * ```js
 * bindHtml(source, `#blah`);
 * ```
 * 
 * Uses {@link bindElement}, with `{elField:'innerHTML'}` as the options.
 * @param elOrQuery
 * @param source 
 * @param bindOpts 
 * @returns 
 */
export const bindHtml = <V>(source: Rx.Reactive<V>, elOrQuery: string | HTMLElement | null, bindOpts: DomBindSourceValue<V> = {}) => {
  return bindElement(source, elOrQuery, { ...bindOpts, elField: `innerHTML` });
}


/**
 * Shortcut to bind to an elements attribute
 * @param elOrQuery
 * @param source 
 * @param attribute 
 * @param bindOpts 
 * @returns 
 */
// export const bindAttribute = <V>(elOrQuery: string | HTMLElement, source: Rx.Reactive<V>, attribute: string, bindOpts: Partial<DomBindOptions<V>> = {}) => {
//   return bind(elOrQuery, source, { ...bindOpts, attribName: attribute });
// }

/**
 * Shortcut to bind to a CSS variable
 * @param elOrQuery
 * @param source 
 * @param cssVariable 
 * @param bindOpts 
 * @returns 
 */
// export const bindCssVariable = <V>(elOrQuery: string | HTMLElement, source: Rx.Reactive<V>, cssVariable: string, bindOpts: Partial<DomBindOptions<V>> = {}) => {
//   return bind(elOrQuery, source, { ...bindOpts, cssVariable: cssVariable });
// }

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
// export const create = <V>(source: Rx.Reactive<V>, options: Partial<DomCreateOptions> & Partial<DomBindOptions<V>> = {}): PipeDomBinding => {
//   const nodeType = options.tagName ?? `DIV`;

//   const el = document.createElement(nodeType);
//   const b = bind(el, source, options);

//   if (options.parentEl) {
//     const parentElementOrQuery = resolveEl(options.parentEl);
//     if (parentElementOrQuery === undefined) throw new Error(`Parent element could not be resolved`);
//     parentElementOrQuery.append(el);
//   }
//   return b;
// }

/**
 * Update a DOM element's field, attribute or CSS variable when `source` produces a value.
 * 
 * ```js
 * // Access via DOM query. Binds to 'textContent' by default
 * bind(readableSource, `#someEl`);
 * 
 * // Set innerHTML instead
 * bind(readableSource, someEl, { elField: `innerHTML` });
 * 
 * // An attribute
 * bind(readableSource, someEl, { attribName: `width` });
 * 
 * // A css variable ('--' optiona)
 * bind(readableSource, someEl, { cssVariable: `hue` });
 * 
 * // Pluck a particular field from source data.
 * // Ie someEl.textContent = value.colour
 * bind(readableSource, someEl, { sourceField: `colour` });
 * 
 * // Transform value before setting it to field
 * bind(readableSource, someEl, { 
 *  field: `innerHTML`, 
 *  transform: (v) => `Colour: ${v.colour}`
 * })
 * ```
 * 
 * If `source` has an initial value, this is used when first bound.
 * 
 * Returns {@link PipeDomBinding} to control binding:
 * ```js
 * const bind = bind(source, `#someEl`);
 * bind.remove();     // Unbind
 * bind.remove(true); // Unbind and remove HTML element
 * ```
 * 
 * If several fields need to be updated based on a new value, consider using {@link bindUpdate} instead.
 * @param elOrQuery 
 * @param source 
 * @param bindOpts 
 */
export const bindElement = <V>(source: Rx.Reactive<V>, elOrQuery: string | HTMLElement | null, ...binds: Array<DomBindSourceValue<V> & Rx.DomBindValueTarget>): PipeDomBinding => {
  if (elOrQuery === null) throw new Error(`Param 'elOrQuery' is null`);
  if (elOrQuery === undefined) throw new Error(`Param 'elOrQuery' is undefined`);

  const el = resolveEl(elOrQuery);
  let b = [];
  if (binds.length === 0) {
    b.push({ elField: `textContent` });
  } else {
    b = [ ...binds ];
  }
  const bb = b.map(bind => {
    if (`element` in bind) return bind as DomBindResolvedSource<V>;
    return { ...bind, element: el } as DomBindResolvedSource<V>
  });
  return bind(source, ...bb);
}

const resolveBindUpdater = (bind: DomBindValueTarget, element: HTMLElement): (value: any) => void => {
  const b = resolveBindUpdaterBase(bind);
  return (value: any) => {
    b(value, element);
  }
}

const resolveBindUpdaterBase = (bind: DomBindValueTarget): (value: any, element: HTMLElement) => void => {
  if (bind.elField !== undefined || (bind.cssVariable === undefined && bind.attribName === undefined && bind.cssProperty === undefined && bind.textContent === undefined && bind.htmlContent === undefined)) {
    const field = bind.elField ?? `textContent`;
    return (v: any, element: HTMLElement) => {
      (element as any)[ field ] = v;
    }
  }
  if (bind.attribName !== undefined) {
    const attrib = bind.attribName;
    return (v: any, element: HTMLElement) => {
      element.setAttribute(attrib, v);
    }
  }
  if (bind.textContent) {
    return (v: any, element: HTMLElement) => {
      element.textContent = v;
    }
  }
  if (bind.htmlContent) {
    return (v: any, element: HTMLElement) => {
      element.innerHTML = v;
    }
  }
  if (bind.cssVariable !== undefined) {
    let css = bind.cssVariable;
    if (!css.startsWith(`--`)) css = `--` + css;
    return (v: any, element: HTMLElement) => {
      element.style.setProperty(css, v);
    }
  }
  if (bind.cssProperty !== undefined) {
    return (v: any, element: HTMLElement) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (element.style as any)[ bind.cssProperty! ] = v;
    }
  }
  return (_: any, _element: HTMLElement) => {
    /** no-op */
  }
}

const resolveTransform = <V>(bind: DomBindSourceValue<V>) => {
  if (!bind.transform && !bind.transformValue) return;
  if (bind.transformValue) {
    if (bind.sourceField === undefined) throw new Error(`Expects 'sourceField' to be set when 'transformValue' is set`);
    return (value: V) => {
      const fieldValue = (value as any)[ bind.sourceField ]
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return bind.transformValue!(fieldValue);
    }
  } else if (bind.transform) {
    if (bind.sourceField !== undefined) throw new Error(`If 'transform' is set, 'sourceField' is ignored`);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (value: V) => bind.transform!(value);
  }
}

/**
 * Binds `source` to one or more element(s). One or more bindings for the same source
 * can be provided.
 * 
 * ```js
 * bind(source, 
 *  // Binds .name field of source values to textContent of #some-element
 *  { query: `#some-element`, sourceField: `name` },
 *  { query: `section`, }
 * );
 * ```
 * 
 * Can update
 * * CSS variables
 * * CSS styles
 * * textContent / innerHTML
 * * HTML DOM attributes and object fields
 * 
 * Can use a particular field on source values, or use the whole value. These can
 * pass through `transformValue` or `transform` respectively.
 * 
 * Returns a function to unbind from source and optionally remove HTML element
 * ```js
 * const unbind = bind( . . . );
 * unbind();     // Unbind
 * unbind(true); // Unbind and remove HTML element(s)
 * ```
 * @param source 
 * @param bindsUnresolvedElements 
 * @returns 
 */
export const bind = <V>(source: Rx.Reactive<V>, ...bindsUnresolvedElements: Array<Rx.DomBindUnresolvedSource<V>>): PipeDomBinding => {
  const binds: Array<DomBindResolvedSource<V>> = bindsUnresolvedElements.map(bind => {
    if (bind.element && bind.element !== undefined) return bind as DomBindResolvedSource<V>;
    if (bind.query) return {
      ...bind,
      element: resolveEl<HTMLElement>(bind.query)
    }
    throw new Error(`Unable to resolve element. Missing 'element' or 'query' values on bind. ${ JSON.stringify(bind) }`);
  });

  const bindsResolved = binds.map(bind => ({
    update: resolveBindUpdater(bind, bind.element),
    transformer: resolveTransform(bind),
    sourceField: bind.sourceField
  }));

  const update = (value: V) => {
    for (const bind of bindsResolved) {
      if (bind.transformer) {
        bind.update(bind.transformer(value));
      } else {
        const v = (bind.sourceField) ? value[ bind.sourceField ] : value;

        if (typeof v === `object`) {
          if (bind.sourceField) {
            bind.update(JSON.stringify(v));
          } else {
            bind.update(JSON.stringify(v));
          }
        } else bind.update(v as string);
      }
    }
  }
  const unsub = source.on(message => {
    if (messageHasValue(message)) {
      update(message.value);
    } else if (messageIsSignal(message)) {
      console.warn(message);
    }
  });

  if (hasLast(source)) {
    update(source.last());
  }

  return {
    remove: (removeElements: boolean) => {
      unsub();
      if (removeElements) {
        for (const bind of binds) {
          bind.element.remove();
        }
      }
    }
  }
}

/**
 * Calls `updater` whenever `source` produces a value. Useful when several fields from a value
 * are needed to update an element.
 * ```js
 * bindUpdate(source, `#someEl`, (v, el) => {
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
export const bindUpdate = <V>(source: Rx.Reactive<V>, elOrQuery: string | HTMLElement, updater: (v: V, el: HTMLElement) => void): PipeDomBinding => {
  const el = resolveEl(elOrQuery);

  const update = (value: V) => {
    updater(value, el);
  }

  const unsub = source.on(message => {
    if (messageHasValue(message)) {
      console.log(message);
      update(message.value);
    } else {
      console.warn(message);
    }
  });

  if (hasLast(source)) {
    update(source.last());
  }

  return {
    remove: (removeElement: boolean) => {
      unsub();
      if (removeElement) {
        el.remove();
      }
    }
  }
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
  source: Rx.ReactiveDiff<V>,
  elOrQuery: string | HTMLElement | null,
  updater: (diffs: Array<Change<any>>, el: HTMLElement) => void,
  opts: Partial<BindUpdateOpts<V>> = {}
): PipeDomBinding & { refresh: () => void } => {
  if (elOrQuery === null) throw new Error(`Param 'elOrQuery' is null`);
  if (elOrQuery === undefined) throw new Error(`Param 'elOrQuery' is undefined`);

  const el = resolveEl(elOrQuery);
  const binds = opts.binds;
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
    }
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
// export const createUpdate = <V>(source: Rx.Reactive<V>, updater: (v: V, el: HTMLElement) => void, options: Partial<DomCreateOptions> = {}): PipeDomBinding => {
//   const tag = options.tagName ?? `DIV`;
//   const el = document.createElement(tag);
//   if (options.parentEl) {
//     const parent = resolveEl(options.parentEl);
//     parent.append(el);
//   }
//   const b = bindUpdate(source, el, updater);
//   return b;
// }


/**
 * Creates, updates & deletes elements based on pathed values from a reactive.
 * 
 * This means that elements are only manipulated if its associated data changes,
 * and elements are not modified if there's no need to.
 * @param source 
 * @param options 
 */
export const elements = <T>(source: Rx.ReactiveDiff<T> | (Rx.ReactiveDiff<T> & Rx.ReactiveInitial<T>), options: Partial<ElementsOptions>) => {
  const containerEl = options.container ? resolveEl(options.container) : document.body;
  const defaultTag = options.defaultTag ?? `div`
  const elByField = new Map<string, HTMLElement>();
  const binds = new Map<string, ElementBind & {
    update: ((value: any, el: HTMLElement) => void)
    path: string
  }>();

  for (const [ key, value ] of Object.entries(options.binds ?? {})) {
    const tagName = value.tagName ?? defaultTag;
    //console.log(`key: ${ key }`);
    binds.set(key, {
      ...value,
      update: resolveBindUpdaterBase(value),
      transform: resolveTransform(value),
      tagName,
      path: key
    });
  }

  const findBind = (path: string) => {
    const bind = getFromKeys(binds, stringSegmentsEndToEnd(path));
    if (bind !== undefined) return bind;
    if (!path.includes(`.`)) return binds.get(`_root`);
  }

  function* ancestorBinds(path: string) {
    for (const p of stringSegmentsStartToStart(path)) {
      //console.log(` ancestorBinds path: ${ path } segment: ${ p }`)

      if (binds.has(p)) {
        //console.log(`  bind: ${ p } found: ${ JSON.stringify(binds.get(p)) }`);
        yield binds.get(p);
      } else {
        //console.log(` bind: ${ p } not found`);
      }
    }
    if (binds.has(`_root`) && path.includes(`.`)) yield binds.get(`_root`);
  }


  const create = (path: string, value: any) => {
    const rootedPath = getRootedPath(path);
    console.log(`Rx.Dom.elements.create: ${ path } rooted: ${ rootedPath } value: ${ JSON.stringify(value) }`);

    // Create
    const bind = findBind(getRootedPath(path));
    let tagName = defaultTag;
    if (bind?.tagName) tagName = bind.tagName;

    const el = document.createElement(tagName);
    el.setAttribute(`data-path`, path);
    update(path, el, value);

    let parentForEl;
    for (const b of ancestorBinds(rootedPath)) {
      //console.log(`  path: ${ rootedPath } b: ${ JSON.stringify(b) }`);
      if (b?.nestChildren) {
        // Get root of path
        const absoluteRoot = beforeMatch(path, `.`);
        const findBy = b.path.replace(`_root`, absoluteRoot);

        parentForEl = elByField.get(findBy);
        if (parentForEl === undefined) {
          //console.log(`    could not find parent. path: ${ path } b.path: ${ b.path } findBy: ${ findBy }`);
        } else {
          //console.log(`    found parent`);
          break;
        }
      }
    }
    (parentForEl ?? containerEl).append(el);
    elByField.set(path, el);
    console.log(`Added el: ${ path }`);
  }

  const update = (path: string, el: HTMLElement, value: any) => {
    console.log(`Rx.dom.update path: ${ path } value:`, value);

    const bind = findBind(getRootedPath(path));
    if (bind === undefined) {
      //console.log(`Rx.dom.update   no bind for ${ path }`)
      if (typeof value === `object`) value = JSON.stringify(value);
      el.textContent = value;
    } else {
      //console.log(`Rx.dom.update   got bind! ${ path } `);
      if (bind.transform) value = bind.transform(value);
      bind.update(value, el);
    }
  }

  const changes = (changes: Array<Immutable.Change<any>>) => {
    const queue = new QueueMutable({}, changes);
    let d = queue.dequeue();
    const seenPaths = new Set<string>();
    while (d !== undefined) {
      //for (const d of changes) {
      const path = d.path;
      if (d.previous === undefined) {
        // Create
        console.log(`Rx.Dom.elements.changes no previous. path: ${ path }`);

        create(path, d.value);
        const subdata = Immutable.getPathsAndData(d.value, Number.MAX_SAFE_INTEGER, path);
        console.log(subdata);
        for (const dd of subdata) {
          if (!seenPaths.has(dd.path)) {
            queue.enqueue(dd);
            seenPaths.add(dd.path);
          }
        }
      } else if (d.value === undefined) {
        // Delete
        const el = elByField.get(path);
        if (el === undefined) {
          console.warn(`No element to delete? ${ path } `);
        } else {
          console.log(`Rx.Dom.elements.changes delete ${ path }`);
          el.remove();
        }
      } else {
        // Update
        const el = elByField.get(path);
        if (el === undefined) {
          console.warn(`Rx.Dom.elements.changes No element to update ? ${ path } `);
          create(path, d.value);
        } else {
          //console.log(`Rx.Dom.elements.changes Updating ${ path } `, el);
          update(path, el, d.value);
        }
      }
      d = queue.dequeue();
    }
  }

  /**
   * Source has changed
   */
  source.onDiff(message => {
    if (message.value) {
      console.log(`Rx.Dom.elements diff ${ JSON.stringify(message.value) } `);
      changes(message.value);
    }
  });

  // Source has an initial value, use that
  if (hasLast(source)) {
    const last = source.last();
    // Get data of value as a set of paths and data
    // but only at first level of depth, because changes() will probe
    // deeper itself
    changes(Immutable.getPathsAndData(last as object, 1));
  }
};

/**
 * Replaces the root portion of `path` with the magic keyword `_root`
 * @param path 
 * @returns 
 */
const getRootedPath = (path: string) => {
  const after = afterMatch(path, `.`);
  return after === path ? `_root` : `_root.` + after;
}

export function win() {
  const generateRect = () => ({ width: window.innerWidth, height: window.innerHeight });

  const size = Rx.fromEvent(window, `resize`, {
    lazy: true,
    process: () => generateRect(),
  });
  const pointer = Rx.fromEvent(window, `pointermove`, {
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
