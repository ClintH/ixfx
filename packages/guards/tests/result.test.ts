import { describe, test, expect } from 'vitest';
import {
  getErrorMessage,
  throwIfFailed,
  resultThrow,
  resultThrowSingle,
  resultFirstFail_,
  resultIsError,
  resultIsOk,
  IxfxError,
  resultToError,
  resultToValue,
  resultErrorToString,
  errorResult,
  resultsCollate,
  resultWithFail
} from '../src/result.js';
import type { Result, ResultOk, ResultError } from '../src/types.js';

describe('guards/result', () => {
  describe('getErrorMessage', () => {
    test('returns string as-is', () => {
      expect(getErrorMessage('error message')).toBe('error message');
    });

    test('extracts message from Error', () => {
      const error = new Error('test error');
      expect(getErrorMessage(error)).toBe('test error');
    });

    test('casts non-string non-Error to string', () => {
      expect(getErrorMessage(123)).toBe('123');
      expect(getErrorMessage(null)).toBe('null');
      expect(getErrorMessage(undefined)).toBe('undefined');
    });
  });

  describe('throwIfFailed', () => {
    test('does not throw if all succeed', () => {
      const results: Result<any, any>[] = [
        { success: true, value: 1 },
        { success: true, value: 2 }
      ];
      expect(() => throwIfFailed(...results)).not.toThrow();
    });

    test('throws if any result fails', () => {
      const results: Result<any, any>[] = [
        { success: true, value: 1 },
        { success: false, error: 'failed' }
      ];
      expect(() => throwIfFailed(...results)).toThrow('failed');
    });

    test('combines multiple errors', () => {
      const results: Result<any, any>[] = [
        { success: false, error: 'error1' },
        { success: false, error: 'error2' }
      ];
      expect(() => throwIfFailed(...results)).toThrow('error1, error2');
    });
  });

  describe('resultThrow', () => {
    test('returns true if all succeed', () => {
      const results: Result<any, any>[] = [
        { success: true, value: 1 }
      ];
      expect(resultThrow(...results)).toBe(true);
    });

    test('throws on first failure', () => {
      const results: Result<any, any>[] = [
        { success: true, value: 1 },
        { success: false, error: 'failed' }
      ];
      expect(() => resultThrow(...results)).toThrow();
    });

    test('accepts functions that return results', () => {
      const fn = () => ({ success: true, value: 42 } as ResultOk<number>);
      expect(resultThrow(fn)).toBe(true);
    });

    test('throws if function returns error', () => {
      const fn = () => ({ success: false, error: 'function failed' } as ResultError<string>);
      expect(() => resultThrow(fn)).toThrow('function failed');
    });

    test('skips undefined results', () => {
      const results: any[] = [
        undefined,
        { success: true, value: 1 }
      ];
      expect(resultThrow(...results)).toBe(true);
    });
  });

  describe('resultThrowSingle', () => {
    test('returns true for success', () => {
      const result: ResultOk<number> = { success: true, value: 42 };
      expect(resultThrowSingle(result)).toBe(true);
    });

    test('throws for error', () => {
      const result: ResultError<string> = { success: false, error: 'failed' };
      expect(() => resultThrowSingle(result)).toThrow('failed');
    });
  });

  describe('resultFirstFail_', () => {
    test('returns undefined if all succeed', () => {
      const results: Result<any, any>[] = [
        { success: true, value: 1 },
        { success: true, value: 2 }
      ];
      expect(resultFirstFail_(...results)).toBeUndefined();
    });

    test('returns first error', () => {
      const results: Result<any, any>[] = [
        { success: true, value: 1 },
        { success: false, error: 'first' },
        { success: false, error: 'second' }
      ];
      const fail = resultFirstFail_(...results);
      expect(fail).toEqual({ success: false, error: 'first' });
    });
  });

  describe('resultIsError', () => {
    test('returns true for error result', () => {
      const result: ResultError<string> = { success: false, error: 'failed' };
      expect(resultIsError(result)).toBe(true);
    });

    test('returns false for success result', () => {
      const result: ResultOk<number> = { success: true, value: 42 };
      expect(resultIsError(result)).toBe(false);
    });

    test('returns false for non-object', () => {
      expect(resultIsError('string' as any)).toBe(false);
      expect(resultIsError(null as any)).toBe(false);
    });
  });

  describe('resultIsOk', () => {
    test('returns true for success result', () => {
      const result: ResultOk<number> = { success: true, value: 42 };
      expect(resultIsOk(result)).toBe(true);
    });

    test('returns false for error result', () => {
      const result: ResultError<string> = { success: false, error: 'failed' };
      expect(resultIsOk(result)).toBe(false);
    });

    test('returns false for non-object', () => {
      expect(resultIsOk('string' as any)).toBe(false);
    });
  });

  describe('IxfxError', () => {
    test('creates error with message', () => {
      const error = new IxfxError('test message');
      expect(error.message).toBe('test message');
      expect(error.cause).toBeUndefined();
    });

    test('creates error with cause', () => {
      const error = new IxfxError('test message', 'the cause');
      expect(error.message).toBe('test message');
      expect(error.cause).toBe('the cause');
    });

    test('fromError wraps Error', () => {
      const original = new Error('original');
      const wrapped = IxfxError.fromError(original, 'cause');
      expect(wrapped.message).toBe('original');
      expect(wrapped.cause).toBe('cause');
      expect(wrapped.name).toContain('IxfxError');
    });

    test('fromString creates error', () => {
      const error = IxfxError.fromString('message', 'cause');
      expect(error.message).toBe('message');
      expect(error.cause).toBe('cause');
      expect(error.name).toBe('IxfxError');
    });
  });

  describe('resultToError', () => {
    test('converts string error to IxfxError', () => {
      const result: ResultError<string> = { success: false, error: 'failed', info: 'details' };
      const error = resultToError(result);
      expect(error).toBeInstanceOf(IxfxError);
      expect(error.message).toBe('failed');
      expect((error as IxfxError).cause).toBe('details');
    });

    test('converts Error to IxfxError', () => {
      const original = new Error('original error');
      const result: ResultError<Error> = { success: false, error: original, info: 'cause' };
      const error = resultToError(result);
      expect(error.message).toBe('original error');
      expect((error as IxfxError).cause).toBe('cause');
    });

    test('converts object error to string', () => {
      const obj = { code: 500, message: 'server error' };
      const result: ResultError<typeof obj> = { success: false, error: obj };
      const error = resultToError(result);
      expect(error.message).toContain('500');
    });
  });

  describe('resultToValue', () => {
    test('returns value for success', () => {
      const result: ResultOk<number> = { success: true, value: 42 };
      expect(resultToValue(result)).toBe(42);
    });

    test('throws for error', () => {
      const result: ResultError<string> = { success: false, error: 'failed' };
      expect(() => resultToValue(result)).toThrow('failed');
    });
  });

  describe('resultErrorToString', () => {
    test('returns string error as-is', () => {
      const result: ResultError<string> = { success: false, error: 'failed' };
      expect(resultErrorToString(result)).toBe('failed');
    });

    test('extracts message from Error', () => {
      const result: ResultError<Error> = { success: false, error: new Error('test') };
      expect(resultErrorToString(result)).toBe('test');
    });

    test('stringifies object error', () => {
      const result: ResultError<{ code: number }> = { success: false, error: { code: 500 } };
      expect(resultErrorToString(result)).toBe('{"code":500}');
    });
  });

  describe('errorResult', () => {
    test('creates error result', () => {
      const result = errorResult('failed');
      expect(result).toEqual({ success: false, error: 'failed', info: undefined });
    });

    test('creates error result with info', () => {
      const result = errorResult('failed', 'additional info');
      expect(result).toEqual({ success: false, error: 'failed', info: 'additional info' });
    });
  });

  describe('resultsCollate', () => {
    test('returns last result if all succeed', () => {
      const results: Result<any, any>[] = [
        { success: true, value: 1 },
        { success: true, value: 2 }
      ];
      expect(resultsCollate(...results)).toEqual({ success: true, value: 2 });
    });

    test('returns first failure', () => {
      const results: Result<any, any>[] = [
        { success: true, value: 1 },
        { success: false, error: 'failed' },
        { success: true, value: 3 }
      ];
      expect(resultsCollate(...results)).toEqual({ success: false, error: 'failed' });
    });

    test('throws if no results', () => {
      expect(() => resultsCollate()).toThrow('No results');
    });

    test('accepts functions', () => {
      const fn = () => ({ success: true, value: 42 } as ResultOk<number>);
      expect(resultsCollate(fn)).toEqual({ success: true, value: 42 });
    });
  });

  describe('resultWithFail', () => {
    test('calls callback on error', () => {
      const result: ResultError<string> = { success: false, error: 'failed' };
      const callback = (r: ResultError<string>) => {
        expect(r.error).toBe('failed');
      };
      resultWithFail(result, callback);
    });

    test('does not call callback on success', () => {
      const result: ResultOk<number> = { success: true, value: 42 };
      let called = false;
      resultWithFail(result, () => { called = true; });
      expect(called).toBe(false);
    });
  });
});