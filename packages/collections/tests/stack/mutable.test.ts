import { test, expect } from 'vitest';
import { StackMutable, mutable } from '../../src/stack/StackMutable.js';

test('basic operations', () => {
  const stack = new StackMutable<string>();
  
  expect(stack.isEmpty).toBe(true);
  expect(stack.isFull).toBe(false);
  expect(stack.peek).toBeUndefined();
  expect(stack.length).toBe(0);
  
  stack.push('a');
  expect(stack.isEmpty).toBe(false);
  expect(stack.peek).toBe('a');
  expect(stack.length).toBe(1);
  
  stack.push('b', 'c');
  expect(stack.length).toBe(3);
  expect(stack.peek).toBe('c');
  
  const popped = stack.pop();
  expect(popped).toBe('c');
  expect(stack.length).toBe(2);
  expect(stack.peek).toBe('b');
  
  stack.pop();
  stack.pop();
  expect(stack.isEmpty).toBe(true);
  expect(stack.peek).toBeUndefined();
});

test('empty stack pop throws error', () => {
  const stack = new StackMutable<number>();
  expect(() => stack.pop()).toThrow('Stack is empty');
  expect(stack.data.length).toBe(0);
});

test('forEach iterates from bottom to top', () => {
  const stack = new StackMutable<number>();
  stack.push(1, 2, 3);
  
  const result: number[] = [];
  stack.forEach(v => result.push(v));
  expect(result).toEqual([1, 2, 3]);
});

test('forEachFromTop iterates from top to bottom', () => {
  const stack = new StackMutable<number>();
  stack.push(1, 2, 3);
  
  const result: number[] = [];
  stack.forEachFromTop(v => result.push(v));
  expect(result).toEqual([3, 2, 1]);
});

test('push with no arguments returns current length', () => {
  const stack = new StackMutable<number>({}, [1, 2, 3]);
  const result = stack.push();
  expect(result).toBe(3);
  expect(stack.length).toBe(3);
});

test('bounded stack - discard additions policy', () => {
  const stack = new StackMutable<string>({ capacity: 3, discardPolicy: 'additions' });
  
  stack.push('a', 'b');
  expect(stack.data).toEqual(['a', 'b']);
  
  stack.push('c', 'd', 'e');
  expect(stack.data).toEqual(['a', 'b', 'c']);
  
  stack.push('x');
  expect(stack.data).toEqual(['a', 'b', 'c']);
  expect(stack.isFull).toBe(true);
});

test('bounded stack - discard older policy', () => {
  const stack = new StackMutable<string>({ capacity: 3, discardPolicy: 'older' });
  
  stack.push('a', 'b', 'c');
  expect(stack.data).toEqual(['a', 'b', 'c']);
  
  stack.push('d', 'e');
  expect(stack.data).toEqual(['c', 'd', 'e']);
  
  stack.push('f', 'g', 'h');
  expect(stack.data).toEqual(['f', 'g', 'h']);
});

test('bounded stack - discard newer policy', () => {
  const stack = new StackMutable<string>({ capacity: 4, discardPolicy: 'newer' });

  stack.push('a', 'b', 'c');
  expect(stack.data).toEqual(['a', 'b', 'c']);

  // Push 2 items, 3+2=5 total, need to remove 1
  // Keep oldest: ['a', 'b'], add: ['d', 'e']
  stack.push('d', 'e');
  expect(stack.data).toEqual(['a', 'b', 'd', 'e']);

  // Push 3 items, 4+3=7 total, need to remove 3
  // Keep oldest: ['a'], add first 3: ['f', 'g', 'h']
  stack.push('f', 'g', 'h');
  expect(stack.data).toEqual(['a', 'f', 'g', 'h']);
});

test('constructor with initial data', () => {
  const stack = new StackMutable<number>({}, [1, 2, 3]);
  expect(stack.length).toBe(3);
  expect(stack.peek).toBe(3);
});

test('constructor with options and initial data', () => {
  const stack = new StackMutable<string>({ capacity: 5 }, ['a', 'b']);
  expect(stack.length).toBe(2);
  expect(stack.isFull).toBe(false);
});

test('mutable factory function', () => {
  const stack = mutable<number>({ capacity: 3 }, 1, 2);
  expect(stack.length).toBe(2);
  expect(stack.peek).toBe(2);
  
  stack.push(3);
  expect(stack.length).toBe(3);
  expect(stack.isFull).toBe(true);
});

test('mutable factory with empty starting items', () => {
  const stack = mutable<string>();
  expect(stack.isEmpty).toBe(true);
  
  stack.push('x');
  expect(stack.length).toBe(1);
});

test('pop modifies internal data', () => {
  const stack = new StackMutable<number>({}, [1, 2, 3]);
  const initialLength = stack.data.length;
  
  stack.pop();
  expect(stack.data.length).toBe(initialLength - 1);
  expect(stack.data).toEqual([1, 2]);
});

test('bounded stack with capacity 1', () => {
  const stack = new StackMutable<string>({ capacity: 1, discardPolicy: 'older' });
  stack.push('a');
  stack.push('b');
  expect(stack.data).toEqual(['b']);
  expect(stack.peek).toBe('b');
});

test('isFull with no capacity returns false', () => {
  const stack = new StackMutable<number>();
  stack.push(1, 2, 3, 4, 5);
  expect(stack.isFull).toBe(false);
});

test('data property is readonly array', () => {
  const stack = new StackMutable<number>({}, [1, 2, 3]);
  expect(Array.isArray(stack.data)).toBe(true);
  expect(stack.data.length).toBe(3);
  
  stack.push(4);
  expect(stack.data.length).toBe(4);
});

test('multiple push and pop operations', () => {
  const stack = new StackMutable<number>();
  
  stack.push(1);
  stack.push(2);
  expect(stack.pop()).toBe(2);
  stack.push(3);
  expect(stack.pop()).toBe(3);
  expect(stack.pop()).toBe(1);
  expect(stack.pop()).toBeUndefined();
});
