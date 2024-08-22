export function* slice<V>(
  it: Iterable<V>,
  start = 0,
  end = Number.POSITIVE_INFINITY
) {
  // https://surma.github.io/underdash/
  const iit = it[ Symbol.iterator ]();
  if (end < start) throw new Error(`Param 'end' should be more than 'start'`);

  for (; start > 0; start--, end--) iit.next();

  for (const v of it) {
    if (end-- > 0) {
      yield v;
    } else {
      break;
    }
  }
}