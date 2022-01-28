import {fromEvent, Observable} from 'rxjs';
import { map} from 'rxjs/operators';
import {resolveEl} from './Forms';

// eslint-disable-next-line functional/no-mixed-type
// export type DomRxOpts = {
//   readonly elOrQuery:HTMLElement|string,
//   readonly event: string,
// }

export type PluckOpts =  {
  readonly pluck: string
}

export type TransformOpts = {
  transform(ev:Event):any
}

// eslint-disable-next-line functional/no-mixed-type
export type DomRx<V> = {
  readonly value: V,
  readonly clear: () => void
}

export type DomRxOpts = PluckOpts | TransformOpts;

/**
 * Keeps track of last event data
 * 
 * ```js
 * const pointer = domRx<PointerEvent>(`#myDiv`, `pointermove`).value;
 * 
 * if (pointer.clientX > ...)
 * ``` 
 * 
 * Pluck a field:
 * ```js
 * const pointerX = domRx<PointerEvent>(`#myDiv`, `pointermove`, {pluck: `clientX`}).value;
 * 
 * if (pointerX > ...)
 * ```
 * @template V
 * @param {DomRxPluckOpts} opts
 * @return {*}  {DomRx<V>}
 */
export const domRx = <V>(elOrQuery:HTMLElement|string, event:string, opts?:DomRxOpts):DomRx<V> => {
  const el = resolveEl<HTMLElement>(elOrQuery);
  const ev = fromEvent(el, event);
  // @ts-ignore
  const value:V = {};

  const clear = () => {
    const keys = Object.keys(value);
    keys.forEach(key => {
      // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
      delete (value as any)[key];
    });
  };

  const setup = (sub:Observable<Event>):DomRx<V> => {
    sub.subscribe({
      next: (newValue) => {
        // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
        Object.assign(value, newValue);
      }
    });
    return {
      value, clear
    };
  };

  if (opts === undefined) return setup(ev);
  
  if ((opts as PluckOpts).pluck) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return setup(ev.pipe(map(x => (x as any)[(opts as PluckOpts).pluck])));
  } else if ((opts as TransformOpts).transform) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return setup(ev.pipe(map(x => (opts as TransformOpts).transform(x))));
  }

  return setup(ev);
};