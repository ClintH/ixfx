"use strict";
exports.__esModule = true;
exports.htmlEntities = exports.startsEnds = exports.countCharsFromStart = exports.splitRanges = exports.lineSpan = exports.unwrap = exports.untilMatch = exports.splitByLength = exports.omitChars = exports.indexOfCharCode = exports.between = void 0;
/**
 * Returns source text that is between `start` and `end` match strings. Returns _undefined_ if start/end is not found.
 *
 * ```js
 * // Yields ` orange `;
 * between(`apple orange melon`, `apple`, `melon`);
 * ```
 * @param source Source text
 * @param start Start match
 * @param end If undefined, `start` will be used instead
 * @param lastEndMatch If true, looks for the last match of `end` (default). If false, looks for the first match.
 * @returns
 */
var between = function (source, start, end, lastEndMatch) {
    if (lastEndMatch === void 0) { lastEndMatch = true; }
    var startPos = source.indexOf(start);
    if (startPos < 0)
        return;
    if (end === undefined)
        end = start;
    var endPos = lastEndMatch ? source.lastIndexOf(end) : source.indexOf(end, startPos + 1);
    if (endPos < 0)
        return;
    return source.substring(startPos + 1, endPos);
};
exports.between = between;
/**
 * Returns first position of the given character code, or -1 if not found.
 * @param source Source string
 * @param code Code to seek
 * @param start Start index, 0 by default
 * @param end End index (inclusive), source.length-1 by default
 * @returns Found position, or -1 if not found
 */
var indexOfCharCode = function (source, code, start, end) {
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = source.length - 1; }
    //eslint-disable-next-line functional/no-let
    for (var i = start; i <= end; i++) {
        if (source.charCodeAt(i) === code)
            return i;
    }
    return -1;
};
exports.indexOfCharCode = indexOfCharCode;
/**
 * Returns `source` with chars removed at `removeStart` position
 * ```js
 * omitChars(`hello there`, 1, 3);
 * // Yields: `ho there`
 * ```
 * @param source
 * @param removeStart Start point to remove
 * @param removeLength Number of characters to remove
 * @returns
 */
var omitChars = function (source, removeStart, removeLength) { return source.substring(0, removeStart) + source.substring(removeStart + removeLength); };
exports.omitChars = omitChars;
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
var splitByLength = function (source, length) {
    var chunks = Math.ceil(source.length / length);
    var ret = [];
    //eslint-disable-next-line functional/no-let
    var start = 0;
    //eslint-disable-next-line functional/no-let  
    for (var c = 0; c < chunks; c++) {
        //eslint-disable-next-line functional/immutable-data
        ret.push(source.substring(start, start + length));
        start += length;
    }
    return ret;
};
exports.splitByLength = splitByLength;
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
var untilMatch = function (source, match, startPos) {
    if (startPos === void 0) { startPos = 0; }
    if (startPos > source.length)
        throw new Error("startPos should be less than length");
    var m = source.indexOf(match, startPos);
    if (m < 0)
        return source;
    return source.substring(startPos, m);
};
exports.untilMatch = untilMatch;
/**
 * 'Unwraps' a string, removing one or more 'wrapper' strings that it starts and ends with.
 * ```js
 * unwrap("'hello'", "'");        // hello
 * unwrap("apple", "a");          // apple
 * unwrap("wow", "w");            // o
 * unwrap(`"'blah'"`, '"', "'");  // blah
 * ```
 * @param source
 * @param wrappers
 * @returns
 */
var unwrap = function (source) {
    var wrappers = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        wrappers[_i - 1] = arguments[_i];
    }
    //eslint-disable-next-line functional/no-let
    var matched = false;
    do {
        matched = false;
        for (var _a = 0, wrappers_1 = wrappers; _a < wrappers_1.length; _a++) {
            var w = wrappers_1[_a];
            if (source.startsWith(w) && source.endsWith(w)) {
                source = source.substring(w.length, source.length - (w.length * 2) + 1);
                matched = true;
            }
        }
    } while (matched);
    return source;
};
exports.unwrap = unwrap;
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
var lineSpan = function (ranges, start, end) {
    //eslint-disable-next-line functional/no-let
    var s = -1;
    //eslint-disable-next-line functional/no-let
    var e = -1;
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < ranges.length; i++) {
        var r = ranges[i];
        s = i;
        if (r.text.length === 0)
            continue;
        if (start < r.end) {
            break;
        }
    }
    //eslint-disable-next-line functional/no-let
    for (var i = s; i < ranges.length; i++) {
        var r = ranges[i];
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
exports.lineSpan = lineSpan;
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
var splitRanges = function (source, split) {
    //eslint-disable-next-line functional/no-let
    var start = 0;
    //eslint-disable-next-line functional/no-let
    var text = "";
    var ranges = [];
    //eslint-disable-next-line functional/no-let
    var index = 0;
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < source.length; i++) {
        if (source.indexOf(split, i) === i) {
            //eslint-disable-next-line functional/no-let
            var end = i;
            //eslint-disable-next-line functional/immutable-data
            ranges.push({
                text: text,
                start: start,
                end: end,
                index: index
            });
            start = end + 1;
            text = "";
            index++;
        }
        else {
            text += source.charAt(i);
        }
    }
    if (start < source.length) {
        //eslint-disable-next-line functional/immutable-data
        ranges.push({ text: text, start: start, index: index, end: source.length });
    }
    return ranges;
};
exports.splitRanges = splitRanges;
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
var countCharsFromStart = function (source) {
    var chars = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        chars[_i - 1] = arguments[_i];
    }
    //eslint-disable-next-line functional/no-let
    var counted = 0;
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < source.length; i++) {
        if (chars.includes(source.charAt(i))) {
            counted++;
        }
        else {
            break;
        }
    }
    return counted;
};
exports.countCharsFromStart = countCharsFromStart;
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
var startsEnds = function (source, start, end) {
    if (end === void 0) { end = start; }
    return source.startsWith(start) && source.endsWith(end);
};
exports.startsEnds = startsEnds;
//eslint-disable-next-line no-useless-escape
var htmlEntities = function (source) { return source.replace(/[\u00A0-\u9999<>\&]/g, function (i) { return "&#".concat(i.charCodeAt(0), ";"); }); };
exports.htmlEntities = htmlEntities;
//# sourceMappingURL=Text.js.map