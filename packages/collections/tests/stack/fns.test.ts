import { test, expect } from 'vitest';
import { trimStack, push, pop, peek, isEmpty, isFull } from '../../src/stack/StackFns.js';

test('push adds items to stack', () => {
  const result = push({}, [1, 2], 3, 4);
  expect(result).toEqual([1, 2, 3, 4]);
});

test('push on empty stack', () => {
  const result = push({}, [], 'a', 'b');
  expect(result).toEqual(['a', 'b']);
});

test('push with no items to add', () => {
  const original = [1, 2, 3];
  const result = push({}, original);
  expect(result).toEqual([1, 2, 3]);
});

test('pop removes last item', () => {
  const result = pop({}, [1, 2, 3]);
  expect(result).toEqual([1, 2]);
});

test('pop throws on empty stack', () => {
  expect(() => pop({}, [])).toThrow('Stack is empty');
});

test('pop single item', () => {
  const result = pop({}, ['only']);
  expect(result).toEqual([]);
});

test('peek returns last item', () => {
  const result = peek({}, [1, 2, 3]);
  expect(result).toBe(3);
});

test('peek returns undefined on empty stack', () => {
  const result = peek({}, []);
  expect(result).toBeUndefined();
});

test('peek single item', () => {
  const result = peek({}, ['only']);
  expect(result).toBe('only');
});

test('isEmpty returns true for empty array', () => {
  expect(isEmpty({}, [])).toBe(true);
});

test('isEmpty returns false for non-empty array', () => {
  expect(isEmpty({}, [1])).toBe(false);
  expect(isEmpty({}, [1, 2, 3])).toBe(false);
});

test('isFull returns false when no capacity', () => {
  expect(isFull({}, [])).toBe(false);
  expect(isFull({}, [1, 2, 3])).toBe(false);
});

test('isFull returns true at capacity', () => {
  expect(isFull({ capacity: 3 }, [1, 2, 3])).toBe(true);
});

test('isFull returns false below capacity', () => {
  expect(isFull({ capacity: 5 }, [1, 2, 3])).toBe(false);
});

test('isFull returns true above capacity', () => {
  expect(isFull({ capacity: 2 }, [1, 2, 3, 4])).toBe(true);
});

test('push with capacity - no overflow', () => {
  const result = push({ capacity: 5 }, [1, 2], 3, 4);
  expect(result).toEqual([1, 2, 3, 4]);
});

test('trimStack - additions policy', () => {
  const result = trimStack(
    { capacity: 4, discardPolicy: 'additions' },
    [1, 2, 3],
    [4, 5, 6]
  );
  expect(result).toEqual([1, 2, 3, 4]);
});

test('trimStack - additions policy when completely full', () => {
  const result = trimStack(
    { capacity: 3, discardPolicy: 'additions' },
    [1, 2, 3],
    [4, 5]
  );
  expect(result).toEqual([1, 2, 3]);
});

test('trimStack - older policy', () => {
  const result = trimStack(
    { capacity: 4, discardPolicy: 'older' },
    [1, 2, 3],
    [4, 5]
  );
  expect(result).toEqual([2, 3, 4, 5]);
});

test('trimStack - older policy complete flush', () => {
  const result = trimStack(
    { capacity: 4, discardPolicy: 'older' },
    [1, 2],
    [3, 4, 5, 6, 7]
  );
  expect(result).toEqual([4, 5, 6, 7]);
});

test('trimStack - newer policy', () => {
  const result = trimStack(
    { capacity: 4, discardPolicy: 'newer' },
    [1, 2, 3],
    [4, 5]
  );
  expect(result).toEqual([1, 2, 4, 5]);
});

test('trimStack - newer policy complete flush', () => {
  const result = trimStack(
    { capacity: 4, discardPolicy: 'newer' },
    [1, 2],
    [3, 4, 5, 6, 7]
  );
  expect(result).toEqual([4, 5, 6, 7]);
});

test('trimStack - newer policy keeps old when room', () => {
  const result = trimStack(
    { capacity: 5, discardPolicy: 'newer' },
    [1, 2, 3],
    [4, 5]
  );
  expect(result).toEqual([1, 2, 3, 4, 5]);
});

test('trimStack throws on unknown policy', () => {
  expect(() => 
    trimStack(
      { capacity: 3, discardPolicy: 'unknown' as any },
      [1, 2],
      [3, 4]
    )
  ).toThrow('Unknown discard policy unknown');
});

test('push respects capacity with additions policy', () => {
  const result = push(
    { capacity: 3, discardPolicy: 'additions' },
    [1, 2],
    3, 4, 5
  );
  expect(result).toEqual([1, 2, 3]);
});

test('push respects capacity with older policy', () => {
  const result = push(
    { capacity: 3, discardPolicy: 'older' },
    [1, 2],
    3, 4, 5
  );
  expect(result).toEqual([3, 4, 5]);
});

test('push exactly at capacity', () => {
  const result = push(
    { capacity: 5 },
    [1, 2],
    3, 4, 5
  );
  expect(result).toEqual([1, 2, 3, 4, 5]);
});

test('debug mode logs messages', () => {
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  
  trimStack(
    { capacity: 3, discardPolicy: 'additions', debug: true },
    [1, 2],
    [3, 4]
  );
  
  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});

import { vi } from 'vitest';
