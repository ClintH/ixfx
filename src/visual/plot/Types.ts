import type { Point } from "src/geometry/point/PointType.js"

export type TextStyle = {
  font: string
  colour: string
  size: string
}

export type LineStyle = {
  colour: string
  width: number
}

export type GridStyle = LineStyle & {
  increments: number,
  major: number
}

export type ShowOptions = {
  axes: boolean
  axisValues: boolean
  grid: boolean
  whiskers: boolean
}


export type SeriesMeta = {
  colour: string
  lineWidth: number
  dotRadius: number
}