import { intervalToMs, type Interval } from "@ixfx/core";

export const debounce = (
  callback: () => void,
  interval: Interval | undefined
) => {
  let timer;
  const ms = intervalToMs(interval, 100);
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (timer) clearTimeout(timer);
    timer = setTimeout(callback, ms);
  }
}