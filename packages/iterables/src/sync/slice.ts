export function* slice<V>(
  it: Iterable<V>,
  start = 0,
  end: number = Number.POSITIVE_INFINITY
): Generator<V, void, unknown> {
  if (end < start) throw new Error(`Param 'end' should be more than 'start'`);
  if (start < 0) throw new Error(`Param 'start' should be at least 0`);
  let index = 0;
  for (const v of it) {
    if (index < start) {
      index++;
      continue;
    }
    if (index > end) {
      break;
    }
    yield v;
    index++;
  }
}