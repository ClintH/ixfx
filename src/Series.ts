import {SimpleEventEmitter} from "./Events.js";
import {eventsToIterable} from "./Iterable.js";
import {sleep} from "./util.js";

type SeriesEventMap<V> = {
  data: V
  done: boolean
  cancel: string
}

type SeriesValueNeeded<V> = () => V | undefined;


/**
 * Returns a series that produces values according to a time interval
 * 
 * Eg produce a random number every 500ms
 * ```
 * const rando = interval(500, () => Math.random());
 * ```
 *
 * @template V
 * @param {number} intervalMs
 * @param {() => V} produce
 * @returns {Series<V>}
 */
export const atInterval = <V>(intervalMs: number, produce: () => V): Series<V> => {
  const series = new Series<V>();
  const timer = setInterval(() => {
    if (series.cancelled) {
      clearInterval(timer);
      return;
    }
    series.push(produce());
  }, intervalMs);
  return series;
};


/**
 * Returns a series from a generator. This gives minor syntactical benefits over using the generator directly.
 * 
 * Example usage:
 * ```
 * let hueSeries = Series.fromGenerator(Producers.numericRange(1, 0, 360, true));
 * hueSeries.value; // Each time value is requested, we get a new number in range
 * ```
 * @template V Type
 * @param {Generator<V>} vGen Generator
 * @returns {Series<V>} Series from provided generator
 */
export const fromGenerator = <V> (vGen: Generator<V>): Series<V> => {
  if (vGen === undefined) throw Error(`vGen is undefined`);

  const s = new Series<V>();
  let genResult = vGen.next();
  s.onValueNeeded = () => {
    //console.log('Series.fromGenerator - pulling new value');
    genResult = vGen.next();
    if (genResult.done) {
      //console.log('Series.fromGenerator - turns out its done');
      return undefined;
    }
    return genResult.value;
  };

  if (genResult.done) {
    //console.log('Series.fromGenerator - generator done');
    s._setDone();
    return s;
  }

  s.push(genResult.value);
  return s;
};

/**
 * Creates a series from an iterable collection. 
 * Items are emitted automatically with a set interval until done
 *
 * @template V
 * @param {Iterable<V>} vIter Iterable collection of data
 * @param {number} [delayMs=100] Delay in millis before data starts getting pulled from iterator
 * @param {number} [intervalMs=10] Interval in millis between each attempt at pulling data from
 * @returns {Series<V>} A new series that wraps the iterator
 * @memberof Series
 */
export const fromTimedIterable = <V>(vIter: Iterable<V> | AsyncIterable<V>, delayMs: number = 100, intervalMs: number = 10): Series<V> => {
  if (vIter === undefined) throw Error(`vIter is undefined`);
  if (delayMs < 0) throw Error(`delayMs must be at least zero`);
  if (intervalMs < 0) throw Error(`delayMs must be at least zero`);

  const s = new Series<V>();
  setTimeout(async () => {
    if (s.cancelled) return;
    try {
      for await (const v of vIter) {
        if (s.cancelled) return;
        s.push(v);
        await sleep(intervalMs);
      }
      s._setDone();
    } catch (err) {
      s.cancel(err as string);
    }
  }, delayMs);
  return s;
};

/**
 * Creates a series from an event handler.
 * 
 * Create
 * ```
 * const click = fromEvent(buttonEl, `click`);
 * ```
 * 
 * Consuming using iteration
 * ```
 * for await (let evt of click) {
 *  console.log(`click event ${evt}`);
 * }
 * ```
 * 
 * Consuming using event
 * ```
 * click.addEventListener(`data`, (evt) => {
 *  console.log(`click event ${evt}`);
 * })
 * ```
 *
 * Consuming using field:
 * ```
 * bool wasClicked = click.hasValue(); // True when click event has happened
 * click.clearValue();                 // Forget last event
 * wasClicked = click.hasValue();      // Will be false if there has not been a subsequent click.
 * ```
 * @param {EventTarget} source
 * @param {string} eventType
 * @returns
 * @memberof Series
 */
export const fromEvent = (source: EventTarget, eventType: string) => {
  const s = new Series<any>();
  s.mergeEvent(source, eventType);
  return s;
};

/**
 * A Series produces an asynchronous series of data
 * It can be iterated over, or events can be used to subscribe to new data.
 *
 * Examples of using data from a series. Assuming variable `series` is a Series instance...
 * ```
 * for await (let value of series) {
 *  // Value will provide new values as they come in. Make sure to `break` to end infinite series
 * } 
 * 
 * // Grab the latest value.
 * let v = series.value;
 * 
 * // Since the empty value is undefined (falsy) use hasValue() to check for boolean data
 * if (series.hasValue()) ...
 * 
 * series.clearValue(); // Set value to undefined
 * ```
 * 
 * Example of manually controlling a series:
 * ```
 * const series = new Series(); // Create
 * series.push(`some value`);   // Push data to listeners/subscribers
 * 
 * series.onValueNeeded = () => Math.random(); // Provide a random value when ever a new value is needed
 * series.cancel(`manual cancel`);  // Close series, causing .done and .cancelled to be true
 * 
 * if (series.done) console.log(`series done`); // Series is complete or cancelled
 * if (series.cancelled) console.log(`series cancelled`); // Cancelled but maybe was not done
 * ```
 * @export
 * @class Series
 * @extends {SimpleEventEmitter<SeriesEventMap<V>>}
 * @implements {AsyncIterable<V>}
 * @template V
 */
