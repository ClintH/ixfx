import type { Interval } from "../../flow/IntervalType.js";
export type SyncOptions = {

  /**
   * How to handle when a source completes.
   * * 'allow' means we continue synchronising with remaining alive sources. Use 'finalValue' option to control what data is returned for completed sources
   * * 'break' means we stop the stream, because synchronisation across all sources is no longer possible.
   * 
   * Default: 'break'.
   */
  onSourceDone: `allow` | `break`,
  /**
   * Maximum time to wait for synchronisation to happen.
   * If interval is exceeded, stream closes.
   * Default: 2s
   */
  maximumWait: Interval
  /**
   * If we continue synchronisation when a source is done (via `onSourceDone:'allow'`),
   * what source should be returned for a completed source?
   * * 'undefined': _undefined_
   * * 'last': the last received value, or _undefined_
   * 
   * Default: 'undefined'
   */
  finalValue: `undefined` | `last`
}


export type CombineLatestOptions = {
  onSourceDone: `allow` | `break`
  /**
 * If we continue synchronisation when a source is done (via `onSourceDone:'allow'`),
 * what source should be returned for a completed source?
 * * 'undefined': _undefined_
 * * 'last': the last received value, or _undefined_
 * 
 * Default: 'undefined'
 */
  finalValue: `undefined` | `last`

  /**
   * After an array is emitted, what to do with
   * last values. By default, the last value is kept.
   * If 'undefined' is used, _undefined_ is used until
   * source emits again.
   * 
   * Default: 'last'
   */
  afterEmit: `undefined` | `last`
}

/**
 * A Generator, AsyncGenerator or IterableIterator
 */
export type Gen<V> = Generator<V> | AsyncGenerator<V> | IterableIterator<V>;

/**
 * Some kind of (async) generator or an array of data of type V
 */
export type GenOrData<V> = Array<V> | Gen<V>;

/**
 * A function which can form part of a chain.
 * It takes an input {@link GenOrData}, and returns a new generator.
 */
export type Link<In, Out> = {
  (input: GenOrData<In>): AsyncGenerator<Out>
  _name: string
}

/**
 * A function which can start a chain, since it takes no input
 */
export type GenFactoryNoInput<Out> = {
  (): AsyncGenerator<Out>
  _type: `GenFactoryNoInput`, _name: string
}

// export type LinksWithSource0<TFinal> = [
//   GenOrData<TFinal> | GenFactoryNoInput<TFinal>
// ]

// export type LinksWithSource1<T1, TFinal> = [
//   GenOrData<T1> | GenFactoryNoInput<T1>,
//   Link<T1, TFinal>
// ]

// export type LinksWithSource2<T1, T2, TFinal> = [
//   GenOrData<T1> | GenFactoryNoInput<T1>,
//   Link<T1, T2>,
//   Link<T2, TFinal>
// ]

// export type LinksWithSource3<T1, T2, T3, TFinal> = [
//   GenOrData<T1> | GenFactoryNoInput<T1>,
//   Link<T1, T2>,
//   Link<T2, T3>,
//   Link<T3, TFinal>
// ]


// export type LinksWithSource4<TFinal, T1, T2, T3, T4> = [
//   GenOrData<T1> | GenFactoryNoInput<T1>,
//   Link<T1, T2>,
//   Link<T2, T3>,
//   Link<T3, T4>,
//   Link<T4, TFinal>
// ]

/**
 * An array of chain links where first one is a source
 */
// export type LinksWithSourceN<OutFinal, OutStart> = [
//   Link<any, OutStart> | GenOrData<OutStart> | GenFactoryNoInput<OutStart>,
//   ...Array<Link<any, any>>,
//   Link<any, OutFinal>
// ]

// export type LinksWithSource<TFinal, T1, T2, T3, T4> = LinksWithSource0<TFinal> |
//   LinksWithSource1<T1, TFinal> |
//   LinksWithSource2<T1, T2, TFinal> |
//   LinksWithSource3<T1, T2, T3, TFinal>;
// |
// LinksWithSource4<TFinal, T1, T2, T3, T4>;

// export type LinksWithSource<OutFinal, Out4 = void, Out3 = void, Out2 = void, Out1 = void> =
//   LinksWithSource0<OutFinal> |
//   LinksWithSource1<OutFinal, Out1> |
//   LinksWithSource2<OutFinal, Out2, Out1> |
//   LinksWithSource3<OutFinal, Out3, Out2, Out1> |
//   LinksWithSource4<OutFinal, Out4, Out3, Out2, Out1> |
//   LinksWithSourceN<Out4, OutFinal>


export type LinksWithSource<In, Out> = [
  Link<In, any> | GenOrData<In> | GenFactoryNoInput<In>,
  ...Array<Link<any, any>>,
  Link<any, Out>
]

/**
 * An array of chain links without a source
 */
export type Links<In, Out> = [
  Link<In, any>,
  ...Array<Link<any, any>>,
  Link<any, Out>
]


/**
 * Delay options
 */
export type DelayOptions = {
  /**
   * Time before yielding
   */
  before?: Interval,
  /**
   * Time after yielding
   */
  after?: Interval
}

export type TickOptions = {
  interval: Interval
  loops?: number
  elapsed?: Interval
  asClockTime?: boolean
}


/**
 * A rank function that compares A and B.
 * Returns the highest value, 'a' or 'b'. 
 * Returns 'eq' if values are equal
 */
