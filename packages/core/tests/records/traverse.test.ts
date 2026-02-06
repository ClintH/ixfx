import { describe, test, expect } from 'vitest';
import {
  prettyPrintEntries,
  recordEntryPrettyPrint,
  recordChildren,
  recordEntriesDepthFirst,
  getRecordEntryByPath,
  traceRecordEntryByPath,
  type RecordEntry,
  type RecordEntryWithAncestors
} from '../../src/records/traverse.js';

describe('core/records/traverse', () => {
  describe('prettyPrintEntries', () => {
    test('returns empty for empty array', () => {
      expect(prettyPrintEntries([])).toBe('(empty)');
    });

    test('formats single entry', () => {
      const entries: RecordEntry[] = [
        { name: 'test', sourceValue: 42, nodeValue: 42 }
      ];
      const result = prettyPrintEntries(entries);
      expect(result).toContain('test');
      expect(result).toContain('42');
    });

    test('formats multiple entries with indentation', () => {
      const entries: RecordEntry[] = [
        { name: 'a', sourceValue: 1, nodeValue: 1 },
        { name: 'b', sourceValue: 2, nodeValue: 2 }
      ];
      const result = prettyPrintEntries(entries);
      expect(result).toContain('a');
      expect(result).toContain('b');
    });

    test('handles nested objects', () => {
      const entries: RecordEntry[] = [
        { name: 'obj', sourceValue: { x: 1 }, nodeValue: undefined }
      ];
      const result = prettyPrintEntries(entries);
      expect(result).toContain('obj');
    });
  });

  describe('recordEntryPrettyPrint', () => {
    test('throws for null', () => {
      expect(() => recordEntryPrettyPrint(null as any)).toThrow();
    });

    test('throws for undefined', () => {
      expect(() => recordEntryPrettyPrint(undefined as any)).toThrow();
    });
  });

  describe('recordChildren', () => {
    test('gets children of simple object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const children = [...recordChildren(obj)];

      expect(children).toHaveLength(3);
      expect(children.map(c => c.name)).toContain('a');
      expect(children.map(c => c.name)).toContain('b');
      expect(children.map(c => c.name)).toContain('c');
    });

    test('gets children of nested object', () => {
      const obj = { outer: { inner: 'value' } };
      const children = [...recordChildren(obj)];

      expect(children).toHaveLength(1);
      expect(children[0].name).toBe('outer');
      expect(children[0].sourceValue).toEqual({ inner: 'value' });
    });

    test('gets children of array', () => {
      const arr = [10, 20, 30];
      const children = [...recordChildren(arr)];

      expect(children).toHaveLength(3);
      expect(children[0].name).toBe('0');
      expect(children[1].name).toBe('1');
      expect(children[2].name).toBe('2');
    });

    test('gets children of Map', () => {
      const map = new Map([['key1', 'value1'], ['key2', 'value2']]);
      const children = [...recordChildren(map as any)];

      expect(children).toHaveLength(2);
    });

    test('filters to leaves only', () => {
      const obj = { a: 1, b: { nested: 2 } };
      const children = [...recordChildren(obj, { filter: 'leaves' })];

      expect(children).toHaveLength(1);
      expect(children[0].name).toBe('a');
    });

    test('filters to branches only', () => {
      const obj = { a: 1, b: { nested: 2 } };
      const children = [...recordChildren(obj, { filter: 'branches' })];

      expect(children).toHaveLength(1);
      expect(children[0].name).toBe('b');
    });

    test('throws for null', () => {
      expect(() => [...recordChildren(null as any)]).toThrow();
    });

    test('throws for undefined', () => {
      expect(() => [...recordChildren(undefined as any)]).toThrow();
    });
  });

  describe('recordEntriesDepthFirst', () => {
    test('traverses simple object', () => {
      const obj = { a: 1, b: 2 };
      const entries = [...recordEntriesDepthFirst(obj)];

      expect(entries).toHaveLength(2);
    });

    test('traverses nested object depth-first', () => {
      const obj = {
        level1: {
          level2a: 'value1',
          level2b: 'value2'
        }
      };
      const entries = [...recordEntriesDepthFirst(obj)];

      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].name).toBe('level1');
    });

    test('includes ancestors', () => {
      const obj = {
        parent: {
          child: 'value'
        }
      };
      const entries = [...recordEntriesDepthFirst(obj)];

      const childEntry = entries.find((e: RecordEntryWithAncestors) => e.name === 'child');
      expect(childEntry).toBeDefined();
      expect(childEntry!.ancestors).toContain('parent');
    });

    test('handles empty object', () => {
      const obj = {};
      const entries = [...recordEntriesDepthFirst(obj)];

      expect(entries).toHaveLength(0);
    });
  });

  describe('getRecordEntryByPath', () => {
    test('finds entry by path', () => {
      const obj = {
        user: {
          name: 'John',
          address: {
            city: 'NYC'
          }
        }
      };

      const entry = getRecordEntryByPath('user.name', obj);
      expect(entry.sourceValue).toBe('John');
    });

    test('finds nested entry', () => {
      const obj = {
        a: {
          b: {
            c: 'deep'
          }
        }
      };

      const entry = getRecordEntryByPath('a.b.c', obj);
      expect(entry.sourceValue).toBe('deep');
    });

    test('returns undefined entry for non-existent path', () => {
      const obj = { a: 1 };
      const entry = getRecordEntryByPath('a.b.c', obj);
      expect(entry.sourceValue).toBeUndefined();
    });

    test('uses custom separator', () => {
      const obj = { a: { b: 'value' } };
      const entry = getRecordEntryByPath('a/b', obj, { separator: '/' });
      expect(entry.sourceValue).toBe('value');
    });


  });

  describe('traceRecordEntryByPath', () => {
    test('traces path through object', () => {
      const obj = {
        level1: {
          level2: 'value'
        }
      };

      const trace = [...traceRecordEntryByPath('level1.level2', obj)];
      expect(trace.length).toBeGreaterThan(0);
    });

    test('includes all path segments', () => {
      const obj = {
        a: { b: { c: 'deep' } }
      };

      const trace = [...traceRecordEntryByPath('a.b.c', obj)];
      expect(trace.length).toBeGreaterThanOrEqual(3);
    });

    test('throws for null path', () => {
      const obj = { a: 1 };
      expect(() => [...traceRecordEntryByPath(null as any, obj)]).toThrow();
    });

    test('throws for null node', () => {
      expect(() => [...traceRecordEntryByPath('a', null as any)]).toThrow();
    });
  });

  describe('edge cases', () => {
    test('handles circular references gracefully', () => {
      const obj: any = { a: 1 };
      obj.self = obj;

      // Should not throw
      const children = [...recordChildren(obj)];
      expect(children.length).toBeGreaterThan(0);
    });

    test('handles null values in object', () => {
      const obj = { a: null, b: undefined, c: 'value' };
      const children = [...recordChildren(obj)];

      expect(children.length).toBeGreaterThanOrEqual(1);
    });

    test('handles mixed array', () => {
      const arr = [1, 'string', { obj: true }, [1, 2]];
      const children = [...recordChildren(arr)];

      expect(children).toHaveLength(4);
    });

    test('handles deeply nested structure', () => {
      const obj = {
        a: {
          b: {
            c: {
              d: {
                e: 'deep'
              }
            }
          }
        }
      };

      const entries = [...recordEntriesDepthFirst(obj)];
      expect(entries.length).toBeGreaterThan(4);
    });
  });
});