import { HistogramVis } from './HistogramVis.js';
import * as KeyValueUtil from '../util/KeyValue.js';
import type { KeyValue } from '../PrimitiveTypes.js';

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
  readonly el: HistogramVis | undefined;
  #sorter: KeyValueUtil.KeyValueSorter | undefined;
  constructor(el: HistogramVis) {
    this.el = el;
  }

  setAutoSort(
    sortStyle: `value` | `value-reverse` | `key` | `key-reverse`
  ): void {
    this.#sorter = KeyValueUtil.getSorter(sortStyle);
  }

  clear() {
    if (this.el === undefined) return;
    this.el.data = [];
  }

  // init() {
  //   if (this.el !== undefined) return; // already inited
  //   // eslint-disable-next-line functional/immutable-data
  //   this.el = document.createElement(`histogram-vis`);
  //   this.parentEl.appendChild(this.el);
  // }

  dispose() {
    const el = this.el;
    if (el === undefined) return; // already disposed
    el.remove();
  }

  update(data: ReadonlyArray<readonly [ key: string, count: number ]>) {
    if (this.el === undefined) {
      console.warn(`FrequencyHistogramPlot this.el undefined`);
      return;
    }

    this.el.data = this.#sorter === undefined ? [ ...data ] : this.#sorter(data as Array<KeyValue>);
  }
}
