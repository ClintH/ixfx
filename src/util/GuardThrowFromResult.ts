import type { GuardResultFail, GuardResultOk } from "./GuardTypes.js";

export const throwFromResult = (test: GuardResultFail | GuardResultOk) => {
  if (test[ 0 ]) return false;
  else throw new Error(test[ 1 ]);
}