export type RankFunction<T> = (a: T, b: T) => `a` | `b` | `eq`

export type RankOptions = {
  /**
   * If set, only values with this JS type are included
   */
  includeType?: `string` | `number` | `object` | `boolean`
  /**
   * If _true_, also emits values when they rank equal with current highest.
   * _false_ by default
   */
  emitEqualRanked?: boolean
  /**
   * If _true_, emits the current highest value even if it hasn't changed.
   * This means it will match the tempo of the incoming stream.
   */
  emitRepeatHighest?: boolean
}

export type RankArrayOptions = RankOptions & {
  /**
   * If _true_, it's only the highest _within_ an array that is considered,
   * rather than tracking the higest between arrays
   * Default: _false_
   */
  withinArrays?: boolean
}


/**
 * Lazy execution of a chain
 */
export type LazyChain<In, Out> = {
  /**
   * Sets `data` to be the data for the chain
   * @param data 
   * @returns
   */
  input: (data: GenOrData<In>) => LazyChain<In, Out>
  /**
   * Return the results of the chain as a regular generator.
   * If `data` is not supplied, the last value given calling `input(data)` is used.
   * @param data 
   * @returns 
   */
  asGenerator: (data?: GenOrData<In>) => AsyncGenerator<Out>
  /**
   * Returns the results of the chain as an array.
   * If `data` is not supplied, the last value given calling `input(data)` is used.
   * @param data 
   * @returns 
   */
  asArray: (data?: GenOrData<In>) => Promise<Array<Out>>
  asAsync: (data?: GenOrData<In>) => LazyChain<In, Out>
  /**
   * Gets the last output value from the chain.
   * If `data` is not supplied, the last value given calling `input(data)` is used.
   * @param data 
   * @returns 
   */
  lastOutput: (data?: GenOrData<In>) => Promise<Out | undefined>
  /**
   * Gets the first output value from the chain.
   * If `data` is not supplied, the last value given calling `input(data)` is used.
   * @param data 
   * @returns 
   */
  firstOutput: (data?: GenOrData<In>) => Promise<Out | undefined>
  /**
   * Uses a function as a source of values
   * @param callback 
   * @returns 
   */
  fromFunction: (callback: () => any) => LazyChain<any, any>
  /**
   * Take `limit` number of values from the chain before ending
   * @param limit 
   * @returns 
   */
  take: (limit: number) => LazyChain<In, Out>
  /**
   * Only emit values that have ranked higher than previously seen
   */
  rank: (r: RankFunction<In>, options: Partial<RankOptions>) => LazyChain<In, Out>
  rankArray: (r: RankFunction<In>, options: Partial<RankArrayOptions>) => LazyChain<In, Out>
  /**
   * Debounce values
   * @param duration 
   * @returns 
   */
  debounce: (duration: Interval) => LazyChain<In, Out>
  /**
   * Delay emitting values
   * @param options 
   * @returns 
   */
  delay: (options: DelayOptions) => LazyChain<In, Out>
  /**
   * Chunk values into arrays
   * @param size 
   * @param returnRemainers 
   * @returns 
   */
  chunk: (size: number, returnRemainers?: boolean) => LazyChain<In, Out>
  /**
   * Only allow values that meet `predicate` to pass
   * @param predicate 
   * @returns 
   */
  filter: (predicate: (input: any) => boolean) => LazyChain<In, Out>
  /**
   * Gets the minimum numerical value (if relevant)
   * @returns 
   */
  min: () => LazyChain<any, number>
  /**
   * Gets the maximum numerical value (if relevant)
   * @returns 
   */
  max: () => LazyChain<any, number>
  /**
   * Gets the average numerical value (if relevant)
   * @returns
   */
  average: () => LazyChain<any, number>
  /**
   * Gets the total of numerical values
   * @returns 
   */
  total: () => LazyChain<In, number>
  /**
   * Emits a running tally of how many values have been emitted
   * @returns 
   */
  tally: () => LazyChain<In, number>
  /**
   * Ignore values that match `predicate` (opposite of `filter()`)
   * @param predicate 
   * @returns 
   */
  drop: (predicate: (value: In) => boolean) => LazyChain<In, Out>
  /**
   * Emit values until `period` has elapsed
   * @param period 
   * @returns 
   */
  duration: (period: Interval) => LazyChain<In, Out>
  /**
   * Flatten values in an array into a single value
   * @param flattener 
   * @returns 
   */
  flatten: (flattener: (values: Array<any>) => any) => LazyChain<In, Out>
  /**
   * Transform an input value to an output
   * @param transformer 
   * @returns 
   */
  transform: (transformer: (v: any) => any) => LazyChain<In, Out>
}

export type GenValueTypeObject<T extends Record<string, GenOrData<any> | GenFactoryNoInput<any>>> =
  { [ K in keyof T ]:
    T[ K ] extends Generator<infer V> ? V | undefined :
    T[ K ] extends AsyncGenerator<infer V> ? V | undefined :
    T[ K ] extends IterableIterator<infer V> ? V | undefined :
    T[ K ] extends AsyncIterableIterator<infer V> ? V | undefined :
    T[ K ] extends Array<infer V> ? V | undefined :
    // eslint-disable-next-line @typescript-eslint/ban-types
    T[ K ] extends (...args: any) => any ? ReturnType<T[ K ]> | undefined :
    never };