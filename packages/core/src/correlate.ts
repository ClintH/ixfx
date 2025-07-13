/**
 * Returns the similarity of `a` and `b` to each other,
 * where higher similarity should be a higher number.
 * @param a
 * @param b
 */
export type Similarity<V> = (a: V, b: V) => number;

type Scored = {
  readonly score: number;
};

const orderScore = (a: Scored, b: Scored) => {
  if (a.score > b.score) return -1;
  else if (a.score < b.score) return 1;
  return 0;
};

/**
 * Options for alignmnent
 */
export type AlignOpts = {
  /**
   * If the similarity score is above this threshold,
   * consider them the same
   */
  readonly matchThreshold?: number;
  /**
   * If true, additional console messages are printed during
   * execution.
   */
  readonly debug?: boolean;
};

/**
 * Some data with an id property.
 */
export type DataWithId<V> = V & {
  readonly id: string;
};

/**
 * Attempts to align prior data with new data, based on a provided similarity function.
 *
 * See also `alignById` for a version which encloses parameters.
 *
 * ```js
 * // Compare data based on x,y distance
 * const fn = (a, b) => {
 *  return 1-Points.distance(a, b);
 * }
 * const lastData = [
 *  { id:`1`, x:100, y:200 }
 *  ...
 * ]
 * const newData = [
 *  { id:`2`, x:101, y:200 }
 * ]
 * const aligned = Correlate.align(fn, lastdata, newData, opts);
 *
 * // Result:
 * [
 *  { id:`1`, x:101, y:200 }
 * ]
 * ```
 * @param similarityFn Function to compute similarity
 * @param lastData Old data
 * @param newData New data
 * @param options Options
 * @returns
 */
export const align = <V>(
  similarityFunction: Similarity<V>,
  lastData: readonly DataWithId<V>[] | undefined,
  newData: readonly DataWithId<V>[],
  options: AlignOpts = {}
): readonly DataWithId<V>[] => {
  const matchThreshold = options.matchThreshold ?? 0;
  const debug = options.debug ?? false;
  const results = new Map<string, DataWithId<V>>();
  const newThings: DataWithId<V>[] = [];

  const lastMap = new Map<string, DataWithId<V>>();
  lastData?.forEach((d, index) => {
    if (typeof d === `undefined`) {
      throw new Error(`'lastData' contains undefined (index: ${ index.toString() })`);
    }
    lastMap.set(d.id, d);
  });

  for (const newD of newData) { //let index = 0; index < newData.length; index++) {
    //const newD = newData[ index ];

    if (!lastData || lastData.length === 0) {
      // No last data to compare to
      if (debug) console.debug(`Correlate.align() new id: ${ newD.id }`);

      newThings.push(newD);
      continue;
    }

    // Which of the old data does the new data match up to best?
    const scoredLastValues = Array.from(lastMap.values()).map((last) => ({
      id: (last).id,
      score: (last as unknown) === null ? -1 : similarityFunction(last, newD),
      last,
    }));

    if (scoredLastValues.length === 0) {
      if (debug) {
        console.debug(`Correlate.align() no valid last values id: ${ newD.id }`);
      }
      newThings.push(newD);
      continue;
    }
    scoredLastValues.sort(orderScore);

    // Top-ranked match is pretty low, must be something new
    const top = scoredLastValues[ 0 ];
    if (top.score < matchThreshold) {
      if (debug) {
        console.debug(
          `Correlate.align() new item does not reach threshold. Top score: ${ top.score.toString() } id: ${ newD.id }`
        );
      }
      newThings.push(newD);
      continue;
    }

    // TODO: If there are close options to pick, need a pluggable
    // function to determine which is the winner.

    //    console.log(`updating prior ${top.score}. top: ${top.id} newD: ${newD.id}`);

    // The new item is considered the same as top ranked
    if (debug && top.id !== newD.id) {
      console.log(
        `Correlate.align() Remapped ${ newD.id } -> ${ top.id } (score: ${ top.score.toString() })`
      );
    }
    results.set(top.id, { ...newD, id: top.id });

    // Remove that old one from the list
    lastMap.delete(top.id);
  }

  newThings.forEach((t) => results.set(t.id, t));
  return Array.from(results.values());
};

/**
 * Returns a function that attempts to align a series of data by its id.
 * See also {@link align} for a version with no internal storage.
 *
 * ```js
 * // Compare data based on x,y distance
 * const fn = (a, b) => {
 *  return 1-Points.distance(a, b);
 * }
 * const aligner = Correlate.alignById(fn, opts);
 *
 * const lastData = [
 *  { id:`1`, x:100, y:200 }
 *  ...
 * ]
 * const aligned = aligner(lastData);
 *
 * ```
 * @param fn Function to compute similarity
 * @param options Options
 * @returns
 */
export const alignById = <V>(fn: Similarity<V>, options: AlignOpts = {}) => {
  let lastData: readonly DataWithId<V>[] = [];

  const compute = (newData: DataWithId<V>[]) => {
    lastData = align(fn, lastData, newData, options);
    return [ ...lastData ];
  };
  return compute;
};
