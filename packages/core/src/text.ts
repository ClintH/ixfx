import { integerTest, resultThrow } from '@ixfx/guards';
//export { string as random } from './random/String.js';

//import { afterMatch, beforeAfterMatch, beforeMatch } from '../Text.js';

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




/**
 * Given a long string, abbreviates it with ...
 * ```js
 * abbreviate(`This is something`, 7); // `This is...`
 * ```
 * 
 * If `source` is under `maxLength` the original is returned.
 * @param source 
 * @param maxLength Maximum length. Defaults to 20
 * @returns 
 */
export const abbreviate = (source: string, maxLength = 15) => {
  resultThrow(integerTest(maxLength, `aboveZero`, `maxLength`));
  if (typeof source !== `string`) throw new Error(`Parameter 'source' is not a string`);

  if (source.length > maxLength && source.length > 3) {
    if (maxLength > 15) {
      const chunk = Math.round((maxLength - 2) / 2);
      return source.slice(0, chunk) + `...` + source.slice(-chunk);
    }
    return source.slice(0, maxLength) + `...`;
  }
  return source;
}

/**
 * Uses JSON.toString() on `source`, but abbreviates result.
 * @param source Object to stringify
 * @param maxLength Default 20
 * @returns 
 */
export const toStringAbbreviate = (source: any, maxLength = 20) => {
  if (source === undefined) return `(undefined)`;
  if (source === null) return `(null)`;
  return abbreviate(JSON.stringify(source), maxLength);
}

/**
 * Returns source text that is between `start` and `end` match strings. Returns _undefined_ if start/end is not found.
 *
 * ```js
 * // Yields ` orange `;
 * between(`apple orange melon`, `apple`, `melon`);
 * ```
 * @param source Source text
 * @param start Start match
 * @param end If undefined, the `start` string will be looked for
 * @param lastEndMatch If true, looks for the last match of `end` (default). If false, looks for the first match.
 * @returns
 */
export const between = (
  source: string,
  start: string,
  end?: string,
  lastEndMatch = true
): string | undefined => {
  // ✔ Unit tested

  const startPos = source.indexOf(start);
  if (startPos < 0) return;

  if (typeof end === `undefined`) end = start;

  const endPos = lastEndMatch
    ? source.lastIndexOf(end)
    : source.indexOf(end, startPos + 1);
  if (endPos < 0) return;

  return source.slice(startPos + 1, endPos);
};

/**
 * Like {@link between}, but also returns the source string without the start/end match and what's between.
 * ```js
 * const [src,between] = betweenChomp('hello [there] friend', '[', ']');
 * // src: 'hello  friend'
 * // between: 'there'
 * ```
 * @param source
 * @param start
 * @param end
 * @param lastEndMatch
 * @returns
 */
export const betweenChomp = (
  source: string,
  start: string,
  end?: string,
  lastEndMatch = true
): [ source: string, between: string | undefined ] => {
  // ✔ Unit tested
  if (typeof source !== `string`) throw new Error(`Parameter 'source' is not a string`);
  if (typeof start !== `string`) throw new Error(`Parameter 'start' is not a string`);
  if (end !== undefined && typeof end !== `string`) throw new Error(`Parameter 'end' is not a string`);
  const startPos = source.indexOf(start);
  if (startPos < 0) return [ source, undefined ];

  if (typeof end === `undefined`) end = start;

  const endPos = lastEndMatch
    ? source.lastIndexOf(end)
    : source.indexOf(end, startPos + 1);
  if (endPos < 0) return [ source, undefined ];

  const between = source.slice(startPos + 1, endPos);
  const sourceResult = source.slice(0, startPos) + source.slice(endPos + 1);
  return [ sourceResult, between ];
};
/**
 * Returns first position of the given character code, or -1 if not found.
 * @param source Source string
 * @param code Code to seek
 * @param start Start index, 0 by default
 * @param end End index (inclusive), source.length-1 by default
 * @returns Found position, or -1 if not found
 */
export const indexOfCharCode = (
  source: string,
  code: number,
  start = 0,
  end = source.length - 1
): number => {
  for (let index = start; index <= end; index++) {
    if (source.codePointAt(index) === code) return index;
  }
  return -1;
};

