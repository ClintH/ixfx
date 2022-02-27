export const between = (source: string, start: string, end?: string, lastEndMatch = true): string | undefined => {
  const startPos = source.indexOf(start);
  if (startPos < 0) return;

  if (end === undefined) end = start;

  const endPos =(lastEndMatch) ? source.lastIndexOf(end) : source.indexOf(end, startPos+1);
  if (endPos < 0) return;

  return source.substring(startPos+1, endPos);

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
