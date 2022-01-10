import { HistogramVis, HistogramBar } from "../dom/Histogram.js";

export enum AutoSort {
  None,
  Function,
  Key,
  Value,
  ValueReverse
}

type SortFn = (a: HistogramBar, b: HistogramBar) => number;

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
  el:HistogramVis|undefined;
  #autoSort:AutoSort = AutoSort.None;
  #sortFn:SortFn|undefined;

  constructor(parentEl: HTMLElement) {
    this.parentEl = parentEl;
    this.init();
  }

  sortBy(sortFnOrAutoSort:SortFn|AutoSort|string):void {
    if (typeof sortFnOrAutoSort === `number`) {
      this.#autoSort = sortFnOrAutoSort;
    } else if (typeof sortFnOrAutoSort === `string`) {
      switch (sortFnOrAutoSort.toLocaleLowerCase()) {
      case `none`:
        return this.sortBy(AutoSort.None);
      case `function`:
        throw new Error(`Expected function to be passed in, not string`);
      case `key`:
        return this.sortBy(AutoSort.Key);
      case `value`:
        return this.sortBy(AutoSort.Key);
      case `valuereverse`:
        return this.sortBy(AutoSort.ValueReverse);
      default:
        throw new Error(`Unknown sort by type ${sortFnOrAutoSort}`);
      }
    } else {
      this.#autoSort = AutoSort.Function;
      this.#sortFn = sortFnOrAutoSort;
    }
  }

  clear() {
    if (this.el === undefined) return;
    this.el.data = [];
  }

  init() {
    if (this.el !== undefined) return; // already inited
    this.el = document.createElement(`histogram-vis`);
    this.parentEl.appendChild(this.el);
  }

  dispose() {
    const el = this.el;
    if (el === undefined) return; // already disposed
    el.remove();
  }

  update(data:[key:string, count:number][]) {
    if (this.el === undefined) return;

    let d:HistogramBar[] = data.map(bar => ({key: bar[0], size: bar[1]}));
    switch (this.#autoSort) {
    case AutoSort.Function:
      if (this.#sortFn === undefined) throw new Error(`Sort function not provided`);
      d = d.sort(this.#sortFn);
      break;
    case AutoSort.Key:
      d = d.sort((a, b) => a.key.localeCompare(b.key, undefined, {numeric:true, sensitivity:`base`}));
      break;
    case AutoSort.Value:
      d = d.sort((a, b) => {
        if (a.size === b.size) return 0;
        if (a.size < b.size) return 1;
        return -1;
      });
      break;
    case AutoSort.ValueReverse:
      d = d.sort((a, b) => {
        if (a.size === b.size) return 0;
        if (a.size < b.size) return -1;
        return 1;
      });
      break;
    }
    this.el.data = d;
  }
}