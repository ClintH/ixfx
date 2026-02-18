import { describe, test, expect } from 'vitest';
import { observable, observableWritable } from '../../src/from/observable.js';
import { manual } from '../../src/index.js';

describe('rx/from/observable', () => {
  describe('observable', () => {
    test('calls init on first subscriber', () => {
      let initCalled = false;
      const o = observable<number>((stream) => {
        initCalled = true;
        stream.set(1);
        return () => {};
      });

      expect(initCalled).toBe(false);

      o.onValue(() => {});

      expect(initCalled).toBe(true);
    });

    test('emits values via stream.set', () => {
      const values: number[] = [];
      const o = observable<number>((stream) => {
        stream.set(1);
        stream.set(2);
        stream.set(3);
        return () => {};
      });

      o.onValue(v => values.push(v));

      expect(values).toEqual([1, 2, 3]);
    });

    test('unsubscribe stops receiving values', () => {
      const values: number[] = [];

      const o = observable<number>((stream) => {
        let n = 0;
        const interval = setInterval(() => {
          stream.set(++n);
        }, 10);
        return () => clearInterval(interval);
      });

      const unsub = o.onValue(v => values.push(v));
      unsub();
    });

    test('dispose marks as disposed', () => {
      const o = observable<number>((stream) => {
        stream.set(1);
        return () => {};
      });

      expect(o.isDisposed()).toBe(false);
      o.dispose('test');
      expect(o.isDisposed()).toBe(true);
    });
  });

  describe('observableWritable', () => {
    test('allows writing via stream.set', () => {
      const values: number[] = [];
      const ow = observableWritable<number>((stream) => {
        stream.set(1);
        return () => {};
      });

      ow.onValue(v => values.push(v));

      expect(values).toEqual([1]);
    });

    test('provides set method', () => {
      const o = observableWritable<number>((stream) => {
        stream.set(0);
        return () => {};
      });

      const values: number[] = [];
      o.onValue(v => values.push(v));

      o.set(5);
      o.set(10);

      expect(values).toContain(5);
      expect(values).toContain(10);
    });

    test('dispose marks as disposed', () => {
      const ow = observableWritable<number>((stream) => {
        stream.set(1);
        return () => {};
      });

      expect(ow.isDisposed()).toBe(false);
      ow.dispose('test');
      expect(ow.isDisposed()).toBe(true);
    });
  });
});
