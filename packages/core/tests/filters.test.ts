import { test, expect, describe } from 'vitest';
import { filterValue } from '../src/filters.js';

describe('filterValue', () => {
  test('returns value when predicate returns true', () => {
    const isLessThan10 = (v: number) => v < 10;
    expect(filterValue(5, isLessThan10, 0)).toBe(5);
  });

  test('returns skipValue when predicate returns false', () => {
    const isLessThan10 = (v: number) => v < 10;
    expect(filterValue(20, isLessThan10, 0)).toBe(0);
  });

  test('returns undefined when skipValue is undefined', () => {
    const isPositive = (v: number) => v > 0;
    expect(filterValue(-5, isPositive, undefined)).toBe(undefined);
  });

  test('works with string values', () => {
    const startsWithA = (v: string) => v.startsWith('A');
    expect(filterValue('Apple', startsWithA, 'fallback')).toBe('Apple');
    expect(filterValue('Banana', startsWithA, 'fallback')).toBe('fallback');
  });

  test('works with object values', () => {
    type Item = { name: string; active: boolean };
    const item: Item = { name: 'test', active: true };
    const isActive = (v: Item) => v.active;
    const fallback: Item = { name: 'fallback', active: false };
    
    expect(filterValue(item, isActive, fallback)).toBe(item);
    
    const inactiveItem: Item = { name: 'inactive', active: false };
    expect(filterValue(inactiveItem, isActive, fallback)).toBe(fallback);
  });

  test('predicate receives the value', () => {
    let receivedValue: number | undefined;
    const capture = (v: number) => {
      receivedValue = v;
      return true;
    };
    
    filterValue(42, capture, 0);
    expect(receivedValue).toBe(42);
  });

  test('works at boundary conditions', () => {
    const isLessThanOrEqual = (v: number) => v <= 10;
    expect(filterValue(10, isLessThanOrEqual, 0)).toBe(10);
    expect(filterValue(11, isLessThanOrEqual, 0)).toBe(0);
  });

  test('skipValue can be same type as value', () => {
    const isEven = (v: number) => v % 2 === 0;
    expect(filterValue(4, isEven, -1)).toBe(4);
    expect(filterValue(3, isEven, -1)).toBe(-1);
  });
});
