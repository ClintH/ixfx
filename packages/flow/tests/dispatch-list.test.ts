import { describe, test, expect, vi } from 'vitest';
import { DispatchList } from '../src/dispatch-list.js';

describe('flow/dispatch-list', () => {
  test('creates empty dispatch list', () => {
    const list = new DispatchList<string>();
    expect(list.isEmpty()).toBe(true);
  });

  test('adds handler and returns id', () => {
    const list = new DispatchList<string>();
    const id = list.add((value) => {
      console.log(value);
    });
    
    expect(typeof id).toBe('string');
    expect(list.isEmpty()).toBe(false);
  });

  test('notifies all handlers', () => {
    const list = new DispatchList<string>();
    const values: string[] = [];
    
    list.add((value) => values.push(value));
    list.add((value) => values.push(value.toUpperCase()));
    
    list.notify('hello');
    
    expect(values).toEqual(['hello', 'HELLO']);
  });

  test('removes handler by id', () => {
    const list = new DispatchList<string>();
    const values: string[] = [];
    
    const id = list.add((value) => values.push(value));
    list.add((value) => values.push(value.toUpperCase()));
    
    const removed = list.remove(id);
    expect(removed).toBe(true);
    
    list.notify('test');
    expect(values).toEqual(['TEST']); // Only second handler called
  });

  test('returns false when removing non-existent id', () => {
    const list = new DispatchList<string>();
    const removed = list.remove('non-existent-id');
    expect(removed).toBe(false);
  });

  test('clear removes all handlers', () => {
    const list = new DispatchList<string>();
    const values: string[] = [];
    
    list.add((value) => values.push(value));
    list.add((value) => values.push(value));
    
    list.clear();
    expect(list.isEmpty()).toBe(true);
    
    list.notify('test');
    expect(values).toEqual([]);
  });

  test('once handler removed after first notify', () => {
    const list = new DispatchList<string>();
    const values: string[] = [];
    
    list.add((value) => values.push(value), { once: true });
    
    list.notify('first');
    list.notify('second');
    list.notify('third');
    
    expect(values).toEqual(['first']); // Only called once
  });

  test('handler returning true stops propagation', () => {
    const list = new DispatchList<string>();
    const values: string[] = [];
    
    list.add((value) => {
      values.push('first');
      return true; // Stop propagation
    });
    list.add((value) => values.push('second'));
    
    const stopped = list.notify('test');
    
    expect(stopped).toBe(true);
    expect(values).toEqual(['first']); // Second handler not called
  });

  test('handler returning false continues propagation', () => {
    const list = new DispatchList<string>();
    const values: string[] = [];
    
    list.add((value) => {
      values.push('first');
      return false; // Continue propagation
    });
    list.add((value) => values.push('second'));
    
    const stopped = list.notify('test');
    
    expect(stopped).toBe(false);
    expect(values).toEqual(['first', 'second']);
  });

  test('handler returning void continues propagation', () => {
    const list = new DispatchList<string>();
    const values: string[] = [];
    
    list.add((value) => {
      values.push('first');
      // Returns undefined (void)
    });
    list.add((value) => values.push('second'));
    
    const stopped = list.notify('test');
    
    expect(stopped).toBe(false);
    expect(values).toEqual(['first', 'second']);
  });

  test('once handler returning true is removed and stops propagation', () => {
    const list = new DispatchList<string>();
    const values: string[] = [];
    
    list.add((value) => {
      values.push('first');
      return true;
    }, { once: true });
    list.add((value) => values.push('second'));
    
    list.notify('test');
    expect(values).toEqual(['first']);
    expect(list.isEmpty()).toBe(false); // Second handler still there
    
    // Call again - second handler should fire
    list.notify('test');
    expect(values).toEqual(['first', 'second']);
  });

  test('handles multiple types', () => {
    interface MyEvent {
      type: string;
      data: number;
    }
    
    const list = new DispatchList<MyEvent>();
    const events: MyEvent[] = [];
    
    list.add((event) => events.push(event));
    
    list.notify({ type: 'click', data: 42 });
    
    expect(events).toEqual([{ type: 'click', data: 42 }]);
  });

  test('handles errors in handlers gracefully', () => {
    const list = new DispatchList<string>();
    const values: string[] = [];
    
    list.add((value) => {
      throw new Error('handler error');
    });
    list.add((value) => values.push(value));
    
    // First handler throws, should stop there
    expect(() => list.notify('test')).toThrow('handler error');
  });

  test('each list has independent handlers', () => {
    const list1 = new DispatchList<string>();
    const list2 = new DispatchList<string>();
    const values1: string[] = [];
    const values2: string[] = [];
    
    list1.add((v) => values1.push(v));
    list2.add((v) => values2.push(v));
    
    list1.notify('hello');
    
    expect(values1).toEqual(['hello']);
    expect(values2).toEqual([]);
  });

  test('ids are unique', () => {
    const list = new DispatchList<string>();
    const ids: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      ids.push(list.add(() => {}));
    }
    
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });

  test('works with complex data structures', () => {
    const list = new DispatchList<{ items: number[]; total: number }>();
    const results: number[] = [];
    
    list.add((data) => {
      results.push(data.total);
    });
    
    list.notify({ items: [1, 2, 3], total: 6 });
    
    expect(results).toEqual([6]);
  });

  test('notify returns false when no handlers', () => {
    const list = new DispatchList<string>();
    const stopped = list.notify('test');
    expect(stopped).toBe(false);
  });

  test('notify returns false when all handlers return void/false', () => {
    const list = new DispatchList<string>();
    
    list.add(() => {});
    list.add(() => false);
    list.add(() => undefined);
    
    const stopped = list.notify('test');
    expect(stopped).toBe(false);
  });
});