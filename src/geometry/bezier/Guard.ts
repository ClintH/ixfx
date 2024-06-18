import type { Path } from "../path/PathType.js";
import type { QuadraticBezier, CubicBezier } from "./BezierType.js";

export const isQuadraticBezier = (path: Path | QuadraticBezier | CubicBezier): path is QuadraticBezier => (path as QuadraticBezier).quadratic !== undefined;

export const isCubicBezier = (path: Path | CubicBezier | QuadraticBezier): path is CubicBezier => (path as CubicBezier).cubic1 !== undefined && (path as CubicBezier).cubic2 !== undefined;
