import type { Signal } from "../Signal.js";
import { type Readable, isFinitePipe, type PipeBidi } from "./Types.js";

export async function asPromise<V>(p: Readable<V>): Promise<V> {
  if (isFinitePipe(p) && p.isClosed()) throw new Error(`Finite pipe has closed`);

  let resolveP: (value: V) => unknown;
  let _rejectP: (reason?: any) => unknown;
  const initPromise = () => {
    const p = new Promise<V>((resolveParameter, rejectParameter) => {
      resolveP = resolveParameter;
      _rejectP = rejectParameter;
    });
    return p;
  }

  const promise = initPromise();

  p.setOutlet((value) => {
    resolveP(value[ 0 ] as V);
  });
  return promise;
}

export async function* asAsyncIterable<V>(p: Readable<V>): AsyncGenerator<V> {
  let promise = asPromise(p);
  while (true) {
    const value = await promise;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (value === undefined) return;

    yield value;
    if (isFinitePipe(p) && p.isClosed()) return;
    promise = asPromise(p);
  }
}

export type AsArrayOptions = {
  maximumValues?: number
}
/**
 * Gather output of readable pipe into an array. Must use await
 * ```js
 * const array = await asArray(pipe);
 * ```
 * 
 * Options:
 * - maximumValues: by default returns all values. Set a value to return early.
 * @param pipe 
 * @returns 
 */
export const asArray = async <V>(pipe: Readable<V>, options: AsArrayOptions = {}): Promise<Array<V>> => {
  const returnArray: Array<V> = [];
  const maximumValues = options.maximumValues ?? Number.MAX_SAFE_INTEGER;

  for await (const v of asAsyncIterable(pipe)) {
    if (returnArray.length >= maximumValues) break;
    returnArray.push(v);
  }
  return returnArray;
}

export const basic = <V>(p: Readable<V>, initialFire = false) => {
  const t = {
    get value(): V | undefined {
      return p.last();
    },
    on(callback: (value: V | undefined, signal?: Signal) => unknown) {
      p.setOutlet(c => {
        callback(c[ 0 ], c[ 1 ]);
      });
      if (initialFire) {
        const last = p.last();
        if (last === undefined) return;
        callback(last);
      }
    }
  }
  return t;
}

export const basicBidi = <V>(p: PipeBidi<V>) => {
  const t = {
    get value(): V | undefined {
      return p.last();
    },
    set value(value: V) {
      p.inlet([ value, undefined ]);
    },
    on(callback: (value: V | undefined, signal?: Signal) => unknown) {
      p.setOutlet(c => {
        callback(c[ 0 ], c[ 1 ]);
      });
    }
  }
  return t;
}