import {integer} from './Guards.js';
import { string as random } from './Random.js';

export { random };

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
export const between = (source:string, start:string, end?:string, lastEndMatch = true):string | undefined => {
  // ✔ Unit tested

  const startPos = source.indexOf(start);
  if (startPos < 0) return;

  if (end === undefined) end = start;

  const endPos = lastEndMatch ? source.lastIndexOf(end) : source.indexOf(end, startPos+1);
  if (endPos < 0) return;

  return source.substring(startPos+1, endPos);
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
export const betweenChomp = (source:string, start:string, end?:string, lastEndMatch = true):[source:string,between:string|undefined] => {
  // ✔ Unit tested
  const startPos = source.indexOf(start);
  if (startPos < 0) return [source, undefined];

  if (end === undefined) end = start;

  const endPos = lastEndMatch ? source.lastIndexOf(end) : source.indexOf(end, startPos+1);
  if (endPos < 0) return [source, undefined];

  const between = source.substring(startPos+1, endPos);
  const src = source.substring(0, startPos) + source.substring(endPos+1);
  return [src,between];
};
/**
 * Returns first position of the given character code, or -1 if not found.
 * @param source Source string
 * @param code Code to seek
 * @param start Start index, 0 by default
 * @param end End index (inclusive), source.length-1 by default
 * @returns Found position, or -1 if not found
 */
export const indexOfCharCode = (source:string, code:number, start = 0, end = source.length-1):number => {
  //eslint-disable-next-line functional/no-let
  for (let i=start;i<=end;i++) {
    if (source.charCodeAt(i) === code) return i;
  }
  return -1;
};

/**
 * Returns `source` with a given number of characters removed from a start position.
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
export const omitChars = (source:string, removeStart:number, removeLength:number) =>  source.substring(0, removeStart) + source.substring(removeStart+removeLength);

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
export const splitByLength = (source:string, length:number):readonly string[] => {
  integer(length, 'aboveZero', 'length');
  if (source === null) throw new Error('source parameter null');
  if (typeof source !== 'string') throw new Error('source parameter not a string');

  // ✔ Unit tested
  const chunks = Math.ceil(source.length/length);
  const ret:string[] = [];
  //eslint-disable-next-line functional/no-let
  let start = 0;

  //eslint-disable-next-line functional/no-let  
  for (let c=0;c<chunks;c++) {
    //eslint-disable-next-line functional/immutable-data
    ret.push(source.substring(start, start+length));
    start += length;
  }
  return ret;
};

/**
 * Returns the `source` string up until (and excluding) `match`. If match is not
 * found, all of `source` is returned.
 * 
 * ```js
 * // Yields `apple `
 * untilMarch(`apple orange melon`, `orange`);
 * ```
 * @param source 
 * @param match 
 * @param startPos If provided, gives the starting offset. Default 0
 */
export const untilMatch = (source:string, match:string, opts:MatchOpts = {}):string => {
  //  ✔️ Unit tested
  const startPos = opts.startPos ?? undefined;
  const fromEnd = opts.fromEnd ?? false;
  const m = fromEnd ? source.lastIndexOf(match, startPos) : source.indexOf(match, startPos);
  
  if (m < 0) return source;
  return source.substring(startPos ?? 0, m);
};

export type MatchOpts = {
  startPos?:number
  fromEnd?:boolean
}
/**
 * Returns all the text in `source` that follows `match`. If not found, `source` is returned.
 * ```js
 * afterMatch(`Hello. There`, `.`); // ' There'
 * afterMatch(`Hello, there', `,`); // 'Hello, there'
 * ```
 * @param source 
 * @param match 
 * @param startPos 
 * @returns 
 */
export const afterMatch = (source:string, match:string, opts:MatchOpts = {}):string => {
  //  ✔️ Unit tested
  const startPos = opts.startPos ?? undefined;
  const fromEnd = opts.fromEnd ?? false;
  
  const m = fromEnd ? source.lastIndexOf(match, startPos) : source.indexOf(match, startPos);
  
  if (m < 0) return source;
  return source.substring(m + match.length);
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
export const unwrap = (source:string, ...wrappers:readonly string[]):string => {
  //eslint-disable-next-line functional/no-let
  let matched = false;
  do {
    matched = false;
    for (const w of wrappers) {
      if (source.startsWith(w) && source.endsWith(w)) {
        source = source.substring(w.length, source.length - (w.length * 2) + 1);
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
  readonly text:string
  /**
   * Start position, with respect to source text
   */
   readonly start:number
  /**
   * End position, with respect to source text
   */
   readonly end:number
  /**
   * Index of range. First range is 0
   */
   readonly index:number
}

export type LineSpan = {
  readonly start:number
  readonly end:number
  readonly length:number
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
export const lineSpan = (ranges:readonly Range[], start:number, end:number):LineSpan => {
  //eslint-disable-next-line functional/no-let
  let s = -1;
  //eslint-disable-next-line functional/no-let
  let e = -1;
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    s = i;
    if (r.text.length === 0) continue;
    if (start < r.end) {
      break;
    }
  }

  //eslint-disable-next-line functional/no-let
  for (let i = s; i < ranges.length; i++) {
    const r = ranges[i];
    e = i;
    if (end === r.end) {
      e = i + 1;
      break;
    }
    if (end < r.end) {
      break;
    }
  }
  return { length: e - s, start: s, end: e };
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
export const splitRanges = (source:string, split:string):readonly Range[] => {
  //eslint-disable-next-line functional/no-let
  let start = 0;
  //eslint-disable-next-line functional/no-let
  let text = ``;
  const ranges:Range[] = [];
  //eslint-disable-next-line functional/no-let
  let index = 0;
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < source.length; i++) {
    if (source.indexOf(split, i) === i) {
      //eslint-disable-next-line functional/no-let
      const end = i;
      //eslint-disable-next-line functional/immutable-data
      ranges.push({
        text, start, end, index
      });
      start = end + 1;
      text = ``;
      index++;
    } else {
      text += source.charAt(i);
    }
  }
  if (start < source.length) {
    //eslint-disable-next-line functional/immutable-data
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
export const countCharsFromStart = (source:string, ...chars:readonly string[]):number => {
  //eslint-disable-next-line functional/no-let
  let counted = 0;
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < source.length; i++) {
    if (chars.includes(source.charAt(i))) {
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
export const startsEnds = (source:string, start:string, end:string = start):boolean => source.startsWith(start) && source.endsWith(end);

//eslint-disable-next-line no-useless-escape
export const htmlEntities = (source:string):string => source.replace(/[\u00A0-\u9999<>\&]/g, i => `&#${i.charCodeAt(0)};`);