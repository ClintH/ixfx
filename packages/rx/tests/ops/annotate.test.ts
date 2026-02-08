import { describe, test, expect } from 'vitest';
import { annotate, annotateWithOp } from '../../src/ops/annotate.js';
import { manual } from '../../src/index.js';
import { toArray } from '../../src/to-array.js';

describe('rx/ops/annotate', () => {
  describe('annotate', () => {
    test('annotates values with computed annotation', () => {
      const source = manual<{ w: number; h: number }>();
      const values: Array<{ value: { w: number; h: number }; annotation: { area: number } }> = [];

      const annotated = annotate(source, (v) => ({ area: v.w * v.h }));
      annotated.onValue((v) => values.push(v));

      source.set({ w: 1, h: 3 });
      source.set({ w: 2, h: 2 });
      source.set({ w: 3, h: 1 });

      expect(values).toEqual([
        { value: { w: 1, h: 3 }, annotation: { area: 3 } },
        { value: { w: 2, h: 2 }, annotation: { area: 4 } },
        { value: { w: 3, h: 1 }, annotation: { area: 3 } },
      ]);
    });

    test('annotates primitive values', () => {
      const source = manual<number>();
      const values: Array<{ value: number; annotation: string }> = [];

      const annotated = annotate(source, (v) => (v > 0 ? 'positive' : 'negative'));
      annotated.onValue((v) => values.push(v));

      source.set(1);
      source.set(-2);
      source.set(0);

      expect(values).toEqual([
        { value: 1, annotation: 'positive' },
        { value: -2, annotation: 'negative' },
        { value: 0, annotation: 'negative' },
      ]);
    });

    test('works with arrays as source', async () => {
      const source = [1, 2, 3];
      const annotated = annotate(source, (v) => v * 2);

      const values = await toArray(annotated);
      expect(values).toEqual([
        { value: 1, annotation: 2 },
        { value: 2, annotation: 4 },
        { value: 3, annotation: 6 },
      ]);
    });

    test('handles empty arrays', async () => {
      const source: number[] = [];
      const annotated = annotate(source, (v) => v * 2);

      const values = await toArray(annotated);
      expect(values).toEqual([]);
    });

    test('annotator receives each value', () => {
      const source = manual<number>();
      const received: number[] = [];

      const annotated = annotate(source, (v) => {
        received.push(v);
        return v * 2;
      });
      annotated.onValue(() => {});

      source.set(1);
      source.set(2);
      source.set(3);

      expect(received).toEqual([1, 2, 3]);
    });

    test('preserves original value reference', () => {
      const source = manual<{ id: number }>();
      const values: Array<{ value: { id: number }; annotation: number }> = [];

      const originalObj = { id: 1 };
      const annotated = annotate(source, (v) => v.id);
      annotated.onValue((v) => values.push(v));

      source.set(originalObj);

      expect(values[0].value).toBe(originalObj);
    });
  });

  describe('annotateWithOp', () => {
    test('annotates using transform operator', async () => {
      const { transform } = await import('../../src/ops/transform.js');
      const source = [1, 2, 3];
      // Create operator that doubles values
      const doubleOp = (src) => transform(src, (v: number) => v * 2);
      const annotated = annotateWithOp(source, doubleOp);

      const values = await toArray(annotated);
      expect(values).toEqual([
        { value: 1, annotation: 2 },
        { value: 2, annotation: 4 },
        { value: 3, annotation: 6 },
      ]);
    });

    test('annotates with field extraction', async () => {
      const { field } = await import('../../src/ops/field.js');
      const source = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }];
      // Create operator that extracts age
      const ageOp = (src) => field(src, 'age');
      const annotated = annotateWithOp(source, ageOp);

      const values = await toArray(annotated);
      expect(values).toEqual([
        { value: { name: 'Alice', age: 30 }, annotation: 30 },
        { value: { name: 'Bob', age: 25 }, annotation: 25 },
      ]);
    });
  });
});