export class Series<V> extends SimpleEventEmitter<SeriesEventMap<V>> implements AsyncIterable<V> {
  #cancelled: boolean = false;
  #lastValue: V | undefined;
  #done: boolean = false;
  #newValue: boolean = false;

  /**
   * Callback to pull new data from a source is triggered when .value is queryed
   * without new data having arrived
   *
   * If the function returns `undefined`, the series is marked as done.
   * @type {(SeriesValueNeeded<V> | undefined)}
   * @memberof Series
   */
  onValueNeeded: SeriesValueNeeded<V> | undefined = undefined;

  [Symbol.asyncIterator]() {
    return eventsToIterable(this, `data`);
  }

  /**
   * Merges an event, meaning that all event data from the source will be pushed to the series.
   * 
   * Event listener is removed if Series is done/cancelled
   * @param {EventTarget} source
   * @param {string} eventType
   * @memberof Series
   */
  mergeEvent(source: EventTarget, eventType: string) {
    if (source === undefined) throw Error(`source is undefined`);
    if (eventType === undefined) throw Error(`eventType is undefined`);

    //const s = this;
    const handler = (evt: any) => {
      console.log(`Debug Series.mergeEventSource: event ${eventType} sending: ${JSON.stringify(evt)}`);
      this.push(evt);
    };

    source.addEventListener(eventType, handler);

    // If series itself finishes, remove event listener from source
    this.addEventListener(`done`, () => {
      try {
        source.removeEventListener(eventType, handler);
      } catch (err) {
        console.log(err as string);
      }
    });
  }

  /**
   * Sets the done state to true. Once 'done' no more data can be pushed 
   *
   * @returns
   * @memberof Series
   */
  _setDone() {
    if (this.#done) return;
    this.#done = true;
    super.fireEvent(`done`, false);
  }

  /**
   * Push a value to the series, firing the 'data' event
   *
   * @param {V} v Value to push
   * @memberof Series
   */
  push(v: V) {
    if (this.#cancelled) throw Error(`Series has been cancelled, cannot push data`);
    if (this.#done) throw Error(`Series is marked as done, cannot push data`);
    this.#lastValue = v;
    this.#newValue = true;
    super.fireEvent(`data`, v);
  }

  /**
   * Cancels the series. Fires both 'cancel' and 'done' events,
   * series cannot push data subsequently.
   *
   * @param {string} [cancelReason='Cancelled']
   * @returns
   * @memberof Series
   */
  cancel(cancelReason: string = `Cancelled`) {
    if (this.#done) throw Error(`Series cannot be cancelled, already marked done`);
    if (this.#cancelled) return;
    this.#cancelled = true;
    this.#done = true;
    super.fireEvent(`cancel`, cancelReason);
    super.fireEvent(`done`, true);
  }

  /**
   * Returns true if series has been cancelled
   *
   * @readonly
   * @type {boolean}
   * @memberof Series
   */
  get cancelled(): boolean {
    return this.#cancelled;
  }

  /**
   * Returns true if series has been marked 'done'
   * Series will be 'done' if cancelled as well.
   *
   * @readonly
   * @type {boolean}
   * @memberof Series
   */
  get done(): boolean {
    return this.#done;
  }

  /**
   * Returns the last value that flowed through series or undefined if there is no value.
   *
   * Warning: Calling has side-effects. If no new value has been pushed to the series after the last
   * call to `.value` _and_ the `onValueNeeded` handler is set _and_ series is not marked as done,
   * the handler will be used to pull a new value. If the return result is `undefined`, series will
   * then be marked as done.
   * 
   * @readonly
   * @type {(V|undefined)}
   * @memberof Series
   */
  get value(): V | undefined {
    if (!this.#newValue && this.onValueNeeded && !this.#done) {
      const v = this.onValueNeeded();
      if (v) this.push(v);
      else if (v === undefined) this._setDone();
    }
    this.#newValue = false;
    return this.#lastValue;
  }

  /**
   * Clears the last value. This may result in the next call to `.value` pulling a new value.
   * `hasValue()` will return false until a new value arrives.
   *
   * @memberof Series
   */
  clearLastValue() {
    this.#lastValue = undefined;
    this.#newValue = false;
  }

  /**
   * Returns true if series has a last value.
   * This means at least one value has been received since creation or `clearLastValue()` invocation.
   *
   * Does not trigger pulling a new value, unlike `.value`
   * @returns
   * @memberof Series
   */
  hasValue():boolean {
    return this.#lastValue !== undefined;
  }
}


export class TriggerSeries extends Series<boolean> {
  #undefinedValue:boolean;
  constructor(undefinedValue:boolean = false) {
    super();
    this.#undefinedValue= undefinedValue;
  }

  get value(): boolean {
    const v = super.value;
    if (v === undefined) return this.#undefinedValue;
    return v;
  }
}