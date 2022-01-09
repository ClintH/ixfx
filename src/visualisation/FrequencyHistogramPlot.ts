import { HistogramVis, HistogramBar } from "../dom/Histogram.js";

export enum AutoSort {
  None,
  Function,
  Key,
  Value,
  ValueReverse
}

type SortFn = (a: HistogramBar, b: HistogramBar) => number;

export class FrequencyHistogramPlot {
  readonly parentEl:HTMLElement;
  el:HistogramVis|undefined;
  #autoSort:AutoSort = AutoSort.None;
  #sortFn:SortFn|undefined;

  constructor(parentEl: HTMLElement) {
    this.parentEl = parentEl;
  }

  sortBy(sortFnOrAutoSort:SortFn|AutoSort) {
    if (typeof sortFnOrAutoSort === `number`) {
      this.#autoSort = sortFnOrAutoSort;
    } else {
      this.#autoSort = AutoSort.Function;
      this.#sortFn = sortFnOrAutoSort;
    }
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