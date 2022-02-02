import { HistogramVis } from './HistogramVis.js';
import * as KeyValueUtil from '../KeyValue.js';

/**
 * Creates and drives a HistogramVis instance.
 * Data should be an outer array containing two-element arrays for each
 * data point. The first element of the inner array is expected to be the key, the second the frequency.
 * For example,  `[`apples`, 2]` means the key `apples` was counted twice.
 * 
 * Usage:
 * .sortBy() automatically sorts prior to visualisation. By default off.
 * .update(data) full set of data to plot
 * .clear() empties plot - same as calling `update([])`
 * .el - The `HistogramVis` instance, or undefined if not created/disposed
 * 
 * ```
 * const plot = new FrequencyHistogramPlot(document.getElementById('histogram'));
 * plot.sortBy('key'); // Automatically sort by key
 * ...
 * plot.update([[`apples`, 2], [`oranges', 0], [`bananas`, 5]])
 * ```
 *
 * @export
 * @class FrequencyHistogramPlot
 */
export class FrequencyHistogramPlot {
  readonly parentEl:HTMLElement;
  // eslint-disable-next-line functional/prefer-readonly-type
  el:HistogramVis|undefined;
  // eslint-disable-next-line functional/prefer-readonly-type
  #sorter:KeyValueUtil.SortingFn|undefined;

  constructor(parentEl: HTMLElement) {
    console.log(`FreqHistoPlot`);
    this.parentEl = parentEl;
    this.init();
  }

  setAutoSort(sortStyle:`value` | `valueReverse` | `key` | `keyReverse`):void {
    switch (sortStyle) {
    case `value`:
      // eslint-disable-next-line functional/immutable-data
      this.#sorter = KeyValueUtil.sortByValueNumber(false);
      break;
    case `valueReverse`:
      // eslint-disable-next-line functional/immutable-data
      this.#sorter = KeyValueUtil.sortByValueNumber(true);
      break;
    case `key`:
      // eslint-disable-next-line functional/immutable-data
      this.#sorter = KeyValueUtil.sortByKey(false);
      break;
    case `keyReverse`:
      // eslint-disable-next-line functional/immutable-data
      this.#sorter = KeyValueUtil.sortByKey(true);
      break;
    default:
      throw new Error(`Unknown sorting value '${sortStyle}'. Expecting: value, valueReverse, key or keyReverse`);
    }
  }

  clear() {
    if (this.el === undefined) return;
    // eslint-disable-next-line functional/immutable-data
    this.el.data = [];
  }

  init() {
    if (this.el !== undefined) return; // already inited
    // eslint-disable-next-line functional/immutable-data
    this.el = document.createElement(`histogram-vis`);
    this.parentEl.appendChild(this.el);
  }

  dispose() {
    const el = this.el;
    if (el === undefined) return; // already disposed
    el.remove();
  }

  update(data:ReadonlyArray<readonly [key:string, count:number]>) {
    if (this.el === undefined) return;
    if (this.#sorter !== undefined) {
      // eslint-disable-next-line functional/immutable-data, functional/prefer-readonly-type
      this.el.data = this.#sorter(data as KeyValueUtil.KeyValue[]);
    } else {
      // eslint-disable-next-line functional/immutable-data
      this.el.data  = [...data];
    }
  }
}
