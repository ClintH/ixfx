import type { Comparer } from "@ixfx/core";
import type { Result } from "@ixfx/guards";
import type { DefragmentOptions, EventInterval, EventItem, EventItemAsDuration, IdEventItem, IndexedEventItem, SplitOptions } from "./types.js";
import { throwIfFailed } from "@ixfx/guards";
import { indexOf, insertionIndex, matchingRange } from "../sorted-array.js";

/**
 * Sorts by start, such that 'start' values are ascending.
 *
 * Returns:
 * 0 if A and B are have same start & end.
 * positive if B is before A.
 * negative if B is after A.
 *
 * If A and B have the same start point, they are secondarily sorted based on end time, with earlier end time considered "before" later end time.
 *
 * Use {@link CompareByStartOnly} to ignore end time and consider events equal if they share a `start`.
 * @param a
 * @param b
 */
export const CompareByStart: Comparer<EventItem> = (a, b): number => {
  if (typeof a === `undefined`)
    throw new TypeError(`Param 'a' is undefined`);
  if (typeof b === `undefined`)
    throw new TypeError(`Param 'b' is undefined`);
  if (a.start === b.start) {
    return a.end - b.end;
  }
  return a.start - b.start;
};

export const CompareByStartOnly: Comparer<EventItem> = (a, b): number => {
  if (typeof a === `undefined`)
    throw new TypeError(`Param 'a' is undefined`);
  if (typeof b === `undefined`)
    throw new TypeError(`Param 'b' is undefined`);
  return a.start - b.start;
};

/**
 * Sorts by end, such that 'end' values are ascending.
 *
 * Returns:
 * 0 if A and B are have same start & end.
 * Returns positive if B is before A.
 * Returns negative if B is after A.
 *
 * If A and B share the same end, shorter items will come first (ie. those with higher start)
 * @param a
 * @param b
 */
export const CompareByEnd: Comparer<EventItem> = (a, b): number => {
  if (typeof a === `undefined`)
    throw new TypeError(`Param 'a' is undefined`);
  if (typeof b === `undefined`)
    throw new TypeError(`Param 'b' is undefined`);
  if (a.end === b.end) {
    return a.start - b.start;
  }
  return a.end - b.end;
};

export const CompareByEndOnly: Comparer<EventItem> = (a, b): number => {
  if (typeof a === `undefined`)
    throw new TypeError(`Param 'a' is undefined`);
  if (typeof b === `undefined`)
    throw new TypeError(`Param 'b' is undefined`);

  return a.end - b.end;
};

/**
 * Returns a new array of events ordered by their start time (ascending)
 * @param events
 * @returns Events ordered by start time
 */
export function sortByStart(events: EventItem[]): EventItem[] {
  return events.toSorted(CompareByStart);
}

/**
 * Returns a new array of events ordered by their end time (ascending)
 * @param events
 * @returns Events ordered by end time
 */
export function sortByEnd(events: EventItem[]): EventItem[] {
  return events.toSorted(CompareByEnd);
}

/**
 * Yields every item in `sortedEvents` that has the specified `start` value
 *
 * Return item is a wrapped object consisting of the event as well as its index.
 * ```js
 * const events = [ { start: 1, end: 2}, { start: 5, end: 10 }, { start: 10, end: 12 }];
 * const matched = [...itemsWithStart(events, 5)];
 * // matched is [{ event: { start: 5, end: 10 }, index: 1 }]
 * ```
 * @param sortedEvents Sorted events
 * @param start Start position
 */
export function *itemsWithStart(sortedEvents: EventItem[], start: number): Generator<IndexedEventItem> {
  if (!Array.isArray(sortedEvents))
    throw new TypeError(`Param 'sortedEvents' is not an array`);

  const range = matchingRange(sortedEvents, { start, end: start }, CompareByStartOnly);
  if (!range)
    return;
  for (let i = range.startIndex; i <= range.endIndex; i++) {
    yield { event: sortedEvents[i], index: i };
  }
}

/**
 * Yields every item in `eventsByEnd` that has the specified `end` value.
 * Return item is a wrapped object consisting of the event as well as its index.
 *
 * The function expects that the input array has been sorted using {@link sortByEnd}, and therefore
 * sorted by ascending end value.
 *
 * ```js
 * const events = [ { start: 1, end: 2}, { start: 5, end: 10 }, { start: 10, end: 12 }];
 * const matched = [...itemsWithEnd(events, 10)];
 * // matched is [{ event: { start: 5, end: 10 }, index: 1 }]
 * ```
 * @param eventsByEnd Events sorted with {@link sortByEnd}
 * @param end End position
 */
