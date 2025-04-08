import type { Point, Point3d } from "../point/point-type.js";

/**
 * Rectangle as array: `[width, height]`
 */
export type RectArray = readonly [ width: number, height: number ];

/**
 * Positioned rectangle as array: `[x, y, width, height]`
 */
export type RectPositionedArray = readonly [
  x: number,
  y: number,
  width: number,
  height: number
];
export type Rect = {
  readonly width: number;
  readonly height: number;
};

export type Rect3d = Rect & {
  readonly depth:number
}

export type RectPositioned = Point & Rect;
export type Rect3dPositioned = Point3d & Rect3d;
