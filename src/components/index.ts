export * from './FrequencyHistogramPlot.js';
export * from './HistogramVis.js';
import { PlotElement, PlotSeries } from './PlotElement.js';
export * from './PlotElement.js';

export function init() {
  try {
    customElements.define(`plot-element`, PlotElement);
  } catch {}
}

declare global {
  interface HTMLElementTagNameMap {
    "plot-element": PlotElement;
  }
}