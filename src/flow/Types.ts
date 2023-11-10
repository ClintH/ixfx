export type HasCompletion = {
  get isDone(): boolean;
};

export type AsyncPromiseOrGenerator<V> =
  | (() => Promise<V> | Promise<undefined>)
  | (() => V | undefined)
  | Generator<V>
  | IterableIterator<V>
  | AsyncIterableIterator<V>
  | AsyncGenerator<V>
  | AsyncIterable<V>
  | Iterable<V>;
