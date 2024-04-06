/**
 * Returns true if `possibleNumber` is a number and not NaN
 * @param possibleNumber
 * @returns
 */
export const isValid = (possibleNumber: unknown) => {
  if (typeof possibleNumber !== `number`) return false;
  if (Number.isNaN(possibleNumber)) return false;
  return true;
};