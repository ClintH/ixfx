import { Observable,  debounceTime, fromEvent } from 'rxjs';
import * as Points from '../geometry/Point';
import JSON5 from 'json5';

export type ElementResizeArgs<V extends HTMLElement|SVGSVGElement> = {
  readonly el:V
  readonly bounds: {
    readonly width:number,
    readonly height:number
    readonly center:Points.Point
  }
}

export type CanvasResizeArgs = ElementResizeArgs<HTMLCanvasElement> & {
  readonly ctx:CanvasRenderingContext2D
}


export const fullSizeElement = <V extends HTMLElement>(domQueryOrEl:string|V, onResized?:(args:ElementResizeArgs<V>) => void) => {
  const el = resolveEl<V>(domQueryOrEl);

  const r = windowResize();
  const update = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    el.setAttribute(`width`, width.toString());
    el.setAttribute(`height`, height.toString());

    const bounds = {width, height, center: {x: width/2, y:height/2}};
    if (onResized !== undefined) onResized({el, bounds});

  };
  r.subscribe(update);
  
  update();
  return r;
};

/// TODO: MAke fullSizeCanvas use fullSizeElement

/**
 * Resizes given canvas element to match window size. 
 * To resize canvas to match its parent, use {@link parentSizeCanvas}.
 * 
 * To make the canvas appear propery, it sets the following CSS:
 * ```css
 * {
 *  top: 0;
 *  left: 0;
 *  zIndex: -1;
 *  position: fixed;
 * }
 * ```
 * Pass _true_ for `skipCss` to avoid this.
 * 
 * Provide a callback for when resize happens.
 * @param domQueryOrEl Query string or reference to canvas element
 * @param onResized Callback for when resize happens, eg for redrawing canvas
 * @param skipCss if true, style are not added
 * @returns Observable
 */
export const fullSizeCanvas = (domQueryOrEl:string|HTMLCanvasElement|undefined|null, onResized?:(args:CanvasResizeArgs)=>void, skipCss = false) => {
  if (domQueryOrEl === null || domQueryOrEl === undefined) throw new Error(`domQueryOrEl is null or undefined`);
  const el = resolveEl<HTMLCanvasElement>(domQueryOrEl);
  if (el.nodeName !== `CANVAS`) throw new Error(`Expected HTML element with node name CANVAS, not ${el.nodeName}`);

  const ctx = el.getContext(`2d`);
  if (ctx === null) throw new Error(`Could not create drawing context`);

  const update = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    //eslint-disable-next-line functional/immutable-data
    el.width = width;
    //eslint-disable-next-line functional/immutable-data
    el.height = height;

    const bounds = {width, height, center: {x: width/2, y:height/2}};
    if (onResized !== undefined) onResized({ctx, el, bounds});
  };

  // Setup
  if (!skipCss) {
    //eslint-disable-next-line functional/immutable-data
    el.style.top = `0`;
    //eslint-disable-next-line functional/immutable-data
    el.style.left = `0`;
    //eslint-disable-next-line functional/immutable-data
    el.style.zIndex = `-100`;
    //eslint-disable-next-line functional/immutable-data
    el.style.position = `fixed`;
  }

  const r = windowResize();
  r.subscribe(update);
  
  update();
  return r;
};

/**
 * Given an array of class class names, this will cycle between them each time
 * it is called.
 * 
 * Eg, assume `list` is: [ `a`, `b`, `c` ]
 * 
 * If `el` already has the class `a`, the first time it is called, class `a`
 * is removed, and `b` added. The next time `b` is swapped for `c`. Once again,
 * `c` will swap with `a` and so on.
 * 
 * If `el` is undefined or null, function silently returns.
 * @param el Element
 * @param list List of class names
 * @returns 
 */
