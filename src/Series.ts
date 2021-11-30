import {SimpleEventEmitter} from "./Events.js";
import {eventsToIterable} from "./Iterable.js";
import {sleep} from "./util.js";

type SeriesEventMap<V> = {
  data: V
  done: boolean
  cancel: string
}

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

  constructor() {
    super();
  }

  [Symbol.asyncIterator]() {
    return eventsToIterable(this, 'data');
  }

  /**
   * Creates a series from an iterable collection
   *
   * @static
   * @template V
   * @param {Iterable<V>} vIter Iterable collection of data
   * @param {number} [delayMs=100] Delay in millis before data starts getting pulled from iterator
   * @param {number} [intervalMs=10] Interval in millis between each attempt at pulling data from
   * @returns {Series<V>} A new series that wraps the iterator
   * @memberof Series
   */
  static fromIterable<V>(vIter: Iterable<V> | AsyncIterable<V>, delayMs: number = 100, intervalMs: number = 10): Series<V> {
    if (vIter === undefined) throw Error(`vIter is undefined`);
    if (delayMs < 0) throw Error(`delayMs must be at least zero`);
    if (intervalMs < 0) throw Error(`delayMs must be at least zero`);

    let s = new Series<V>();
    setTimeout(async () => {
      if (s.cancelled) return;
      try {
        for await (const v of vIter) {
          if (s.cancelled) return;
          s.push(v);
          await sleep(intervalMs);
        }
        s.#setDone();
      } catch (err) {
        s.cancel(err as string);
      }
    }, delayMs);

    return s;
  }

  /**
   * Creates a series from an event handler
   *
   * @static
   * @param {EventTarget} source
   * @param {string} eventType
   * @returns
   * @memberof Series
   */
  static fromEvent(source: EventTarget, eventType: string) {
    const s = new Series<any>();
    s.mergeEvent(source, eventType);
    return s;
  }

  mergeEvent(source: EventTarget, eventType: string) {
    if (source === undefined) throw Error('source is undefined');
    if (eventType === undefined) throw Error('eventType is undefined');

    const s = this;
    const handler = (evt: any) => {
      console.log(`Series.mergeEventSource: event ${eventType} sending: ${JSON.stringify(evt)}`);
      s.push(evt);
    };

    source.addEventListener(eventType, handler);
    s.addEventListener('cancel', () => {
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
  #setDone() {
    if (this.#done) return;
    this.#done = true;
    super.fireEvent('done', false);
  }

  /**
   * Push a value to the series, firing the 'data' event
   *
   * @param {V} v Value to push
   * @memberof Series
   */
  push(v: V) {
    if (this.#cancelled) throw Error('Series cancelled');
    if (this.#done) throw Error('Series is marked as done');
    this.#lastValue = v;
    super.fireEvent('data', v);
  }

  /**
   * Cancels the series. Fires both 'cancel' and 'done' events,
   * series cannot push data subsequently.
   *
   * @param {string} [cancelReason='Cancelled']
   * @returns
   * @memberof Series
   */
  cancel(cancelReason: string = 'Cancelled') {
    if (this.#done) throw Error('Series cannot be cancelled, already marked done');
    if (this.#cancelled) return;
    this.#cancelled = true;
    this.#done = true;
    super.fireEvent('cancel', cancelReason);
    super.fireEvent('done', true);
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
   * @readonly
   * @type {(V|undefined)}
   * @memberof Series
   */
  get lastValue(): V | undefined {
    return this.#lastValue;
  }
}

const testFromIter = () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const testCancel = false;
  const delay = 2000;
  const interval = 1000;

  console.log(`testFromIter start. Delay: ${delay} Interval: ${interval}`);

  let received = 0;

  const series = Series.fromIterable<number>(numbers, delay, interval);
  series.addEventListener('data', (ev: number) => {
    console.log(` testFromIter event handler: ${ev}`);
    received++;
  })
  series.addEventListener('done', (wasCancelled: boolean) => {
    console.log(` testFromIter done. Was cancelled: ${wasCancelled}`);
    if (received !== numbers.length) throw Error('testFromIter did not get expected number of items');
  });

  if (testCancel) {
    setTimeout(() => {
      series.cancel();
    }, delay + 500);
  }
}

testFromIter();