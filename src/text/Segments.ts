import { afterMatch, beforeAfterMatch, beforeMatch } from '../Text.js';
/**
 * Returns chunks of `source`, broken up by `delimiter` (default '.').
 * 
 * Whittles down from whole string to last token.
 * 
 * If `delimiter` is not found, no results are yielded.
 * 
 * ```js
 * stringSegmentsWholeToEnd(`a.b.c.d`);
 * // Yields:
 * // `a.b.c.d`
 * // `b.c.d`
 * // `c.d`
 * // `d`
 * ```
 * @param source 
 * @param delimiter 
 */
export function* stringSegmentsWholeToEnd(source: string, delimiter = `.`) {
  while (source.length > 0) {
    yield source;
    const trimmed = afterMatch(source, delimiter);
    if (trimmed === source) {
      // Delimiter not found
      break;
    }
    source = trimmed;
  }
}

/**
 * Returns chunks of `source`, broken up by `delimiter` (default '.').
 * 
 * Starts with last token, builds to whole.
 * 
 * If `delimiter` is not found, no results are yielded.
 * 
 * ````js
 * stringSegmentsLastToWhole(`a.b.c.d`);
 * // Yields:
 * // `d`
 * // `c.d`
 * // `b.c.d`
 * // `a.b.c.d`
 * ```
 * @param source 
 * @param delimiter 
 */
export function* stringSegmentsLastToWhole(source: string, delimiter = `.`) {
  let accumulator = ``;
  const orig = source;
  while (source.length > 0) {
    const ba = beforeAfterMatch(source, delimiter, { fromEnd: true, ifNoMatch: `original` });
    if (ba[ 0 ] === ba[ 1 ] && ba[ 1 ] === source) {
      // Delimiter not found
      break;
    }
    const v = ba[ 1 ] + accumulator;
    yield v;
    accumulator = delimiter + v;
    source = ba[ 0 ];
  }
  yield orig;
}

/**
 * Returns chunks of `source`, broken up by `delimiter` (default '.').
 * 
 * We start with the first token and build up until end.
 * 
 * If `delimiter` is not found, no results are yielded.
 * 
 * ```js
 * stringSegmentsFirstToWhole(`a.b.c.d`);
 * // Yields:
 * // `a`
 * // `a.b`
 * // `a.b.c`
 * // `a.b.c.d`
 * ```
 * @param source 
 * @param delimiter 
 */
export function* stringSegmentsFirstToWhole(source: string, delimiter = `.`) {
  let accumulator = ``;
  const orig = source;
  while (source.length > 0) {
    const ba = beforeAfterMatch(source, delimiter, { ifNoMatch: `original` });
    if (ba[ 0 ] === source && ba[ 1 ] === source) break;
    accumulator += ba[ 0 ];
    yield accumulator;
    accumulator += delimiter;
    source = ba[ 1 ];
  }
  yield orig;
}

/**
 * Returns chunks of `source`, broken up by `delimiter` (default '.').
 * 
 * We start with whole string and whittle down to starting token.
 * 
 * If `delimiter` is not found, no results are yielded.
 * 
 * ```js
 * stringSegmentsWholeToFirst(`a.b.c.d`);
 * // Yields:
 * // `a.b.c.d`
 * // `a.b.c`,
 * // `a.b`,
 * // `a`,
 * ```
 * @param source 
 * @param delimiter 
 */
export function* stringSegmentsWholeToFirst(source: string, delimiter = `.`) {
  while (source.length > 0) {
    yield source;

    const b = beforeMatch(source, delimiter, { ifNoMatch: `original`, fromEnd: true });
    if (b === source) break;
    source = b;
  }
}