export const cycleCssClass = (el:HTMLElement, list:readonly string[]) => {
  if (el === null || !el) return;
  if (!Array.isArray(list)) throw new Error(`List should be an array of strings`);
  //eslint-disable-next-line functional/no-let
  for (let i=0;i<list.length;i++) {
    if (el.classList.contains(list[i])) {
      el.classList.remove(list[i]);
      if (i +1 < list.length) {
        el.classList.add(list[i+1]);
      } else {
        el.classList.add(list[0]);
      }
      return;
    }
  }
  el.classList.add(list[0]);
};

/**
 * Sets width/height atributes on the given element according to the size of its parent.
 * @param domQueryOrEl Elememnt to resize
 * @param onResized Callback when resize happens
 * @param timeoutMs Timeout for debouncing events
 * @returns 
 */
export const parentSize = <V extends HTMLElement|SVGSVGElement>(domQueryOrEl:string|V, onResized?:(args:ElementResizeArgs<V>)=>void, timeoutMs:number = 100) => {
  const el = resolveEl<V>(domQueryOrEl);
  const parent = el.parentElement;
  if (parent === null) throw new Error(`Element has no parent`);

  const ro = resizeObservable(parent, timeoutMs).subscribe((entries:readonly ResizeObserverEntry[]) => {
    const e = entries.find(v => v.target === parent);
    if (e === undefined) return;

    const width = e.contentRect.width;
    const height = e.contentRect.height;

    el.setAttribute(`width`, width + `px`);
    el.setAttribute(`height`, height + `px`);
    const bounds = {width, height, center: {x: width/2, y:height/2}};
    if (onResized !== undefined) onResized({ el, bounds});
  });

  return ro;
};

/**
 * Source: https://zellwk.com/blog/translate-in-javascript
 * @param domQueryOrEl 
 */
export const getTranslation = (domQueryOrEl:string|HTMLElement): Points.Point => {
  // Source:
  // https://raw.githubusercontent.com/zellwk/javascript/master/src/browser/dom/translate-values.js

  const el = resolveEl<HTMLElement>(domQueryOrEl);
  const style = window.getComputedStyle(el);
  const matrix = style.transform;

  // No transform property. Simply return 0 values.
  if (matrix === `none` || typeof matrix === `undefined`) {
    return {
      x: 0,
      y: 0,
      z: 0
    };
  }

  // Can either be 2d or 3d transform
  const matrixType = matrix.includes(`3d`) ? `3d` : `2d`;
  // @ts-ignore
  const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(`, `);

  // 2d Matrixes have 6 values
  // Last 2 values are X and Y.
  // 2d Matrixes does not have Z value.
  if (matrixType === `2d`) {
    return {
      x: parseFloat(matrixValues[4]),
      y: parseFloat(matrixValues[5]),
      z: 0
    };
  }

  // 3d Matrixes have 16 values
  // The 13th, 14th, and 15th values are X, Y, and Z
  if (matrixType === `3d`) {
    return {
      x: parseFloat(matrixValues[12]),
      y: parseFloat(matrixValues[13]),
      z: parseFloat(matrixValues[14])
    };
  }

  return {x: 0, y: 0, z:0};
};

/**
 * Resizes given canvas to its parent element. 
 * To resize canvas to match the viewport, use {@link fullSizeCanvas}.
 * 
 * Provide a callback for when resize happens.
 * @param domQueryOrEl Query string or reference to canvas element
 * @param onResized Callback for when resize happens, eg for redrawing canvas
 * @returns Observable
 */
