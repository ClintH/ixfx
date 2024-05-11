import { numberTest, throwNumberTest } from "src/Guards.js";

export type CycleOptions = {
  min: number
  max: number
}

export const cycler = (options: Partial<CycleOptions> = {}) => {
  const min = options.min ?? 0;
  const max = options.max ?? 1;

  return (progress: number) => {
    throwNumberTest(progress, `positive`, `progress`);
    progress = progress % 1;

  }
}