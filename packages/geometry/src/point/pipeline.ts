import type { Point } from "./point-type.js";

/**
 * Runs a sequential series of functions on `pt`. The output from one feeding into the next.
 * 
 * ```js
 * const p = Points.pipelineApply(somePoint, Points.normalise, Points.invert);
 * ```
 *
 * If you want to make a reusable pipeline of functions, consider {@link pipeline} instead.
 * @param point
 * @param pipelineFns
 * @returns
 */
export const pipelineApply = (
  point: Point,
  ...pipelineFns: readonly ((pt: Point) => Point)[]
): Point => pipeline(...pipelineFns)(point); // pipeline.reduce((prev, curr) => curr(prev), pt);

/**
 * Returns a pipeline function that takes a point to be transformed through a series of functions
 * ```js
 * // Create pipeline
 * const p = Points.pipeline(Points.normalise, Points.invert);
 *
 * // Now run it on `somePoint`.
 * // First we normalised, and then invert
 * const changedPoint = p(somePoint);
 * ```
 *
 * If you don't want to create a pipeline, use {@link pipelineApply}.
 * @param pipeline Pipeline of functions
 * @returns
 */
export const pipeline =
  (...pipeline: readonly ((pt: Point) => Point)[]) =>
    (pt: Point): Point =>

      pipeline.reduce((previous, current) => current(previous), pt);
