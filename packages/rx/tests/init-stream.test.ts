import { describe, test, expect } from 'vitest';
import { initStream, initLazyStream, initLazyStreamWithInitial, initUpstream } from '../src/init-stream.js';

describe('rx/init-stream', () => {
  describe('initStream', () => {
    test('creates stream with on/off subscriptions', () => {
      const stream = initStream<number>();
      const values: number[] = [];

      const unsub = stream.on((msg) => {
        if (msg.value !== undefined) {
          values.push(msg.value);
        }
      });

      stream.set(1);
      stream.set(2);
      expect(values).toEqual([1, 2]);

      unsub();
      stream.set(3);
      expect(values).toEqual([1, 2]);
    });

    test('throws when subscribing to disposed stream', () => {
      const stream = initStream<string>();
      stream.dispose('test');
      expect(() => stream.on(() => {})).toThrow('Disposed');
    });

    test('throws when setting value on disposed stream', () => {
      const stream = initStream<string>();
      stream.dispose('test');
      expect(() => stream.set('test')).toThrow('Disposed');
    });

    test('signals disposed after dispose', () => {
      const stream = initStream<string>();
      expect(stream.isDisposed()).toBe(false);
      stream.dispose('test');
      expect(stream.isDisposed()).toBe(true);
    });

    test('onValue only receives values', () => {
      const stream = initStream<string>();
      const values: string[] = [];
      const signals: string[] = [];

      stream.onValue((v) => values.push(v));
      stream.on((msg) => {
        if (msg.signal) signals.push(msg.signal);
      });

      stream.set('a');
      stream.signal('done', 'test');
      stream.set('b');

      expect(values).toEqual(['a', 'b']);
      expect(signals).toEqual(['done']);
    });

    test('onFirstSubscribe callback', () => {
      let firstSubscribeCalled = false;
      const stream = initStream<string>({
        onFirstSubscribe: () => {
          firstSubscribeCalled = true;
        }
      });

      expect(firstSubscribeCalled).toBe(false);
      const unsub = stream.on(() => {});
      expect(firstSubscribeCalled).toBe(true);

      // Should not be called again for subsequent subscribers
      firstSubscribeCalled = false;
      const unsub2 = stream.on(() => {});
      expect(firstSubscribeCalled).toBe(false);
    });

    test('onNoSubscribers callback', () => {
      let noSubscribersCalled = false;
      const stream = initStream<string>({
        onNoSubscribers: () => {
          noSubscribersCalled = true;
        }
      });

      const unsub = stream.on(() => {});
      expect(noSubscribersCalled).toBe(false);

      unsub();
      expect(noSubscribersCalled).toBe(true);
    });

    test('removeAllSubscribers clears all handlers', () => {
      const stream = initStream<number>();
      const values: number[] = [];

      stream.onValue((v) => values.push(v));
      stream.onValue((v) => values.push(v * 2));

      stream.set(1);
      expect(values).toEqual([1, 2]);

      stream.removeAllSubscribers();
      stream.set(2);
      expect(values).toEqual([1, 2]);
    });

    test('signal sends signal message', () => {
      const stream = initStream<string>();
      const signals: { signal: string; context?: string }[] = [];

      stream.on((msg) => {
        if (msg.signal) {
          signals.push({ signal: msg.signal, context: msg.context });
        }
      });

      stream.signal('done', 'test context');
      expect(signals).toEqual([{ signal: 'done', context: 'test context' }]);
    });

    test('dispose notifies subscribers with done signal', () => {
      const stream = initStream<string>();
      const signals: string[] = [];

      stream.on((msg) => {
        if (msg.signal === 'done') {
          signals.push(msg.context || 'no context');
        }
      });

      stream.dispose('manual dispose');
      expect(signals).toEqual(['Disposed: manual dispose']);
    });

    test('dispose is idempotent', () => {
      const stream = initStream<string>();
      let disposeCount = 0;

      stream.on(() => {});
      
      // dispose multiple times - should not throw
      stream.dispose('test');
      stream.dispose('test');
      stream.dispose('test');

      expect(stream.isDisposed()).toBe(true);
    });

    test('onDispose callback', () => {
      let disposeReason = '';
      const stream = initStream<string>({
        onDispose: (reason) => {
          disposeReason = reason;
        }
      });

      stream.on(() => {});
      stream.dispose('cleanup');
      expect(disposeReason).toBe('cleanup');
    });
  });

  describe('initLazyStream', () => {
    test('default lazy: initial', () => {
      let started = false;
      let stopped = false;

      const stream = initLazyStream<string>({
        onStart: () => { started = true; },
        onStop: () => { stopped = true; }
      });

      // Should not start until first subscriber
      expect(started).toBe(false);

      const unsub = stream.on(() => {});
      expect(started).toBe(true);

      unsub();
      // Default 'initial' lazy - should NOT stop when no subscribers
      expect(stopped).toBe(false);
    });

    test('lazy: very stops when no subscribers', () => {
      let stopped = false;

      const stream = initLazyStream<string>({
        lazy: 'very',
        onStart: () => { /* start */ },
        onStop: () => { stopped = true; }
      });

      const unsub = stream.on(() => {});
      expect(stopped).toBe(false);

      unsub();
      expect(stopped).toBe(true);
    });

    test('lazy: never starts immediately', () => {
      let started = false;

      const stream = initLazyStream<string>({
        lazy: 'never',
        onStart: () => { started = true; },
        onStop: () => { /* stop */ }
      });

      expect(started).toBe(true);
    });

    test('dispose works correctly', () => {
      const stream = initLazyStream<number>({
        onStart: () => { /* start */ },
        onStop: () => { /* stop */ }
      });
      const values: number[] = [];

      stream.onValue(v => values.push(v));
      stream.set(1);
      stream.set(2);
      
      stream.dispose('done');
      
      expect(() => stream.set(3)).toThrow('Disposed');
      expect(values).toEqual([1, 2]);
    });

    test('multiple subscriptions work', () => {
      const stream = initLazyStream<number>({
        onStart: () => { /* start */ },
        onStop: () => { /* stop */ }
      });
      const values1: number[] = [];
      const values2: number[] = [];

      const unsub1 = stream.onValue(v => values1.push(v));
      const unsub2 = stream.onValue(v => values2.push(v));

      stream.set(1);
      stream.set(2);

      expect(values1).toEqual([1, 2]);
      expect(values2).toEqual([1, 2]);

      unsub1();
      stream.set(3);

      expect(values1).toEqual([1, 2]);
      expect(values2).toEqual([1, 2, 3]);

      unsub2();
    });
  });

  describe('initLazyStreamWithInitial', () => {
    test('provides initial value', () => {
      const stream = initLazyStreamWithInitial<number>({
        initialValue: 42,
        onStart: () => { /* start */ },
        onStop: () => { /* stop */ }
      });

      expect(stream.last()).toBe(42);

      stream.set(100);
      expect(stream.last()).toBe(100);
    });

    test('onValue receives new values after subscription', () => {
      const stream = initLazyStreamWithInitial<string>({
        initialValue: 'start',
        onStart: () => { /* start */ },
        onStop: () => { /* stop */ }
      });
      const values: string[] = [];

      // Subscribe first - initial value may not be emitted depending on implementation
      stream.onValue(v => values.push(v));
      
      // Now emit new values
      stream.set('middle');
      stream.set('end');

      // Should receive values set after subscription
      expect(values).toEqual(['middle', 'end']);
    });
  });

  describe('initUpstream', () => {
    test('subscribes to upstream and passes values', () => {
      const upstream = initStream<number>();
      const values: number[] = [];

      const downstream = initUpstream<number, number>(upstream, {
        onValue: (v) => {
          values.push(v);
        }
      });

      // Subscribe to downstream to trigger start and upstream subscription
      downstream.onValue(v => values.push(v));

      upstream.set(1);
      upstream.set(2);
      upstream.set(3);

      expect(values).toEqual([1, 2, 3]);
    });

    test('propagates dispose from upstream', () => {
      const upstream = initStream<string>();
      const downstream = initUpstream<string, string>(upstream, {
        onValue: () => {}
      });

      // Subscribe to start listening
      downstream.on(() => {});

      expect(downstream.isDisposed()).toBe(false);
      upstream.dispose('upstream done');
      expect(downstream.isDisposed()).toBe(true);
    });

    test('does not dispose if disposeIfSourceDone is false', () => {
      const upstream = initStream<string>();
      const downstream = initUpstream<string, string>(upstream, {
        onValue: () => {},
        disposeIfSourceDone: false
      });

      // Subscribe to start listening
      downstream.on(() => {});

      upstream.dispose('upstream done');
      expect(downstream.isDisposed()).toBe(false);
    });

    test('onStart callback is triggered on subscription', () => {
      let started = false;
      const upstream = initStream<string>();

      const downstream = initUpstream<string, string>(upstream, {
        onValue: () => {},
        onStart: () => { started = true; }
      });

      // Subscribe to downstream to trigger start
      downstream.on(() => {});
      
      expect(started).toBe(true);
    });

    test('onStop callback in lazy: very mode', () => {
      let stopped = false;
      const upstream = initStream<string>();

      const downstream = initUpstream<string, string>(upstream, {
        onValue: () => {},
        lazy: 'very',
        onStop: () => { stopped = true; }
      });

      const unsub = downstream.on(() => {});
      expect(stopped).toBe(false);

      unsub();
      expect(stopped).toBe(true);
    });
  });
});