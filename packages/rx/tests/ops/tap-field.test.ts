import { test, expect, describe } from 'vitest';
import { tapStream } from '../../src/ops/tap.js';
import { field } from '../../src/ops/field.js';
import { manual } from '../../src/index.js';

describe('rx/ops tap & field', () => {
  describe('tapStream', () => {
    test('taps values to diverged stream', () => {
      const source = manual<number>();
      const diverged = manual<number>();
      
      const tapped: number[] = [];
      diverged.onValue(v => tapped.push(v as number));
      
      tapStream(source, diverged);
      
      source.set(5);
      source.set(10);
      
      expect(tapped).toEqual([5, 10]);
    });
  });

  describe('field', () => {
    test('extracts field from object', () => {
      const source = manual<{ name: string; age: number }>();
      const nameStream = field(source, 'name');
      
      const values: string[] = [];
      nameStream.onValue(v => values.push(v as string));
      
      source.set({ name: 'Alice', age: 30 });
      source.set({ name: 'Bob', age: 25 });
      
      expect(values).toEqual(['Alice', 'Bob']);
    });

    test('extracts numeric field', () => {
      const source = manual<{ name: string; age: number }>();
      const ageStream = field(source, 'age');
      
      const values: number[] = [];
      ageStream.onValue(v => values.push(v as number));
      
      source.set({ name: 'Alice', age: 30 });
      source.set({ name: 'Bob', age: 25 });
      
      expect(values).toEqual([30, 25]);
    });

    test('uses fallback field value', () => {
      const source = manual<{ name?: string }>();
      const nameStream = field(source, 'name', { fallbackFieldValue: 'Unknown' });
      
      const values: string[] = [];
      nameStream.onValue(v => values.push(v as string));
      
      source.set({ name: 'Alice' });
      source.set({});
      
      expect(values).toEqual(['Alice', 'Unknown']);
    });
  });
});
