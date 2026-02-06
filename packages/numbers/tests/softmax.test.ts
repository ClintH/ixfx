import { describe, test, expect } from 'vitest';
import { softmax } from '../src/softmax.js';

describe('softmax', () => {
  test('converts logits to probabilities', () => {
    const result = softmax([1, 2, 3]);
    expect(result.length).toBe(3);
    expect(result[0]).toBeGreaterThan(0);
    expect(result[1]).toBeGreaterThan(0);
    expect(result[2]).toBeGreaterThan(0);
  });

  test('probabilities sum to 1', () => {
    const result = softmax([1, 2, 3, 4, 5]);
    const sum = result.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  test('higher logits get higher probabilities', () => {
    const result = softmax([1, 10, 1]);
    expect(result[1]).toBeGreaterThan(result[0]);
    expect(result[1]).toBeGreaterThan(result[2]);
  });

  test('handles negative values', () => {
    const result = softmax([-1, -2, -3]);
    expect(result.length).toBe(3);
    const sum = result.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  test('handles mixed positive and negative', () => {
    const result = softmax([-2, 0, 2]);
    expect(result[2]).toBeGreaterThan(result[1]);
    expect(result[1]).toBeGreaterThan(result[0]);
  });

  test('handles large values', () => {
    const result = softmax([100, 101, 102]);
    const sum = result.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  test('handles small values', () => {
    const result = softmax([0.01, 0.02, 0.03]);
    const sum = result.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  test('handles zeros', () => {
    const result = softmax([0, 0, 0]);
    expect(result[0]).toBeCloseTo(1/3, 5);
    expect(result[1]).toBeCloseTo(1/3, 5);
    expect(result[2]).toBeCloseTo(1/3, 5);
  });

  test('handles single element', () => {
    const result = softmax([5]);
    expect(result[0]).toBe(1);
  });

  test('handles two elements', () => {
    const result = softmax([0, 1]);
    expect(result[1]).toBeGreaterThan(result[0]);
    expect(result[0] + result[1]).toBeCloseTo(1, 5);
  });

  test('preserves order', () => {
    const logits = [1, 5, 3, 10, 2];
    const result = softmax(logits);
    
    // Check that order is preserved
    const indexed = result.map((val, idx) => ({ val, idx }));
    const sorted = indexed.sort((a, b) => b.val - a.val);
    
    expect(sorted[0].idx).toBe(3); // 10 should be highest
    expect(sorted[1].idx).toBe(1); // 5 should be second
  });

  test('handles very large differences', () => {
    const result = softmax([0, 100]);
    expect(result[1]).toBeCloseTo(1, 5);
    expect(result[0]).toBeLessThan(0.01);
  });
});