export const parentSizeCanvas = (domQueryOrEl:string|HTMLCanvasElement, onResized?:(args:CanvasResizeArgs)=>void, timeoutMs:number = 100) => {
  const el = resolveEl<HTMLCanvasElement>(domQueryOrEl);
  if (el.nodeName !== `CANVAS`) throw new Error(`Expected HTML element with node name CANVAS, not ${el.nodeName}`);

  const parent = el.parentElement;
  if (parent === null) throw new Error(`Element has no parent`);

  const ctx = (el as HTMLCanvasElement).getContext(`2d`);
  if (ctx === null) throw new Error(`Could not create drawing context`);
  
  //const safetyMargin = 4;

  //eslint-disable-next-line functional/immutable-data
  el.style.width = `100%`;
  //eslint-disable-next-line functional/immutable-data
  el.style.height = `100%`;

  //console.log('parent height: ' + parent.getBoundingClientRect().height);
  //console.log(`parent offset Height: ${parent.offsetHeight}`);

  const ro = resizeObservable(parent, timeoutMs).subscribe((entries:readonly ResizeObserverEntry[]) => {
    const e = entries.find(v => v.target === parent);
    if (e === undefined) return;

    const width = e.contentRect.width;
    const height = e.contentRect.height;
    //console.log(`contentH: ${e.contentRect.height} current: ${el.getBoundingClientRect().height}`);

    // el.setAttribute(`width`, width-safetyMargin + `px`);
    // el.setAttribute(`height`, height-safetyMargin + `px`);
    el.setAttribute(`width`, el.offsetWidth + `px`);
    el.setAttribute(`height`, el.offsetHeight + `px`);
    
    const bounds = {width, height, center: {x: width/2, y:height/2}};
    if (onResized !== undefined) onResized({ctx, el, bounds});
  });

  return ro;
};

/**
 * Returns an Observable for window resize. Default 100ms debounce.
 * @param timeoutMs 
 * @returns 
 */
export const windowResize = (timeoutMs:number = 100) => fromEvent(window, `resize`).pipe(debounceTime(timeoutMs));

/**
 * Resolves either a string or HTML element to an element.
 * Useful when an argument is either an HTML element or query.
 * 
 * ```js 
 * resolveEl(`#someId`);
 * resolveEl(someElement);
 * ```
 * @param domQueryOrEl 
 * @returns 
 */
export const resolveEl = <V extends Element>(domQueryOrEl:string|V):V => {
  if (typeof domQueryOrEl === `string`) {
    const d = document.querySelector(domQueryOrEl);
    if (d === null) {
      if (!domQueryOrEl.startsWith(`#`)) {
        throw new Error(`Query '${domQueryOrEl}' did not match anything. Did you mean '#${domQueryOrEl}?`);
      } else {
        throw new Error(`Query '${domQueryOrEl}' did not match anything. Try '#id', 'div', or '.class'`);
      }
    }
    domQueryOrEl = d as V;
  } else if (domQueryOrEl === null) throw new Error(`domQueryOrEl ${domQueryOrEl} is null`);
  else if (domQueryOrEl === undefined) throw new Error(`domQueryOrEl ${domQueryOrEl} is undefined`);
  
  const el = domQueryOrEl as V;
  return el;
};

/**
 * Creates an element after `sibling`
 * ```
 * const el = createAfter(siblingEl, `DIV`);
 * ```
 * @param sibling Element
 * @param tagName Element to create
 * @returns New element
 */
export const createAfter = (sibling: HTMLElement, tagName: string): HTMLElement => {
  const el = document.createElement(tagName);
  sibling.parentElement?.insertBefore(el, sibling.nextSibling);
  return el;
};

/**
 * Creates an element inside of `parent`
 * ```
 * const newEl = createIn(parentEl, `DIV`);
 * ```
 * @param parent Parent element
 * @param tagName Tag to create
 * @returns New element
 */
export const createIn = (parent: HTMLElement, tagName: string): HTMLElement => {
  const el = document.createElement(tagName);
  parent.appendChild(el);
  return el;
};

/**
 * Creates a table based on a list of objects
 * ```
 * const t = dataTableList(parentEl, map);
 * 
 * t(newMap)
 * ```
 */
