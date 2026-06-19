/**
 * Returns true if `possibleNumber` is a number and not NaN
 * @param possibleNumber
 * @returns _True_ if is a number and not NaN
 */
export function isValid(possibleNumber: unknown): boolean {
  if (typeof possibleNumber !== `number`)
    return false;
  if (Number.isNaN(possibleNumber))
    return false;
  return true;
}
