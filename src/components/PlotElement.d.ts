import { LitElement, type PropertyValues } from "lit";
import { type Ref } from "lit/directives/ref.js";
import { CanvasHelper } from "@ixfx/visual";
import type { Rect, RectPositioned } from "@ixfx/geometry/rect";
import * as Numbers from '@ixfx/numbers';
import type { Colourish } from "@ixfx/visual/colour";
import type { DrawingHelper } from "@ixfx/visual/drawing";
import { Colour } from "@ixfx/visual";
/**
 * Attributes
 * * streaming: true/false (default: true)
 * * max-length: number (default: 500). How many data points per series to store
 * * data-width: when streaming, how much horizontal width per point
 * * fixed-max/fixed-min: global input scaling (default: NaN, ie. disabled)
 *
 * * line-width: stroke width of drawing line (default:2)
 *
 * * render: 'dot' or 'line' (default: 'dot')
 * * hide-legend: If added, legend is not shown
 * * manual-draw: If added, automatic drawning is disabled
 *
 * Styling variables
 * * --legend-fg: legend foreground text
 */
export declare class PlotElement extends LitElement {
    #private;
    accessor streaming: boolean;
    accessor hideLegend: boolean;
    accessor maxLength: number;
    accessor dataWidth: number;
    accessor fixedMax: number;
    accessor fixedMin: number;
    accessor lineWidth: number;
    accessor renderStyle: string;
    accessor manualDraw: boolean;
    padding: number;
    paused: boolean;
    canvasEl: Ref<HTMLCanvasElement>;
    seriesRanges: Map<string, [min: number, max: number]>;
    get series(): PlotSeries[];
    get seriesCount(): number;
    /**
     * Returns a `PlotElement` instance based on a query
     * ```js
     * PlotElement.fromQuery(`#someplot`); // PlotElement
     * ```
     *
     * Throws an error if query does not match.
     * @param query
     * @returns
     */
    static fromQuery(query: string): PlotElement;
    /**
     * Delete a series.
     * Returns _true_ if there was a series to delete
     * @param name
     * @returns
     */
    deleteSeries(name: string): boolean;
    /**
     * Keeps the series, but deletes its data
     * @param name
     * @returns
     */
    clearSeries(name: string): boolean;
    /**
     * Delete all data & series
     */
    clear(): void;
    /**
     * Keeps all series, but deletes their data
     */
    clearData(): void;
    render(): any;
    connectedCallback(): void;
    protected firstUpdated(_changedProperties: PropertyValues): void;
    updateColours(): void;
    plot(value: number, seriesName?: string, skipDrawing?: boolean): PlotSeries;
    /**
     * Draw a set of key-value pairs as a batch.
     * @param value
     */
    plotObject(value: object): void;
    colourGenerator(series: string): Colour.Colourish;
    draw(): void;
    drawLegend(cl: RectPositioned, d: DrawingHelper): void;
    drawLineSeries(data: number[], cp: Rect, d: DrawingHelper, colour: string): void;
    drawDotSeries(data: number[], cp: Rect, d: DrawingHelper, colour: string): void;
    computePlot(c: CanvasHelper, plotHeight: number, axisYwidth: number, padding: number): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    computeAxisYWidth(c: CanvasHelper): number;
    computeLegend(c: CanvasHelper, maxWidth: number, padding: number): {
        bounds: {
            width: number;
            height: number;
        };
        parts: RectPositioned[];
    };
    getSeries(name: string): PlotSeries | undefined;
    static styles: any;
}
export declare class PlotSeries {
    name: string;
    colour: Colourish;
    private plot;
    data: number[];
    minSeen: number;
    maxSeen: number;
    constructor(name: string, colour: Colourish, plot: PlotElement);
    clear(): void;
    /**
     * Returns a copy of the data scaled by the current
     * range of the data
     * @returns
     */
    getScaled(): any[];
    getScaledBy(scaler: Numbers.NumberScaler): any[];
    push(value: number): void;
    resetScale(): void;
}
//# sourceMappingURL=PlotElement.d.ts.map