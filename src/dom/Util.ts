import { Observable, throttleTime } from 'rxjs';

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
export const resizeObservable = (elem: HTMLElement, timeoutMs: number = 1000): Observable<readonly ResizeObserverEntry[]> => {
  const o = new Observable<ResizeObserverEntry[]>(subscriber => {
    const ro = new ResizeObserver(entries => {
      subscriber.next(entries);
    });

    ro.observe(elem);
    return function unsubscribe() {
      ro.unobserve(elem);
    };
  });
  return o.pipe(throttleTime(timeoutMs));
};

/**
 * Copies string representation of object to clipboard
 * @param obj 
 * @returns Promise
 */
export const copyToClipboard = (obj: any) => {
  const p = new Promise((resolve, reject) => {
    const json = JSON.stringify(obj, null, 2);
    const cleaned = json.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, (match) => match.replace(/"/g, ``));

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