export function *itemsWithEnd(eventsByEnd: EventItem[], end: number): Generator<IndexedEventItem> {
  if (!Array.isArray(eventsByEnd))
    throw new TypeError(`Param 'eventsByEnd' is not an array`);

  const range = matchingRange(eventsByEnd, { start: end, end }, CompareByEndOnly);
  if (!range)
    return;
  for (let i = range.startIndex; i <= range.endIndex; i++) {
    yield { event: eventsByEnd[i], index: i };
  }
}

/**
 * Converts a collection of `IndexedEventItem` back into an array of `EventItem`, placing items at their original index.
 *
 * ```js
 * // Get all items that start at position 5
 * const itemsAtPosition = [...itemsWithStart(sortedEvents, 5)];
 *
 * // Make this into an array:
 * const items = arrayFromItems(itemsAtPosition);
 * ```
 *
 * By default, the `index` field is used to construct the array. If `ignoreIndexes` is set to _true_,
 * the the returned array is constructed in the order of the input items, ignoring the `index` field. This can be useful if you just want to extract the events from a generator without caring about their original position.
 * @param items
 * @returns EventItems
 */
export function arrayFromItems(items: Iterable<IndexedEventItem>, ignoreIndexes: boolean = false): EventItem[] {
  const result: EventItem[] = [];
  if (ignoreIndexes) {
    for (const item of items) {
      result.push(item.event);
    }
  } else {
    for (const { event, index } of items) {
      result[index] = event;
    }
  }
  return result;
}

/**
 * Yields all events that overlap with `point`.
 * By default event end is considered exclusive, meaning that if `point == event.end`, it is not considered overlapping.
 * If `endInclusive` is true, event end is considered inclusive, and the aforementioned would be considered ovlerapping.
 *
 * By default start is inclusive.
 *
 * @param sortedEvents
 * @param point
 * @param endInclusive Whether event end is considered inclusive for determining overlap (default:false)
 * @param startInclusive Whether event start is considered inclusive for determining overlap (default:true)
 */
export function *overlapping<T extends EventItem>(sortedEvents: T[], point: number, endInclusive: boolean = false, startInclusive = true): Generator<IndexedEventItem> {
  for (let index = 0; index < sortedEvents.length; index++) {
    const event = sortedEvents[index];
    const start = startInclusive ? point >= event.start : point > event.start;
    const end = endInclusive ? point <= event.end : point < event.end;
    if (end && start) {
      yield { event, index };
    }
  }
}

/**
 * Inserts space within `sortedEvents`. It does this by shifting events forward.
 *
 * If `start` overlaps with existing item(s), `overlappingPolicy` is used:
 * - 'ignore': Event duration is not changed
 * - 'stretch': Events that overlap are stretched by `length`.
 *
 * When considering overlap, both end is exclusive and start are considered exclusive.
 *
 * Eg, if we have the event `{ start: 5, end: 10 }`.
 * - insertSpace(data, 5, 1, `ignore`);  // Would not be considered overlapping, but event would be shifted to { start: 6, end: 11 }
 * - insertSpace(data, 10, 1, `ignore`); // Would not be considered overlapping, event would remain { start: 5, end: 10 }
 * - insertSpace(data, 5, 1, `stretch`); // Would be considered overlapping, event shifted to { start: 6, end: 11 }
 * - insertSpace(data, 6, 1, `stretch`); // Would be considered overlapping, event would be stretched to { start: 5, end: 11 }
 * @param sortedEvents
 * @param start
 * @param length
 * @param overlappingPolicy
 */
