import { numberTest, resultThrow } from "@ixfx/guards"

export const atWrap = <V>(array: V[], index: number) => {
  resultThrow(numberTest(index, ``, `index`));
  if (!Array.isArray(array)) throw new Error(`Param 'array' is not an array`);

  index = index % array.length;
  return array.at(index) as V;
}