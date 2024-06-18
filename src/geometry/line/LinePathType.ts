import type { Path } from "../path/PathType.js"
import type { Point } from "../point/PointType.js"
import type { Line } from "./LineType.js"

export type LinePath = Line & Path & {
  toFlatArray(): ReadonlyArray<number>
  toPoints(): ReadonlyArray<Point>
  rotate(amountRadian: number, origin: Point): LinePath
  sum(point: Point): LinePath
  divide(point: Point): LinePath
  multiply(point: Point): LinePath
  subtract(point: Point): LinePath
  apply(fn: (point: Point) => Point): LinePath
  midpoint(): Point
  parallel(distance: number): Line
  perpendicularPoint(distance: number, amount?: number): Point
  slope(): number
  withinRange(point: Point, maxRange: number): boolean
  isEqual(otherLine: Line): boolean
}