export function insertSpace<T extends EventItem>(sortedEvents: T[], start: number, length: number, overlappingPolicy: `ignore` | `stretch`): T[] {
  let i = insertionIndex(sortedEvents, { start, end: start }, CompareByStart);
  // console.log(`insertSpace: insertion index: ${i} for start ${start}`);
  // console.log(`insertSpace:                               existing start ${sortedEvents[i]?.start} end: ${sortedEvents[i]?.end}`);
  // console.log(`insertSpace:                               prev     start ${sortedEvents[i - 1]?.start} end: ${sortedEvents[i - 1]?.end}`);

  if (overlappingPolicy === `stretch`) {
    const events: T[] = [...sortedEvents];
    for (const { event, index } of overlapping<T>(sortedEvents, start, false, false)) {
      events[index] = {
        ...event,
        end: event.end + length,
      } as T;
    }
    sortedEvents = events;
  }

  // If we the previous event has same start, include it in translation.
  while (sortedEvents[i - 1]?.start === start) {
    i--;
  }

  const pre: T[] = sortedEvents.slice(0, i);
  const post: T[] = sortedEvents.slice(i).map(event => translate(event, length));
  const result = [...pre, ...post];
  if (result.length !== sortedEvents.length)
    throw new Error(`Bug in insertSpace: result length ${result.length} does not match original length ${sortedEvents.length}`);
  return result;
}

/**
 * Punches a hole in `sortedEvents` which overlap `hole`.
 * It does this by splitting/trimming events, or removing an event entirely it is fully covered by the hole.
 *
 * This will never shift events in time.
 * @param sortedEvents
 * @param hole
 */
export function holepunch<T extends EventItem>(sortedEvents: T[], hole: EventItem): T[] {
  throwIfFailed(isValid(hole));

  const result: T[] = [];
  for (const e of sortedEvents) {
    const c = compareRange(e, hole);
    // console.log(`holepunch: comparing event ${JSON.stringify(e)} with hole ${JSON.stringify(hole)}: ${c}`);
    if (c === `none`) {
      // No overlap at all
      result.push(e);
      continue;
    }
    if (c === `equal`) {
      continue; // Hole punches entire event, so we remove it
    }
    if (c === `full-border`) {
      // Hole is on start/end point
      if (e.start < hole.start) { // Trim end
        result.push({ ...e, end: hole.start });
      } else if (e.end > hole.end) { // Trim start
        result.push({ ...e, start: hole.end });
      }
      continue;
    }
    if (c === `full`) {
      // Hole is fully contained within event, so we split it in two
      result.push({ ...e, end: hole.start });
      result.push({ ...e, start: hole.end });
      continue;
    }
    if (c === `partial`) {
      // Hole partially overlaps with event, so we trim the overlapping part
      if (e.start < hole.start) { // Trim end
        result.push({ ...e, end: hole.start });
      } else if (e.end > hole.end) { // Trim start
        result.push({ ...e, start: hole.end });
      }
      continue;
    }
  }
  return result;
}

/**
 * Returns _true_ if `item` has zero duration (start and end are the same), _false_ otherwise.
 * ```js
 * isEmpty({ start: 1, end: 1 }); // true
 * isEmpty({ start: 1, end: 2 }); // false
 * ```
 * @param item
 * @returns _true_ if `item` is empty.
 */
export function isEmpty(item: EventItem): boolean {
  return item.start === item.end;
}

/**
 * Creates an `EventItem` from an `EventItemAsDuration` by calculating the end as start + duration.
 * ```js
 * fromDuration({ start: 1, duration: 2 }); // { start: 1, end: 3 }
 * ```
 *
 * Copies additional properties to the return result.
 * @param item
 * @returns EventItem
 */
export function fromDuration(item: EventItemAsDuration): EventItem {
  return {
    ...item,
    start: item.start,
    end: item.start + item.duration,
  };
}

/**
 * Creats an `EventItemAsDuration` from an `EventItem` by calculating the duration as end - start.
 * ```js
 * toDuration({ start: 1, end: 3 }); // { start: 1, duration: 2 }
 * ```
 *
 * Copies additional properties to the return result.
 * @param item
 * @returns EventItemAsDuration
 */
export function toDuration(item: EventItem): EventItemAsDuration {
  return {
    ...item,
    start: item.start,
    duration: item.end - item.start,
  };
}

/**
 * Returns the intervals between pairs of events.
 *
 * If `sortedEvents` has less than two events, yields nothing
 * @param sortedEvents
 */
export function *intervals(sortedEvents: EventItem[]): Generator<EventInterval> {
  if (sortedEvents.length <= 1)
    return;
  for (let index = 1; index < sortedEvents.length; index++) {
    const prev = sortedEvents[index - 1];
    const current = sortedEvents[index];
    yield {
      indexA: index - 1,
      indexB: index,
      a: prev,
      b: current,
      startInterval: current.start - prev.start,
      endInterval: current.end - prev.end,
      betweenInterval: current.start - prev.end,
    };
  }
}

