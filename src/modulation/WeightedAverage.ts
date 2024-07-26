/**
 * Weighted average
 * 
 * @param currentValue 
 * @param targetValue 
 * @param slowDownFactor 
 * @returns 
 */
export const weightedAverage = (currentValue: number, targetValue: number, slowDownFactor: number) => {
  return ((currentValue * (slowDownFactor - 1)) + targetValue) / slowDownFactor
}