export const dataTableList = (parentOrQuery:HTMLElement|string, data:ReadonlyMap<string, object>): (data:ReadonlyMap<string, object>) => void => {
  const parent = resolveEl(parentOrQuery);

  const update = (data:ReadonlyMap<string, object>) => {
    const seenTables = new Set();

    for (const [key, value] of data) {
      const tKey = `table-${key}`;
      seenTables.add(tKey);
      //eslint-disable-next-line functional/no-let
      let t = parent.querySelector(`#${tKey}`);
      if (t === null) {
        t = document.createElement(`table`);
        //eslint-disable-next-line functional/immutable-data
        t.id = tKey;
        parent.append(t);
      }

      updateDataTable(t as HTMLTableElement, value);
    }

    // Remove tables that aren't present in map
    const tables = Array.from(parent.querySelectorAll(`table`));
    tables.forEach(t => {
      if (!seenTables.has(t.id)) {
        t.remove();
      }
    });
  };

  if (data) update(data);

  return (d:ReadonlyMap<string, object>) => {
    update(d);
  };
  
};

/**
 * Format data. Return _undefined_ to signal that
 * data was not handled.
 */
export type DataFormatter = (data:object, path:string) => string|undefined;

/**
 * Updates a TABLE elment based on `data`'s key-object pairs
 * @param t 
 * @param data 
 * @returns 
 */
const updateDataTable = (t:HTMLTableElement, data:object, opts:DataTableOpts = {}) => {
  const precision = opts.precision ?? 2;
 
  if (data === undefined) {
    //eslint-disable-next-line functional/immutable-data
    t.innerHTML = ``;
    return;
  }
  const seenRows = new Set();
  
  for (const [key, value] of Object.entries(data)) {
    const domKey = `row-${key}`;
    seenRows.add(domKey);

    //eslint-disable-next-line functional/no-let
    let rowEl = t.querySelector(`#${domKey}`);
    if (rowEl === null) {
      rowEl = document.createElement(`tr`);
      t.append(rowEl);
      //eslint-disable-next-line functional/immutable-data
      rowEl.id = domKey;

      const keyEl = document.createElement(`td`);
      //eslint-disable-next-line functional/immutable-data
      keyEl.innerText = key;
      rowEl.append(keyEl);
    }

    //eslint-disable-next-line functional/no-let
    let valEl = rowEl.querySelector(`#${domKey}-val`);
    
    if (valEl === null) {
      valEl = document.createElement(`td`);
      //eslint-disable-next-line functional/immutable-data
      valEl.id = `${domKey}-val`;
      rowEl.append(valEl);
    }

    //eslint-disable-next-line functional/no-let
    let valueHTML:string|undefined;
    if (opts.formatter) {
      valueHTML = opts.formatter(value, key);
    }

    // If there's no formatter, or not handled...
    if (valueHTML === undefined) {
      if (typeof value === `object`) {
        valueHTML = JSON5.stringify(value);
      } else if (typeof value === `number`) {
        if (opts.roundNumbers) {
          valueHTML = Math.round(value).toString();
        } else {
          valueHTML = value.toFixed(precision);
        }
      } else {
        valueHTML = (value as object).toString();
      }
    }
    //eslint-disable-next-line functional/immutable-data
    (valEl as HTMLElement).innerHTML = valueHTML;
  }

  // Remove rows that aren't present in data
  const rows = Array.from(t.querySelectorAll(`tr`));
  rows.forEach(r => {
    if (!seenRows.has(r.id)) {
      r.remove();
    }
  });

};

export type DataTableOpts = {
  readonly formatter?:DataFormatter
  readonly precision?:number
  readonly roundNumbers?:boolean
}
/**
 * Creates a HTML table where each row is a key-value pair from `data`.
 * First column is the key, second column data.
 * 
 * ```js
 * const dt = dataTable(`#hostDiv`);
 * dt({
 *  name: `Blerg`,
 *  height: 120
 * });
 * ```
 */
export const dataTable = (parentOrQuery:HTMLElement|string, data?:object, opts?:DataTableOpts): (data:object) => void => {
  const parent = resolveEl(parentOrQuery);
  const t = document.createElement(`table`);
  parent.append(t);
  
  if (data) updateDataTable(t, data, opts);
  return (d:object) => {
    updateDataTable(t, d, opts);
  };
};