export function isValid(item: unknown): Result<EventItem, string> {
  if (!isEventItem(item))
    return { success: false, error: `Item is not a valid EventItem` };
  if (item.end < item.start)
    return { success: false, error: `Invalid EventItem. End (${item.end}) is before start (${item.start})` };
  return { success: true, value: item };
}

export function isEventItem(item: unknown): item is EventItem {
  if (typeof item !== `object`)
    return false;
  if (item === null || item === undefined)
    return false;

  return `start` in item
    && `end` in item
    && typeof (item as any).start === `number`
    && typeof (item as any).end === `number`;
}

/**
 * Removes `toRemove` from `sortedEvents`.
 *
 * Consider {@link holepunch} if you want to create an empty hole in the events and maintain overall length of event series.
 *
 * After removing:
 * - 'nothing': Gap is left, other items not affected
 * - 'shuffle-following': Events after 'toRemove' are shifted back by duration of `toRemove`, maintaining their spacing after that
 * - 'shuffle-leading': Events before 'toRemove' are shifted forward by duration of `toRemove`, maintaining their spacing before that
 * - 'slice-following': Events after 'toRemove' are shifted back to start at `toRemoved.start`, maintaining their spacing after that
 * - 'slice-leading': Events before 'toRemove' are shifted forward to end at `toRemoved.end`, maintaining their spacing before that
 * @param sortedEvents
 * @param toRemove
 */
export function remove(sortedEvents: EventItem[], toRemove: EventItem, andThen: `nothing` | `shuffle-following` | `shuffle-leading` | `slice-following` | `slice-leading`): EventItem[] {
  const i = indexOf(sortedEvents, toRemove, CompareByStart);
  if (i === -1)
    return sortedEvents;

  if (andThen === `shuffle-following`) {
    // Shift following events back
    return [...sortedEvents.slice(0, i), ...sortedEvents.slice(i + 1).map(event => translate(event, toRemove.start - toRemove.end))];
  } else if (andThen === `slice-following`) {
    // Shift following events back to start of removed event
    const shiftAmount = toRemove.start - sortedEvents[i + 1].start;
    return [...sortedEvents.slice(0, i), ...sortedEvents.slice(i + 1).map(event => translate(event, shiftAmount))];
  } else if (andThen === `shuffle-leading`) {
    // Shift leading events forward
    return [...sortedEvents.slice(0, i).map(event => translate(event, toRemove.end - toRemove.start)), ...sortedEvents.slice(i + 1)];
  } else if (andThen === `slice-leading`) {
    // Shift leading events forward to end of removed event
    const shiftAmount = toRemove.end - sortedEvents[i - 1].end;
    return [...sortedEvents.slice(0, i).map(event => translate(event, shiftAmount)), ...sortedEvents.slice(i + 1)];
  }
  return sortedEvents.toSpliced(i, 1);
}

/**
 * Splits `event` into two events by either a percentange of duration or by a specific start position.
 *
 * If `options` has a `percentage` field, the split point is calculated as `event.start + (event.end - event.start) * percentage`.
 * If `options` has a `start` field, the split point is simply that value.
 *
 * ```js
 * splitEvent({ start: 0, end: 10 }, { percentage: 0.5 }); // [{ start: 0, end: 5 }, { start: 5, end: 10 }]
 * splitEvent({ start: 0, end: 10 }, { start: 3 });        // [{ start: 0, end: 3 }, { start: 3, end: 10 }]
 * ```
 *
 * Any other properties on `event` are copied to split events.
 * @param event Input event
 * @param options How to split
 * @returns Split event
 */
export function splitEvent(event: EventItem, options: SplitOptions): [a: EventItem, b: EventItem] {
  if (`percentage` in options) {
    const splitPoint = event.start + (event.end - event.start) * options.percentage;
    return [
      { ...event, start: event.start, end: splitPoint },
      { ...event, start: splitPoint, end: event.end },
    ];
  } else {
    const splitPoint = options.start;
    return [
      { ...event, start: event.start, end: splitPoint },
      { ...event, start: splitPoint, end: event.end },
    ];
  }
}

/**
 * Applies `fn` to both `start` and `end` fields, returning a new event.
 *
 * Existing data on `event` is maintained.
 *
 * ```js
 * applyToPosition( { start:1.2, end:2.4 }, v => Math.round(v)); // { start:1, end:2 }
 * applyToPosition( { start:1,   end:2   }, v => v*2);           // { start:2, end:4 }
 * ```
 *
 * Use {@link translate} if you just want to add an amount to start and end, instead of applying a custom function.
 * @param event Input event
 * @param fn Function to run over start and end
 * @returns New event with `fn` applied to start and end
 */
