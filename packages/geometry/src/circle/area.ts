import type { Circle } from "./circle-type.js";
import { guard } from "./guard.js";

/**
 * Returns the area of `circle`.
 * @param circle 
 * @returns 
 */
export const area = (circle: Circle): number => {
  guard(circle);
  return Math.PI * circle.radius * circle.radius;
};