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
 * Returns a series from a generator. This gives some minor syntactical benefits
 * 
 * Example usage:
 *  let hueSeries = Series.fromGenerator(Producers.numericRange(1, 0, 360, true));
 *  hueSeries.value; // Each time value is requested, we get a new number in range
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
 * Items are emitted automatically with a set interval
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
 * Creates a series from an event handler
 *
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
   * @type {(SeriesValueNeeded<V> | undefined)}
   * @memberof Series
   */
  onValueNeeded: SeriesValueNeeded<V> | undefined = undefined;

  [Symbol.asyncIterator]() {
    return eventsToIterable(this, `data`);
  }

  /**
   * Merges event, all event firings are pushed to the series, and thus available under its own
   * event handler or iteration.
   *
   * @param {EventTarget} source
   * @param {string} eventType
   * @memberof Series
   */
  mergeEvent(source: EventTarget, eventType: string) {
    if (source === undefined) throw Error(`source is undefined`);
    if (eventType === undefined) throw Error(`eventType is undefined`);

    const s = this;
    const handler = (evt: any) => {
      console.log(`Series.mergeEventSource: event ${eventType} sending: ${JSON.stringify(evt)}`);
      s.push(evt);
    };

    source.addEventListener(eventType, handler);
    s.addEventListener(`done`, () => {
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
    if (this.#cancelled) throw Error(`Series cancelled`);
    if (this.#done) throw Error(`Series is marked as done`);
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
   * Returns the last value that flowed through series or undefined
   * if there has been no value
   *
   * If the `onValueNeeded` callback is set and there's no new value, it will be called to pull data
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
}
