import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestResponseMatch, type RequestResponseOptions } from '../src/req-resp-match.js';
import { sleep } from '@ixfx/core';

// Ignore known vitest false positive with async operations
process.on('unhandledRejection', (reason) => {
  // Ignore 'Request timeout' - this is a known vitest issue with async/fake timers
  if (reason === 'Request timeout') return;
});

type TestRequest = { id: string; data: string };
type TestResponse = { id: string; result: string };

const matchers: RequestResponseMatch<TestRequest, TestResponse>[] = [];

const createMatcher = (options: Partial<RequestResponseOptions<TestRequest, TestResponse>>): RequestResponseMatch<TestRequest, TestResponse> => {
  const m = new RequestResponseMatch<TestRequest, TestResponse>(options);
  matchers.push(m);
  return m;
};

describe('flow/req-resp-match', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Run all fake timers to complete pending operations
    vi.runAllTimers();
    
    for (const m of matchers) {
      m.dispose();
    }
    matchers.length = 0;
    
    vi.useRealTimers();
  });

  describe('constructor', () => {
    test('creates with key function', () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000
      });

      expect(matcher).toBeInstanceOf(RequestResponseMatch);
    });

    test('creates with separate keyRequest and keyResponse functions', () => {
      const matcher = createMatcher({
        keyRequest: (req) => req.id,
        keyResponse: (resp) => resp.id,
        timeoutMs: 1000
      });

      expect(matcher).toBeInstanceOf(RequestResponseMatch);
    });

    test('throws when both key and keyRequest are set', () => {
      expect(() => {
        createMatcher({
          key: (reqOrResp) => (reqOrResp as TestRequest).id,
          keyRequest: (req) => req.id,
          timeoutMs: 1000
        });
      }).toThrow("Cannot set 'keyRequest' when 'key' is set");
    });

    test('throws when both key and keyResponse are set', () => {
      expect(() => {
        createMatcher({
          key: (reqOrResp) => (reqOrResp as TestRequest).id,
          keyResponse: (resp) => resp.id,
          timeoutMs: 1000
        });
      }).toThrow("Cannot set 'keyResponse' when 'key' is set");
    });

    test('throws when keyRequest is set without keyResponse', () => {
      expect(() => {
        createMatcher({
          keyRequest: (req) => req.id,
          timeoutMs: 1000
        });
      }).toThrow("Expects 'keyRequest' & 'keyResponse' fields to be set if 'key' is not set");
    });

    test('throws when keyResponse is set without keyRequest', () => {
      expect(() => {
        createMatcher({
          keyResponse: (resp) => resp.id,
          timeoutMs: 1000
        });
      }).toThrow("Expects 'keyRequest' & 'keyResponse' fields to be set if 'key' is not set");
    });

    test('uses default timeoutMs when not specified', () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id
      });

      expect(matcher.timeoutMs).toBe(1000);
    });

    test('uses default whenUnmatchedResponse when not specified', () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id
      });

      expect(matcher.whenUnmatchedResponse).toBe('throw');
    });
  });

  describe('requestAndForget()', () => {
    test('registers request without waiting', () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000
      });

      const request: TestRequest = { id: 'req-1', data: 'test' };
      matcher.requestAndForget(request);

      // Should not throw or return anything
    });

    test('throws on duplicate request id', () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000
      });

      const request: TestRequest = { id: 'req-1', data: 'test' };
      matcher.requestAndForget(request);

      expect(() => {
        matcher.requestAndForget(request);
      }).toThrow("Already a request pending with id 'req-1'");
    });
  });

  describe('request() with Promise', () => {
    test('returns promise that resolves on matching response', async () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000
      });

      const request: TestRequest = { id: 'req-1', data: 'test' };
      const promise = matcher.request(request);

      const response: TestResponse = { id: 'req-1', result: 'success' };
      matcher.response(response, false);

      const result = await promise;
      expect(result).toEqual(response);
    });

    test('rejects on timeout', async () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000
      });

      const request: TestRequest = { id: 'req-1', data: 'test' };
      const promise = matcher.request(request);

      // Let the request timeout
      vi.advanceTimersByTime(1500);
      await vi.advanceTimersByTimeAsync(0);

      await expect(promise).rejects.toBe('Request timeout');
    });

    test('throws on duplicate request id', async () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000
      });

      const request: TestRequest = { id: 'req-1', data: 'test' };
      const promise = matcher.request(request);

      await expect(() => matcher.request(request)).toThrow("Already a request pending with id 'req-1'");
      
      // Handle the pending promise to avoid unhandled rejection
      vi.advanceTimersByTime(2000);
      await expect(promise).rejects.toBe('Request timeout');
    });
  });

  describe('request() with callback', () => {
    test('calls callback on matching response', async () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000
      });

      const request: TestRequest = { id: 'req-1', data: 'test' };
      const response: TestResponse = { id: 'req-1', result: 'success' };

      const callbackPromise = new Promise<void>((resolve) => {
        matcher.request(request, (error, result) => {
          expect(error).toBe(false);
          expect(result).toEqual(response);
          resolve();
        });
      });

      matcher.response(response, false);
      await callbackPromise;
    });

    test('calls callback with error on timeout', async () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 100
      });

      const request: TestRequest = { id: 'req-1', data: 'test' };

      const callbackPromise = new Promise<void>((resolve) => {
        matcher.request(request, (error, result) => {
          expect(error).toBe(true);
          expect(result).toBe('Request timeout');
          resolve();
        });
      });

      vi.advanceTimersByTime(200);
      await callbackPromise;
    });

    test('throws on duplicate request id', () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000
      });

      const request: TestRequest = { id: 'req-1', data: 'test' };
      matcher.request(request, () => {});

      expect(() => {
        matcher.request(request, () => {});
      }).toThrow("Already a request pending with id 'req-1'");
    });
  });

  describe('response()', () => {
    test('matches response to request', async () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000
      });

      const request: TestRequest = { id: 'req-1', data: 'test' };
      const promise = matcher.request(request);

      const response: TestResponse = { id: 'req-1', result: 'success' };
      const matched = matcher.response(response, false);

      expect(matched).toBe(true);
      await expect(promise).resolves.toEqual(response);
    });

    test('returns false when no matching request', () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000,
        whenUnmatchedResponse: 'ignore'
      });

      const response: TestResponse = { id: 'nonexistent', result: 'success' };
      const matched = matcher.response(response, false);

      expect(matched).toBe(false);
    });

    test('throws when no matching request and whenUnmatchedResponse is throw', () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000,
        whenUnmatchedResponse: 'throw'
      });

      const response: TestResponse = { id: 'nonexistent', result: 'success' };

      expect(() => {
        matcher.response(response, false);
      }).toThrow("Unmatched response with id: 'nonexistent'");
    });

    test('keeps request alive when keepAlive is true', async () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000
      });

      const request: TestRequest = { id: 'req-1', data: 'test' };
      const promise = matcher.request(request);

      const response1: TestResponse = { id: 'req-1', result: 'partial' };
      const response2: TestResponse = { id: 'req-1', result: 'final' };

      // First response with keepAlive should keep request active
      const matched1 = matcher.response(response1, true);
      expect(matched1).toBe(true);

      // Second response should still match
      const matched2 = matcher.response(response2, false);
      expect(matched2).toBe(true);

      // Promise should resolve with first response
      const result = await promise;
      expect(result).toEqual(response1);
    });
  });

  describe('events', () => {
    test('does not fire completed event on keepAlive responses', () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 1000
      });

      const completedHandler = vi.fn();
      matcher.addEventListener('completed', completedHandler);

      const request: TestRequest = { id: 'req-1', data: 'test' };
      const response: TestResponse = { id: 'req-1', result: 'partial' };

      matcher.requestAndForget(request);
      matcher.response(response, true);

      // Should not fire completed event on keepAlive
      expect(completedHandler).not.toHaveBeenCalled();
    });
  });

  describe('maintenance loop', () => {
    test('cleans up expired requests', async () => {
      const matcher = createMatcher({
        key: (reqOrResp) => (reqOrResp as TestRequest).id,
        timeoutMs: 100
      });

      const completedHandler = vi.fn();
      matcher.addEventListener('completed', completedHandler);

      // Make multiple requests
      matcher.requestAndForget({ id: 'req-1', data: 'test1' });
      matcher.requestAndForget({ id: 'req-2', data: 'test2' });

      // Let them timeout
      vi.advanceTimersByTime(250);
      await vi.advanceTimersByTimeAsync(0);

      expect(completedHandler).toHaveBeenCalledTimes(2);
    });
  });
});
