import type { Circle } from "./CircleType.js";
import { guard } from "./Guard.js";

/**
 * Returns the area of `circle`.
 * @param circle 
 * @returns 
 */
export const area = (circle: Circle) => {
  guard(circle);
  return Math.PI * circle.radius * circle.radius;
};