export function applyToPositions(event: EventItem, fn: (v: number) => number): EventItem {
  return {
    ...event,
    start: fn(event.start),
    end: fn(event.end),
  };
}

/**
 * Translates an event by adding `amount` to both `start` and `end`, returning a new event.
 * ```js
 * translate( { start:1, end:2 }, 3);  // { start:4, end:5 }
 * translate( { start:1, end:2 }, -1); // { start:0, end:1 }
 * ```
 *
 * Existing data on `event` is maintained.
 *
 * Use {@link applyToPositions} if you want to apply a custom function to the start and end, instead of just adding an amount.
 * @param event
 * @param amount
 * @returns New EventItem
 */
export function translate<T extends EventItem>(event: T, amount: number): T {
  return {
    ...event,
    start: event.start + amount,
    end: event.end + amount,
  };
}

/**
 * Returns how `b` overlaps with `a`.
 *
 * Returns:
 * - `none` if `b` does not overlap with `a`
 * - `equal` if `b` has the same start and end as `a`
 * - `full` if `b` is fully contained within `a` and `a` does not share a start/end
 * - `full-border` if `b` is fully contained within `a` and `a` shares a start/end
 * - `partial` if `b` overlaps with `a` but is not fully contained within it
 *
 * ```js
 * compareRange({ start:2, end:4 }, { start:0, end:1 }); // 'none'
 * compareRange({ start:2, end:4 }, { start: 2, end:4 }); // 'equal'
 * compareRange({ start:2, end:4 }, { start: 3, end: 3 }); // 'full'
 * compareRange({ start:2, end:4 }, { start: 3, end: 4 }); // 'full-border'
 * compareRange({ start:2, end:4 }, { start: 1, end: 3 }); // 'partial'
 * ```
 * @param a
 * @param b
 */
export function compareRange<T extends EventItem>(a: T, b: T): `none` | `partial` | `full` | `full-border` | `equal` {
  if (b.start > a.end)
    return `none`;
  if (b.end < a.start)
    return `none`;
  if (b.start === a.start && b.end === a.end)
    return `equal`;
  if (b.start > a.start && b.end < a.end)
    return `full`;
  if (b.start >= a.start && b.end <= a.end)
    return `full-border`;
  return `partial`;
}

/**
 * Lays out events end-to-end, removing gaps between them and having the first start at 0.
 * Duration of events is maintained.
 * @param sortedEvents
 */
export function defragment(sortedEvents: EventItem[], options: Partial<DefragmentOptions> = {}): EventItem[] {
  let time = options.startAt ?? 0;
  const gap = options.gap ?? 0;
  const results: EventItem[] = [];
  for (const event of sortedEvents) {
    results.push({
      ...event,
      start: time,
      end: time + (event.end - event.start),
    });
    time = (results.at(-1) as EventItem).end + gap;
  }
  return results;
}

export function createFromStarts(starts: number[], duration: number, idPrefix = `event`): IdEventItem[] {
  return starts.map((start, i) => ({
    start,
    end: start + duration,
    id: `${idPrefix}-${i}`,
  }));
}

/**
 * Gets the range of `events`: the smallest 'start' and the largest 'end'.
 *
 * If there are gaps between events, this is still included in the range. Use {@link sumDuration}
 * to add up the duration of all events as if they are stacked end-to-end.
 * @param events
 * @returns Range of events
 */
export function computeRange(events: EventItem[]): { start: number; end: number } {
  let minStart = Number.MAX_SAFE_INTEGER;
  let maxEnd = Number.MIN_SAFE_INTEGER;
  for (const event of events) {
    if (event.start < minStart)
      minStart = event.start;
    if (event.end > maxEnd)
      maxEnd = event.end;
  }
  return { start: minStart, end: maxEnd };
}

/**
 * Returns the total duration of all events. Doesn't take into account
 * the spacing between events, just sums the duration of each one.
 *
 * Use {@link computeRange} if you want to calculate the min and max starting points.
 * @param events
 * @returns Duration
 */
export function sumDuration(events: EventItem[]): number {
  return events.reduce((sum, event) => sum + (event.end - event.start), 0);
}