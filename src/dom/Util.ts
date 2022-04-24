import { Observable,  debounceTime, fromEvent } from 'rxjs';
import {Points} from '~/geometry';

type ElementResizeArgs<V extends HTMLElement|SVGSVGElement> = {
  readonly el:V
  readonly bounds: {
    readonly width:number,
    readonly height:number
    readonly center:Points.Point
  }
}

type CanvasResizeArgs = ElementResizeArgs<HTMLCanvasElement> & {
  readonly ctx:CanvasRenderingContext2D
}

/**
 * Resizes given canvas element to match window size. To resize canvas to match its parent, use {@link parentSizeCanvas}.
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
export const fullSizeCanvas = (domQueryOrEl:string|HTMLCanvasElement, onResized?:(args:CanvasResizeArgs)=>void, skipCss = false) => {
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
 * Sets width/height atributes on the given element according to the size of its parent.
 * @param domQueryOrEl Elememnt to resize
 * @param onResized Callback when resize happens
 * @param timeoutMs Timeout for debouncing events
 * @returns 
 */
export const parentSize = <V extends HTMLElement>(domQueryOrEl:string|V, onResized?:(args:ElementResizeArgs<V>)=>void, timeoutMs:number = 100) => {
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
 * Resizes given canvas element to its parent element. To resize canvas to match the viewport, use {@link fullSizeCanvas}.
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

  el.style.width = `100%`;
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
export const resolveEl = <V extends HTMLElement>(domQueryOrEl:string|V):V => {
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
    const json = JSON.stringify(obj, null, 2);
    //eslint-disable-next-line functional/no-let
    let cleaned = json;
    try {
      cleaned = json.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, (match) => match.replace(/"/g, ``));
    } catch (ex) {
      // TODO: when possible, need to find fix for Safari
      // Via LL: https://stackoverflow.com/questions/51568821/works-in-chrome-but-breaks-in-safari-invalid-regular-expression-invalid-group
      console.log(ex);
    }
    navigator.clipboard.writeText(JSON.stringify(cleaned)).then(
      () => {
        resolve(true);
      },
      (_err) => {
        console.warn(`Could not copy to clipboard`);
        console.log(cleaned);
        reject(_err);
      }
    );
  });
  return p;
};