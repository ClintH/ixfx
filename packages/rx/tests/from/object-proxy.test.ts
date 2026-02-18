import { describe, test, expect } from 'vitest';
import { objectProxy, arrayProxy } from '../../src/from/object-proxy.js';

describe('rx/from/object-proxy', () => {
  describe('objectProxy', () => {
    test('creates proxy and reactive from object', () => {
      const { proxy, rx } = objectProxy({ x: 10, y: 20 });

      expect(proxy.x).toBe(10);
      expect(proxy.y).toBe(20);
      expect(rx.last()).toEqual({ x: 10, y: 20 });
    });

    test('proxy property change emits on reactive', () => {
      const { proxy, rx } = objectProxy({ value: 0 });
      const values: any[] = [];

      rx.onValue(v => values.push(v));

      proxy.value = 42;

      expect(values).toContainEqual({ value: 42 });
      expect(rx.last()).toEqual({ value: 42 });
    });

    test('multiple property changes', () => {
      const { proxy, rx } = objectProxy({ a: 1, b: 2 });
      const values: any[] = [];

      rx.onValue(v => values.push(v));

      proxy.a = 10;
      proxy.b = 20;

      expect(values.length).toBeGreaterThanOrEqual(2);
    });

    test('dispose marks as disposed', () => {
      const { rx } = objectProxy({ x: 1 });

      expect(rx.isDisposed()).toBe(false);
      rx.dispose('test');
      expect(rx.isDisposed()).toBe(true);
    });

    test('multiple subscribers', () => {
      const { proxy, rx } = objectProxy({ value: 0 });
      const values1: any[] = [];
      const values2: any[] = [];

      rx.onValue(v => values1.push(v));
      rx.onValue(v => values2.push(v));

      proxy.value = 5;

      expect(values1).toContainEqual({ value: 5 });
      expect(values2).toContainEqual({ value: 5 });
    });
  });

  describe('arrayProxy', () => {
    test('creates proxy and reactive from array', () => {
      const { proxy, rx } = arrayProxy([1, 2, 3]);

      expect(proxy[0]).toBe(1);
      expect(rx.last()).toEqual([1, 2, 3]);
    });

    test('proxy index assignment emits on reactive', () => {
      const { proxy, rx } = arrayProxy([1, 2, 3]);
      const values: any[] = [];

      rx.onValue(v => values.push(v));

      proxy[1] = 99;

      expect(values).toContainEqual([1, 99, 3]);
      expect(rx.last()).toEqual([1, 99, 3]);
    });

    test('dispose marks as disposed', () => {
      const { rx } = arrayProxy([1, 2]);

      expect(rx.isDisposed()).toBe(false);
      rx.dispose('test');
      expect(rx.isDisposed()).toBe(true);
    });

    test('multiple index assignments', () => {
      const { proxy, rx } = arrayProxy([0, 0, 0]);
      const values: any[] = [];

      rx.onValue(v => values.push(v));

      proxy[0] = 1;
      proxy[1] = 2;
      proxy[2] = 3;

      expect(rx.last()).toEqual([1, 2, 3]);
    });
  });

  describe('edge cases', () => {
    test('nested objects work', () => {
      const { proxy, rx } = objectProxy({
        user: { profile: { name: 'test' } }
      });

      proxy.user.profile.name = 'updated';

      const last = rx.last() as { user: { profile: { name: string } } };
      expect(last.user.profile.name).toBe('updated');
    });

    test('array with objects works', () => {
      const { proxy, rx } = arrayProxy([{ id: 1 }, { id: 2 }]);

      proxy[0] = { id: 99 };

      expect(rx.last()[0].id).toBe(99);
    });
  });
});
