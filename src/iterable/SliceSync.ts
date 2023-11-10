/**
 * Returns a section from an iterable
 * @param it Iterable
 * @param start Start index
 * @param end End index (or until completion)
 */
//eslint-disable-next-line func-style
export function* slice<V>(
  it: Iterable<V>,
  start = 0,
  end = Number.POSITIVE_INFINITY
) {
  // https://surma.github.io/underdash/
  const iit = it[ Symbol.iterator ]();

  for (; start > 0; start--, end--) iit.next();

  for (const v of it) {
    if (end-- > 0) {
      yield v;
    } else {
      break;
    }
  }
}