/**
 * Returns `source` with a given number of characters removed from start position.
 *
 * ```js
 * // Remove three characters starting at position 1
 * omitChars(`hello there`, 1, 3); // ie. removes 'ell'
 * // Yields: `ho there`
 * ```
 * @param source
 * @param removeStart Start point to remove
 * @param removeLength Number of characters to remove
 * @returns
 */
export const omitChars = (
  source: string,
  removeStart: number,
  removeLength: number
) =>
  source.slice(0, removeStart) +
  source.slice(removeStart + removeLength);

/**
 * Splits a string into `length`-size chunks.
 *
 * If `length` is greater than the length of `source`, a single element array is returned with source.
 * The final array element may be smaller if we ran out of characters.
 *
 * ```js
 * splitByLength(`hello there`, 2);
 * // Yields:
 * // [`he`, `ll`, `o `, `th`, `er`, `e`]
 * ```
 * @param source Source string
 * @param length Length of each chunk
 * @returns
 */
export const splitByLength = (
  source: string | null,
  length: number
): readonly string[] => {
  resultThrow(integerTest(length, `aboveZero`, `length`));
  if (source === null) throw new Error(`source parameter null`);
  if (typeof source !== `string`) {
    throw new TypeError(`source parameter not a string`);
  }

  // ✔ Unit tested
  const chunks = Math.ceil(source.length / length);
  const returnValue: string[] = [];
  let start = 0;

  for (let c = 0; c < chunks; c++) {
    returnValue.push(source.slice(start, start + length));
    start += length;
  }
  return returnValue;
};



/**
 * Returns the `source` string up until (and excluding) `match`. 
 * 
 * By default, if match is not found, all of `source` is returned.
 *
 * ```js
 * // Yields `apple `
 * untilMarch(`apple orange melon`, `orange`);
 * ```
 * 
 * If match is not found, fallback can be returned instead:
 * ```js
 * // Yields 'lemon'
 * untilMatch(`apple orange mellon`, `kiwi`, { fallback: `lemon` });
 * ```
 * 
 * Or an exception thrown
 * ```js
 * // Throws
 * untilMatch(`apple orange mellon`, `kiwi`, { ifNoMatch: `throw` });
 * ```
 * @param source
 * @param match
 * @param startPos If provided, gives the starting offset. Default 0
 */
// export const untilMatch = (
//   source: string,
//   match: string,
//   options: Partial<UntilMatchOptions> = {}
// ): string => {
//   //  ✔️ Unit tested
//   let fallback = options.fallback;
//   const ifNoMatch = options.ifNoMatch ?? (fallback ? `fallback` : `original`);
//   if (ifNoMatch === `original`) fallback = source;
//   if (ifNoMatch === `fallback` && fallback === undefined) throw new Error(`Fallback must be provided`);
//   const startPos = options.startPos ?? undefined;
//   const fromEnd = options.fromEnd ?? false;
//   const m = fromEnd
//     ? source.lastIndexOf(match, startPos)
//     : source.indexOf(match, startPos);

//   if (m < 0) {
//     if (ifNoMatch === `throw`) throw new Error(`Match string not found in source`);
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     return fallback!;
//   }
//   return source.slice(startPos ?? 0, m);
// };


// export type UntilMatchOptions = MatchOptions & {
//   ifNoMatch: `throw` | `original` | `fallback`,
//   fallback?: string
// }

export type MatchOptions = {
  startPos: number;
  fromEnd: boolean;
  ifNoMatch: `throw` | `original` | `fallback`,
  fallback: string
}

// export const afterMatch = (
//   source: string,
//   match: string,
//   options: MatchOptions = {}
// ): string => {
//   if (source === undefined) throw new Error(`Param 'source' is undefined`);

//   //  ✔️ Unit tested
//   const startPos = options.startPos ?? undefined;
//   const fromEnd = options.fromEnd ?? false;

//   const m = fromEnd
//     ? source.lastIndexOf(match, startPos)
//     : source.indexOf(match, startPos);

//   if (m < 0) return source;
//   return source.slice(Math.max(0, m + match.length));
// };

/**
 * Returns all the text in `source` that precedes (and does not include) `match`. If not found, `source` is returned.
 * 
 * See also: {@link beforeMatch}, {@link beforeAfterMatch}.
 * 
 * ```js
 * afterMatch(`Hello. There`, `.`); // ' There'
 * afterMatch(`Hello, there', `,`); // 'Hello, there'
 * ```
 * 
 * If `source` is _undefined_, an error is thrown.
 * @param source
 * @param match
 * @param options
 * @returns
 */
