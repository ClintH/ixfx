import { throwNumberTest } from "../../util/GuardNumbers.js"

export const atWrap = <V>(array: Array<V>, index: number) => {
  throwNumberTest(index, ``, `index`);
  if (!Array.isArray(array)) throw new Error(`Param 'array' is not an array`);

  index = index % array.length;
  return array.at(index) as V;
}