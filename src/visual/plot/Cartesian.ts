
import { scaler } from "../../numbers/Scale.js";
import type { Point } from "../../geometry/point/PointType.js";
import type { GridStyle, LineStyle, ShowOptions, TextStyle } from "./Types.js";
import type { ScaleBy } from "../../geometry/Scaler.js";
import type { ElementResizeLogic } from "../../dom/ElementSizing.js";

export type PointMinMax = { min: Point, max: Point, width: number, height: number, minDim: number, maxDim: number };

export type PlotPoint = Point & {
  fillStyle?: string
  radius?: number
}

export type CartesianScaler = (pt: Point) => Point;

export type CartesianDataRange = {
  /**
   * Converts a data value to relative value (0..1)
   */
  valueToRelative: CartesianScaler
  /**
   * Converts a relative value to element-based coordinates
   * (ie 0,0 is top-left of CANVAS)
   */
  relativeToElementSpace: CartesianScaler
  /**
   * Converts canvas coordinate to relative
   */
  elementSpaceToRelative: CartesianScaler,
  /**
   * Converts relative coordinate to value
   */
  relativeToValue: CartesianScaler
  range: PointMinMax
}


export type CartesianPlotOptions = {
  canvasWidth: number
  canvasHeight: number
  canvasResize: ElementResizeLogic
  coordinateScale: ScaleBy
  show: Partial<ShowOptions>
  /**
   * If 'auto' (default), range of plot is based on data.
   * Otherwise specify the range, eg:
   * `{ min: {x:-1,y:-1}, {x:1,y:1}}`
   * 
   */
  range: `auto` | { min: Point, max: Point }
  /**
   * Margin around whole plot area. Use
   * to avoid dots being cut off by edge of canvas
   */
  margin: number
  /**
   * Gridline setting
   */
  grid: Partial<GridStyle>
  /**
   * Drawing settings for axis (if 'showAxes' is enabled)
   */
  axisStyle: LineStyle
  /**
   * How values are drawn. Default: 'dot'
   */
  valueStyle: `dot` | ``,
  /**
   * How values are connected. Default: '' (no connecting)
   * Values are connected in order of dataset.
   */
  connectStyle: `` | `line`,
  textStyle: TextStyle
  whiskerLength: number
}

export const computeMinMax = (mm: Array<Point>): PointMinMax => {
  const x = mm.map(m => m.x);
  const y = mm.map(m => m.y);
  const minX = Math.min(...x);
  const maxX = Math.max(...x);
  const minY = Math.min(...y);
  const maxY = Math.max(...y);
  const width = maxX - minX;
  const height = maxY - minY;

  return {
    min: { x: minX, y: minY },
    max: { x: maxX, y: maxY },
    width, height,
    minDim: Math.min(width, height),
    maxDim: Math.max(width, height)
  }
}

export const relativeCompute = (minMax: PointMinMax) => {
  const xScale = scaler(minMax.min.x, minMax.max.x);
  const yScale = scaler(minMax.min.y, minMax.max.y);
  return (point: Point) => ({
    x: xScale(point.x),
    y: yScale(point.y)
  });
}

export const absoluteCompute = (minMax: PointMinMax) => {
  const xScale = scaler(0, 1, minMax.min.x, minMax.max.x);
  const yScale = scaler(0, 1, minMax.min.y, minMax.max.y);
  return (point: Point) => ({
    x: xScale(point.x),
    y: yScale(point.y)
  });
}

export type AxisMark = Point & {
  major: boolean
}
export const computeAxisMark = (mm: PointMinMax, increments: number, major: number): { x: Array<AxisMark>, y: Array<AxisMark> } => {
  // Vertical
  const xValues: Array<AxisMark> = [];
  let count = 0;

  for (let x = mm.min.x; x < mm.max.x; x += increments) {
    const isMajor = count % major === 0;
    xValues.push({ x, y: 0, major: isMajor });
    count++;
  }

  // Horizontal
  count = 0;
  const yValues: Array<AxisMark> = [];
  for (let y = mm.min.y; y < mm.max.y; y += increments) {
    const isMajor = count % major === 0;
    yValues.push({ x: 0, y, major: isMajor })
    count++;
  }
  return { x: xValues, y: yValues }
}