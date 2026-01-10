import { Rect, RectPositioned } from "./rect-types.js";

export const Empty: Rect = Object.freeze({ width: 0, height: 0 });
export const EmptyPositioned: RectPositioned = Object.freeze({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

export const Placeholder: Rect = Object.freeze({
  width: Number.NaN,
  height: Number.NaN,
});
export const PlaceholderPositioned: RectPositioned = Object.freeze({
  x: Number.NaN,
  y: Number.NaN,
  width: Number.NaN,
  height: Number.NaN,
});
