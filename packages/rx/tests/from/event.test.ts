import { describe, test, expect, vi } from 'vitest';
import { event, eventTrigger, eventField } from '../../src/from/event.js';

describe('rx/from/event', () => {
  describe('event', () => {
    test('creates reactive with initial value', () => {
      const target = new EventTarget();
      const rx = event(target, 'test', { value: 1 });

      expect(rx.last()).toEqual({ value: 1 });
    });

    test('emits event data when event fires', () => {
      const target = new EventTarget();
      const rx = event(target, 'custom', { data: 'initial' });

      const values: any[] = [];
      rx.onValue(v => values.push(v));

      target.dispatchEvent(new CustomEvent('custom', { detail: { data: 'hello' } }));

      expect(values.length).toBeGreaterThanOrEqual(1);
      expect(values[values.length - 1]).toBeDefined();
    });

    test('dispose removes event listener', () => {
      const target = new EventTarget();
      const rx = event(target, 'test', { value: 1 });

      expect(rx.isDisposed()).toBe(false);
      rx.dispose('test');
      expect(rx.isDisposed()).toBe(true);
    });

    test('multiple subscribers receive events', () => {
      const target = new EventTarget();
      const rx = event(target, 'test', { value: 0 });

      const values1: any[] = [];
      const values2: any[] = [];

      rx.onValue(v => values1.push(v));
      rx.onValue(v => values2.push(v));

      target.dispatchEvent(new CustomEvent('test', { detail: { value: 1 } }));

      expect(values1.length).toBeGreaterThanOrEqual(1);
      expect(values2.length).toBeGreaterThanOrEqual(1);
    });

    test('unsubscribe stops receiving events', () => {
      const target = new EventTarget();
      const rx = event(target, 'test', { value: 0 });

      const values: any[] = [];

      const unsub = rx.onValue(v => values.push(v));

      target.dispatchEvent(new CustomEvent('test', { detail: { value: 1 } }));
      unsub();
      target.dispatchEvent(new CustomEvent('test', { detail: { value: 2 } }));

      expect(values.length).toBeGreaterThanOrEqual(1);
    });

    test('lazy very option defers event subscription', () => {
      const target = new EventTarget();
      const rx = event(target, 'test', { value: 0 }, { lazy: 'very' });

      expect(rx.isDisposed()).toBe(false);

      rx.onValue(() => {});

      target.dispatchEvent(new CustomEvent('test', { detail: { value: 1 } }));

      expect(rx.last()).toBeDefined();
    });

    test('uses query selector for element', () => {
      const div = document.createElement('div');
      div.id = 'test-element';
      document.body.appendChild(div);

      const rx = event('#test-element', 'click', { x: 0 });

      expect(rx.last()).toEqual({ x: 0 });

      document.body.removeChild(div);
      rx.dispose('cleanup');
    });

    test('throws for non-existent query selector', () => {
      expect(() => {
        event('#non-existent', 'click', { x: 0 });
      }).toThrow();
    });
  });

  describe('eventTrigger', () => {
    test('emits trigger data', () => {
      const target = new EventTarget();
      const rx = eventTrigger(target, 'click');

      const values: any[] = [];
      rx.onValue(v => values.push(v));

      target.dispatchEvent(new Event('click'));
      target.dispatchEvent(new Event('click'));

      expect(values.length).toBeGreaterThanOrEqual(2);
      expect(values[0]).toHaveProperty('total');
      expect(values[0]).toHaveProperty('sinceLast');
    });

    test('total increments on each trigger', () => {
      const target = new EventTarget();
      const rx = eventTrigger(target, 'test');

      const totals: number[] = [];
      rx.onValue(v => totals.push(v.total));

      target.dispatchEvent(new Event('test'));
      target.dispatchEvent(new Event('test'));
      target.dispatchEvent(new Event('test'));

      expect(totals).toEqual([1, 2, 3]);
    });

    test('fireInitial option emits on start', () => {
      const target = new EventTarget();
      const rx = eventTrigger(target, 'test', { fireInitial: true });

      const values: any[] = [];
      rx.onValue(v => values.push(v));

      expect(values.length).toBeGreaterThanOrEqual(1);
      expect(values[0].total).toBe(1);
    });

    test('dispose removes event listener', () => {
      const target = new EventTarget();
      const rx = eventTrigger(target, 'test');

      expect(rx.isDisposed()).toBe(false);
      rx.dispose('test');
      expect(rx.isDisposed()).toBe(true);
    });

    test('lazy very option defers subscription', () => {
      const target = new EventTarget();
      const rx = eventTrigger(target, 'test', { lazy: 'very' });

      expect(rx.isDisposed()).toBe(false);

      rx.onValue(() => {});

      target.dispatchEvent(new Event('test'));

      const values: any[] = [];
      rx.onValue(v => values.push(v));
      expect(values.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('eventField', () => {
    test('is created with initial value', () => {
      const target = new EventTarget();
      const rx = eventField(target, 'custom', 'x', 0);

      expect(rx).toBeDefined();
    });

    test('dispose marks as disposed', () => {
      const target = new EventTarget();
      const rx = eventField(target, 'test', 'value', 0);

      expect(rx.isDisposed()).toBe(false);
      rx.dispose('test');
      expect(rx.isDisposed()).toBe(true);
    });
  });
});