export const beforeMatch = (
  source: string,
  match: string,
  options: Partial<MatchOptions> = {}
): string => {
  const ba = beforeAfterMatch(source, match, options);
  return ba[ 0 ];
}

/**
 * Returns all the text in `source` that follows `match`. If not found, `source` is returned.
 * 
 * See also: {@link beforeMatch}, {@link beforeAfterMatch}.
 * 
 * ```js
 * afterMatch(`Hello. There`, `.`); // ' There'
 * afterMatch(`Hello, there', `,`); // 'Hello, there'
 * ```
 * 
 * If `source` is _undefined_, an error is thrown.
 * @param source
 * @param match
 * @param options
 * @returns
 */
export const afterMatch = (
  source: string,
  match: string,
  options: Partial<MatchOptions> = {}
): string => {
  const ba = beforeAfterMatch(source, match, options);
  return ba[ 1 ];
}

/**
 * Returns the text that is before and after `match`.
 * 
 * See also: {@link beforeMatch}, {@link afterMatch}.
 * 
 * If `match` is at the end of start of `source`, after or before might be an empty string.
 * @param source 
 * @param match 
 * @param options 
 * @returns 
 */
export const beforeAfterMatch = (source: string, match: string, options: Partial<MatchOptions> = {}): [ before: string, after: string ] => {
  if (source === undefined) throw new Error(`Param 'source' is undefined`);

  let fallback = options.fallback;
  const ifNoMatch = options.ifNoMatch ?? (fallback ? `fallback` : `original`);
  if (ifNoMatch === `original`) fallback = source;
  if (ifNoMatch === `fallback` && fallback === undefined) throw new Error(`Fallback must be provided`);

  const startPos = options.startPos ?? undefined;
  const fromEnd = options.fromEnd ?? false;

  const m = fromEnd
    ? source.lastIndexOf(match, startPos)
    : source.indexOf(match, startPos);

  if (m < 0 && ifNoMatch === `throw`) throw new Error(`Match '${ match }' not found in source.`);
  if (m < 0 && ifNoMatch === `original`) return [ source, source ];
  if (m < 0 && ifNoMatch === `fallback`) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return [ fallback!, fallback! ];
  }
  return [
    source.slice(0, m),
    source.slice(Math.max(0, m + match.length))
  ]
}
/**
 * 'Unwraps' a string, removing one or more 'wrapper' strings that it starts and ends with.
 * Only removes when a matching end is found.
 * ```js
 * unwrap("'hello'", "'");        // hello
 * // No mataching end 'a', so nothing happens
 * unwrap("apple", "a");          // apple
 * unwrap("wow", "w");            // o
 * unwrap(`"'blah'"`, '"', "'");  // blah
 * ```
 * @param source
 * @param wrappers
 * @returns
 */
export const unwrap = (
  source: string,
  ...wrappers: readonly string[]
): string => {
  let matched = false;
  do {
    matched = false;
    for (const w of wrappers) {
      if (source.startsWith(w) && source.endsWith(w)) {
        source = source.slice(w.length, source.length - w.length * 2 + 1);
        matched = true;
      }
    }
  } while (matched);

  return source;
};

/**
 * A range
 */
export type Range = {
  /**
   * Text of range
   */
  readonly text: string;
  /**
   * Start position, with respect to source text
   */
  readonly start: number;
  /**
   * End position, with respect to source text
   */
  readonly end: number;
  /**
   * Index of range. First range is 0
   */
  readonly index: number;
}

export type LineSpan = {
  readonly start: number;
  readonly end: number;
  readonly length: number;
}

/**
 * Calculates the span, defined in {@link Range} indexes, that includes `start` through to `end` character positions.
 *
 * After using {@link splitRanges} to split text, `lineSpan` is used to associate some text coordinates with ranges.
 *
 * @param ranges Ranges
 * @param start Start character position, in source text reference
 * @param end End character position, in source text reference
 * @returns Span
 */
