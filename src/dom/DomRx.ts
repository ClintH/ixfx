import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { resolveEl } from './Util.js';

export type PluckOpts = {
  readonly pluck: string;
};

export type TransformOpts = {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any,functional/prefer-immutable-types
  transform(ev: Event): any;
};

/**
 * Responsive value
 */
// eslint-disable-next-line functional/no-mixed-types
export type Rx<V> = {
  /**
   * Last value
   */
  readonly value: V;
  /**
   * Clears last value
   */
  readonly clear: () => void;
};

export type DomRxOpts = PluckOpts | TransformOpts;

/**
 * Keeps track of last event data
 *
 * ```js
 * const pointer = rx(`#myDiv`, `pointermove`).value;
 *
 * if (pointer.clientX > ...)
 * ```
 *
 * Pluck a field:
 * ```js
 * const pointerX = rx(`#myDiv`, `pointermove`, { pluck: `clientX` }).value;
 *
 * if (pointerX > ...)
 * ```
 * @template V Event type
 * @param opts
 * @return
 */
export const rx = <V extends object>(
  //eslint-disable-next-line functional/prefer-immutable-types
  elOrQuery: HTMLElement | string,
  event: string,
  opts?: DomRxOpts
): Rx<V> => {
  const el = resolveEl<HTMLElement>(elOrQuery);
  const ev = fromEvent(el, event);
  // @ts-ignore
  const value: V = {};

  const clear = () => {
    const keys = Object.keys(value);
    keys.forEach((key) => {
      // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
      delete (value as any)[key];
    });
  };
  //eslint-disable-next-line functional/prefer-immutable-types
  const setup = (sub: Observable<Event>): Rx<V> => {
    sub.subscribe({
      next: (newValue) => {
        // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
        Object.assign(value, newValue);
      },
    });
    return {
      value,
      clear,
    };
  };

  if (opts === undefined) return setup(ev);

  if ((opts as PluckOpts).pluck) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return setup(ev.pipe(map((x) => (x as any)[(opts as PluckOpts).pluck])));
  } else if ((opts as TransformOpts).transform) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return setup(ev.pipe(map((x) => (opts as TransformOpts).transform(x))));
  }

  return setup(ev);
};
