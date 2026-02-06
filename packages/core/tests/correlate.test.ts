import { describe, test, expect, vi } from 'vitest';
import { align, alignById, type Similarity, type DataWithId } from '../src/correlate.js';

describe('core/correlate', () => {
  describe('align', () => {
    // Simple similarity function based on x,y distance (inverse, so closer = higher score)
    const distanceSimilarity: Similarity<{ x: number; y: number }> = (a, b) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return 100 - dist; // Higher score = closer, 100 is max range
    };

    test('returns new data when no lastData', () => {
      const newData: DataWithId<{ x: number; y: number }>[] = [
        { id: '1', x: 100, y: 200 }
      ];

      const result = align(distanceSimilarity, undefined, newData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: '1', x: 100, y: 200 });
    });

    test('returns new data when lastData is empty', () => {
      const newData: DataWithId<{ x: number; y: number }>[] = [
        { id: '1', x: 100, y: 200 }
      ];

      const result = align(distanceSimilarity, [], newData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: '1', x: 100, y: 200 });
    });

    test('aligns data with similar positions', () => {
      const lastData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 200 }
      ];
      const newData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'b', x: 101, y: 200 } // Very close to 'a'
      ];

      const result = align(distanceSimilarity, lastData, newData);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a'); // Should remap to 'a'
      expect(result[0].x).toBe(101); // But keep new values
      expect(result[0].y).toBe(200);
    });

    test('keeps original id when no good match found', () => {
      const lastData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 200 }
      ];
      const newData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'b', x: 500, y: 500 } // Far from 'a'
      ];

      // With default threshold of 0, this should be considered new
      const result = align(distanceSimilarity, lastData, newData);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b'); // Keep original id
    });

    test('uses matchThreshold to filter matches', () => {
      const lastData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 200 }
      ];
      const newData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'b', x: 150, y: 200 } // Distance = 50, score = 50
      ];

      // With threshold of 60, this should be a new item (score 50 < 60)
      const result = align(distanceSimilarity, lastData, newData, { matchThreshold: 60 });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b'); // Too far, keep as new
    });

    test('handles multiple items', () => {
      const lastData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 100 },
        { id: 'b', x: 200, y: 200 }
      ];
      const newData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'c', x: 101, y: 101 }, // Close to 'a'
        { id: 'd', x: 201, y: 201 }  // Close to 'b'
      ];

      const result = align(distanceSimilarity, lastData, newData);

      expect(result).toHaveLength(2);
      const idA = result.find(r => r.id === 'a');
      const idB = result.find(r => r.id === 'b');

      expect(idA).toBeDefined();
      expect(idA!.x).toBe(101);
      expect(idB).toBeDefined();
      expect(idB!.x).toBe(201);
    });

    test('handles mixed new and existing items', () => {
      const lastData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 100 }
      ];
      const newData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'b', x: 101, y: 101 }, // Close to 'a'
        { id: 'c', x: 500, y: 500 }  // Far away, new
      ];

      const result = align(distanceSimilarity, lastData, newData);

      expect(result).toHaveLength(2);
      expect(result.some(r => r.id === 'a')).toBe(true);
      expect(result.some(r => r.id === 'c')).toBe(true);
    });

    test('logs debug messages when debug option is true', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      const lastData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 100 }
      ];
      const newData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'b', x: 500, y: 500 } // Far away, won't match
      ];

      align(distanceSimilarity, lastData, newData, { debug: true });

      // Should have debug output
      expect(consoleDebugSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleDebugSpy.mockRestore();
    });

    test('throws when lastData contains undefined', () => {
      const lastData = [undefined] as any;
      const newData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 100 }
      ];

      expect(() => align(distanceSimilarity, lastData, newData)).toThrow('contains undefined');
    });

    test('handles exact same position', () => {
      const lastData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 100 }
      ];
      const newData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'b', x: 100, y: 100 } // Exact same position
      ];

      const result = align(distanceSimilarity, lastData, newData);

      expect(result[0].id).toBe('a'); // Should match
      expect(result[0].x).toBe(100);
    });

    test('does not modify input arrays', () => {
      const lastData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 100 }
      ];
      const newData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'b', x: 101, y: 101 }
      ];

      const lastDataCopy = JSON.parse(JSON.stringify(lastData));
      const newDataCopy = JSON.parse(JSON.stringify(newData));

      align(distanceSimilarity, lastData, newData);

      expect(lastData).toEqual(lastDataCopy);
      expect(newData).toEqual(newDataCopy);
    });

    test('handles complex data structures', () => {
      type Item = { pos: { x: number; y: number }; color: string };
      const similarity: Similarity<Item> = (a, b) => {
        const dx = a.pos.x - b.pos.x;
        const dy = a.pos.y - b.pos.y;
        return 100 - Math.sqrt(dx * dx + dy * dy); // Positive score for close items
      };

      const lastData: DataWithId<Item>[] = [
        { id: 'item1', pos: { x: 10, y: 20 }, color: 'red' }
      ];
      const newData: DataWithId<Item>[] = [
        { id: 'item2', pos: { x: 11, y: 21 }, color: 'blue' }
      ];

      const result = align(similarity, lastData, newData);

      expect(result[0].id).toBe('item1');
      expect(result[0].color).toBe('blue'); // New color
    });
  });

  describe('alignById', () => {
    const distanceSimilarity: Similarity<{ x: number; y: number }> = (a, b) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return 100 - dist; // Positive score for close items
    };

    test('creates aligner function', () => {
      const aligner = alignById(distanceSimilarity);
      expect(typeof aligner).toBe('function');
    });

    test('maintains state between calls', () => {
      const aligner = alignById(distanceSimilarity);

      const firstData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 100 }
      ];
      const secondData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'b', x: 101, y: 101 } // Close to 'a'
      ];

      const result1 = aligner(firstData);
      expect(result1[0].id).toBe('a');

      const result2 = aligner(secondData);
      expect(result2[0].id).toBe('a'); // Should remap to 'a'
    });

    test('handles multiple calls with tracking', () => {
      const aligner = alignById(distanceSimilarity);

      // First frame
      const frame1 = aligner([
        { id: '1', x: 100, y: 100 },
        { id: '2', x: 200, y: 200 }
      ]);
      expect(frame1).toHaveLength(2);

      // Second frame - items moved slightly
      const frame2 = aligner([
        { id: 'a', x: 101, y: 101 }, // Close to '1'
        { id: 'b', x: 201, y: 201 }  // Close to '2'
      ]);
      expect(frame2).toHaveLength(2);
      expect(frame2.some(item => item.id === '1')).toBe(true);
      expect(frame2.some(item => item.id === '2')).toBe(true);
    });

    test('accepts options', () => {
      const aligner = alignById(distanceSimilarity, { matchThreshold: 0.5 });

      const firstData: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 100 }
      ];
      
      const result = aligner(firstData);
      expect(result).toHaveLength(1);
    });

    test('returns new array each time', () => {
      const aligner = alignById(distanceSimilarity);

      const data: DataWithId<{ x: number; y: number }>[] = [
        { id: 'a', x: 100, y: 100 }
      ];

      const result1 = aligner(data);
      const result2 = aligner(data);

      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });

    test('handles empty arrays', () => {
      const aligner = alignById(distanceSimilarity);

      const result1 = aligner([]);
      expect(result1).toEqual([]);

      const result2 = aligner([]);
      expect(result2).toEqual([]);
    });
  });

  describe('edge cases', () => {
    test('align with single item arrays', () => {
      const similarity: Similarity<{ v: number }> = (a, b) => {
        return a.v === b.v ? 1 : 0;
      };

      const lastData: DataWithId<{ v: number }>[] = [
        { id: 'x', v: 5 }
      ];
      const newData: DataWithId<{ v: number }>[] = [
        { id: 'y', v: 5 }
      ];

      const result = align(similarity, lastData, newData);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('x');
    });

    test('align when all items are new', () => {
      const similarity: Similarity<{ v: number }> = (a, b) => {
        return -Math.abs(a.v - b.v);
      };

      const lastData: DataWithId<{ v: number }>[] = [
        { id: 'a', v: 1 }
      ];
      const newData: DataWithId<{ v: number }>[] = [
        { id: 'b', v: 100 },
        { id: 'c', v: 200 }
      ];

      const result = align(similarity, lastData, newData, { matchThreshold: -10 });

      expect(result).toHaveLength(2);
      expect(result.some(r => r.id === 'b')).toBe(true);
      expect(result.some(r => r.id === 'c')).toBe(true);
    });

    test('align preserves additional properties', () => {
      const similarity: Similarity<{ x: number; extra: string }> = (a, b) => {
        return a.x === b.x ? 1 : 0;
      };

      const lastData: DataWithId<{ x: number; extra: string }>[] = [
        { id: 'a', x: 5, extra: 'old' }
      ];
      const newData: DataWithId<{ x: number; extra: string }>[] = [
        { id: 'b', x: 5, extra: 'new' }
      ];

      const result = align(similarity, lastData, newData);

      expect(result[0].extra).toBe('new');
      expect(result[0].x).toBe(5);
    });
  });
});