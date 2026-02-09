import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest';
import { resolveEl, resolveElementTry, resolveEls } from '../src/resolve-el.js';

describe('resolve-el', () => {
  describe('resolveEl', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.createElement('div');
      mockElement.id = 'test-element';
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('resolves string selector to element', () => {
      const querySelectorSpy = vi.spyOn(document, 'querySelector').mockReturnValue(mockElement);
      
      const result = resolveEl('#test-element');
      
      expect(querySelectorSpy).toHaveBeenCalledWith('#test-element');
      expect(result).toBe(mockElement);
    });

    test('resolves element passed directly', () => {
      const result = resolveEl(mockElement);
      
      expect(result).toBe(mockElement);
    });

    test('throws when selector does not match', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);
      
      expect(() => resolveEl('#nonexistent')).toThrow("Query '#nonexistent' did not match anything");
    });

    test('throws when element is null', () => {
      expect(() => resolveEl(null as any)).toThrow("Param 'domQueryOrEl' is null");
    });

    test('throws when element is undefined', () => {
      expect(() => resolveEl(undefined as any)).toThrow("Param 'domQueryOrEl' is undefined");
    });

    test('suggests #id syntax when selector without # does not match', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);
      
      expect(() => resolveEl('testId')).toThrow("Did you mean '#testId?");
    });

    test('preserves generic type', () => {
      const mockInput = document.createElement('input');
      vi.spyOn(document, 'querySelector').mockReturnValue(mockInput);
      
      const result = resolveEl<HTMLInputElement>('#my-input');
      
      expect(result).toBe(mockInput);
    });
  });

  describe('resolveElementTry', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.createElement('div');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('returns success when selector matches', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement);
      
      const result = resolveElementTry('#test');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(mockElement);
      }
    });

    test('returns success when element passed directly', () => {
      const result = resolveElementTry(mockElement);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(mockElement);
      }
    });

    test('returns failure when selector does not match', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);
      
      const result = resolveElementTry('#nonexistent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("did not match anything");
      }
    });

    test('returns failure for null input', () => {
      const result = resolveElementTry(null);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('null');
      }
    });

    test('returns failure for undefined input', () => {
      const result = resolveElementTry(undefined);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('undefined');
      }
    });

    test('provides helpful error for id-like strings', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);
      
      const result = resolveElementTry('myId');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Did you mean '#myId?");
      }
    });

    test('provides standard error for selector strings', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);
      
      const result = resolveElementTry('#myId');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Try '#id'");
      }
    });
  });

  describe('resolveEls', () => {
    let mockElements: HTMLElement[];

    beforeEach(() => {
      mockElements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div')
      ];
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('returns empty array for undefined', () => {
      const result = resolveEls(undefined as any);
      
      expect(result).toEqual([]);
    });

    test('returns empty array for null', () => {
      const result = resolveEls(null as any);
      
      expect(result).toEqual([]);
    });

    test('returns array unchanged when passed array', () => {
      const result = resolveEls(mockElements);
      
      expect(result).toBe(mockElements);
    });

    test('queries document for string selector', () => {
      const querySelectorAllSpy = vi.spyOn(document, 'querySelectorAll').mockReturnValue(mockElements as any);
      
      const result = resolveEls('.test-class');
      
      expect(querySelectorAllSpy).toHaveBeenCalledWith('.test-class');
      expect(result).toEqual(mockElements);
    });

    test('wraps single element in array', () => {
      const singleElement = document.createElement('div');
      
      const result = resolveEls(singleElement);
      
      expect(result).toEqual([singleElement]);
    });

    test('handles mixed element array', () => {
      const mixedElements: Element[] = [
        document.createElement('div'),
        document.createElement('span')
      ];
      
      const result = resolveEls(mixedElements as any);
      
      expect(result).toEqual(mixedElements);
    });
  });
});
