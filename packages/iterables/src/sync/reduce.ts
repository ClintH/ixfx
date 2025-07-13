export function reduce<V>(
  it: Iterable<V>,
  f: (accumulator: V, current: V) => V,
  start: V
) {
  // https://surma.github.io/underdash/

  for (const v of it) start = f(start, v);
  return start;
}
