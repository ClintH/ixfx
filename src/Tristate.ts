/**
 * Returns true if a is more sure than b
 * @param a 
 * @param b 
 * @returns 
 */
export const comparer = (a: Tristate, b: Tristate): number => {
  if (a === b) return 0;
  if (a === `yes`) return -1; // a before b
  if (b === `yes`) return 1;  // b before a
  if (a === `maybe`) return -1; // a before b
  return -1;
};

export type Tristate = `no` | `yes` | `maybe`;