export const lineSpan = (
  ranges: readonly Range[],
  start: number,
  end: number
): LineSpan => {
  let s = -1;
  let endPos = -1;
  for (const [ index, r ] of ranges.entries()) {
    s = index;
    if (r.text.length === 0) continue;
    if (start < r.end) {
      break;
    }
  }

  for (let index = s; index < ranges.length; index++) {
    const r = ranges[ index ];
    endPos = index;
    if (end === r.end) {
      endPos = index + 1;
      break;
    }
    if (end < r.end) {
      break;
    }
  }
  return { length: endPos - s, start: s, end: endPos };
};

/**
 * Splits a source string into ranges:
 * ```js
 * const ranges = splitRanges("hello;there;fella", ";");
 * ```
 *
 * Each range consists of:
 * ```js
 * {
 *  text: string  - the text of range
 *  start: number - start pos of range, wrt to source
 *  end: number   - end pos of range, wrt to source
 *  index: number - index of range (starting at 0)
 * }
 * ```
 * @param source
 * @param split
 * @returns
 */
export const splitRanges = (
  source: string,
  split: string
): readonly Range[] => {
  let start = 0;
  let text = ``;
  const ranges: Range[] = [];
  let index = 0;
  for (let index_ = 0; index_ < source.length; index_++) {
    if (source.indexOf(split, index_) === index_) {
      const end = index_;
      ranges.push({
        text,
        start,
        end,
        index,
      });
      start = end + 1;
      text = ``;
      index++;
    } else {
      text += source.charAt(index_);
    }
  }
  if (start < source.length) {
    ranges.push({ text, start, index, end: source.length });
  }
  return ranges;
};

/**
 * Counts the number of times one of `chars` appears at the front of
 * a string, contiguously.
 *
 * ```js
 * countCharsFromStart(`  hi`, ` `); // 2
 * countCharsFromStart(`hi  `, ` `); // 0
 * countCharsFromStart(`  hi  `, ` `); // 2
 * ```
 * @param source
 * @param chars
 * @returns
 */
export const countCharsFromStart = (
  source: string,
  ...chars: readonly string[]
): number => {
  let counted = 0;
  for (let index = 0; index < source.length; index++) {
    if (chars.includes(source.charAt(index))) {
      counted++;
    } else {
      break;
    }
  }
  return counted;
};

/**
 * Returns _true_ if `source` starts and ends with `start` and `end`. Case-sensitive.
 * If _end_ is omitted, the the `start` value will be used.
 *
 * ```js
 * startsEnds(`This is a string`, `This`, `string`); // True
 * startsEnds(`This is a string`, `is`, `a`); // False
 * starsEnds(`test`, `t`); // True, starts and ends with 't'
 * ```
 * @param source String to search within
 * @param start Start
 * @param end End (if omitted, start will be looked for at end as well)
 * @returns True if source starts and ends with provided values.
 */
export const startsEnds = (
  source: string,
  start: string,
  end: string = start
): boolean => source.startsWith(start) && source.endsWith(end);


export const htmlEntities = (source: string): string =>
  source.replaceAll(/[&<>\u00A0-\u9999]/g, (index) => `&#${ index.codePointAt(0) };`);


/**
 * Simple wilcard matching. Use '*' in `pattern` to denote any number of characters.
 * ```js
 * // Must start with 'cat'
 * wildcard(`cat*`,`caterpillar`); // true
 * // Must end with 'cat'
 * wildcat(`*cat`, `bobcat`);  // true
 * // 'cat' anywhere in string
 * wildcard(`*cat*`, `see cat run`); // true
 * ```
 * @param pattern 
 * @returns 
 */
export const wildcard = (pattern: string) => {
  // Based on source: https://stackoverflow.com/questions/26246601/wildcard-string-comparison-in-javascript
  // for this solution to work on any string, no matter what characters it has
  const escapeRegex = (value: string) => value.replaceAll(/([!$()*+./:=?[\\\]^{|}])/g, `\\$1`);

  // "."  => Find a single character, except newline or line terminator
  // ".*" => Matches any string that contains zero or more characters
  pattern = pattern.split(`*`).map(m => escapeRegex(m)).join(`.*`);

  // "^"  => Matches any string with the following at the beginning of it
  // "$"  => Matches any string with that in front at the end of it
  pattern = `^` + pattern + `$`

  // Create a regular expression object for matching string
  const regex = new RegExp(pattern);

  return (value: string) => {
    // Returns true if it finds a match, otherwse it returns false
    return regex.test(value);
  }
}