/**
 * Remove all child nodes from `parent`
 * @param parent 
 */
export const clear = (parent:HTMLElement) => {
  //eslint-disable-next-line functional/no-let
  let c = parent.lastElementChild;
  
  while (c) {
    parent.removeChild(c);
    c = parent.lastElementChild;
  }
};

/**
 * Observer when document's class changes
 * 
 * ```js
 * const c = themeChangeObservable();
 * c.subscribe(() => {
 *  // Class has changed...
 * });
 * ```
 * @returns 
 */
export const themeChangeObservable = (): Observable<readonly MutationRecord[]> => {
  const o = new Observable<MutationRecord[]>(subscriber => {
    const ro = new MutationObserver(entries => {
      subscriber.next(entries);
    });

    const opts: MutationObserverInit = {
      attributeFilter: [`class`],
      attributes: true,
    };

    ro.observe(document.documentElement, opts);
    return function unsubscribe() {
      ro.disconnect();
    };
  });
  return o;
};

/**
 * Observer when element resizes. Specify `timeoutMs` to debounce.
 * 
 * ```
 * const o = resizeObservable(myEl, 500);
 * o.subscribe(() => {
 *  // called 500ms after last resize
 * });
 * ```
 * @param elem 
 * @param timeoutMs Tiemout before event gets triggered
 * @returns 
 */
export const resizeObservable = (elem: Element, timeoutMs: number = 1000): Observable<readonly ResizeObserverEntry[]> => {
  if (elem === null) throw new Error(`elem parameter is null. Expected element to observe`);
  if (elem === undefined) throw new Error(`elem parameter is undefined. Expected element to observe`);
  
  const o = new Observable<ResizeObserverEntry[]>(subscriber => {
    const ro = new ResizeObserver(entries => {
      subscriber.next(entries);
    });

    ro.observe(elem);
    return function unsubscribe() {
      ro.unobserve(elem);
    };
  });
  return o.pipe(debounceTime(timeoutMs));
};

/**
 * Copies string representation of object to clipboard
 * @param obj 
 * @returns Promise
 */
export const copyToClipboard = (obj: object) => {
  const p = new Promise((resolve, reject) => {
    //const json = JSON.stringify(obj, null, 2);
    const str = JSON5.stringify(obj);
    navigator.clipboard.writeText(JSON.stringify(str)).then(
      () => {
        resolve(true);
      },
      (_err) => {
        console.warn(`Could not copy to clipboard`);
        console.log(str);
        reject(_err);
      }
    );
  });
  return p;
};

export type CreateUpdateElement<V> = (item:V, el:HTMLElement|null) => HTMLElement;

export const reconcileChildren = <V>(parentEl:HTMLElement, list:ReadonlyMap<string, V>, createUpdate:CreateUpdateElement<V>) => {
  if (parentEl === null) throw new Error(`parentEl is null`);
  if (parentEl === undefined) throw new Error(`parentEl is undefined`);
  
  const seen = new Set<string>();
  
  for (const [key, value] of list) {
    const id = `c-${key}`;
    const el = parentEl.querySelector(`#${id}`) as HTMLElement;
    const finalEl = createUpdate(value, el);
    //eslint-disable-next-line functional/immutable-data
    if (el !== finalEl) {
      //eslint-disable-next-line functional/immutable-data
      finalEl.id = id;
      parentEl.append(finalEl);
    }
    seen.add(id);
  }

  const prune:HTMLElement[] = [];
  //eslint-disable-next-line functional/no-let
  for (let i=0;i<parentEl.children.length;i++) {
    const c = parentEl.children[i] as HTMLElement;
    if (!seen.has(c.id)) {
      //eslint-disable-next-line functional/immutable-data
      prune.push(c);
    }
  }
  
  prune.forEach(p => p.remove());
};