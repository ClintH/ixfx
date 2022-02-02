import { Observable, throttleTime } from 'rxjs';
export const createAfter = (sibling: HTMLElement, tagName: string): HTMLElement => {
  const el = document.createElement(tagName);
  sibling.parentElement?.insertBefore(el, sibling.nextSibling);
  return el;
};

export const createIn = (parent: HTMLElement, tagName: string): HTMLElement => {
  const el = document.createElement(tagName);
  parent.appendChild(el);
  return el;
};

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