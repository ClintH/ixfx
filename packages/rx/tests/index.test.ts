import { describe, test, expect } from 'vitest';
import { 
  run, 
  writable, 
  manual, 
  takeNextValue,
  to,
  Ops 
} from '../src/index.js';

describe('rx/index', () => {
  describe('run', () => {
    test('pipes source through operators', () => {
      const values: number[] = [];
      const result = run<number, number>(
        [1, 2, 3],
        Ops.transform((v: number) => v * 2)
      );

      result.onValue(v => values.push(v as number));
      
      // Allow async processing
      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(values).toEqual([2, 4, 6]);
          resolve();
        }, 50);
      });
    });

    test('chains multiple operators', () => {
      const values: number[] = [];
      const result = run(
        [1, 2, 3, 4, 5],
        Ops.filter((v: number) => v > 2),
        Ops.transform((v: number) => v * 10)
      );

      result.onValue(v => values.push(v));
      
      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(values).toEqual([30, 40, 50]);
          resolve();
        }, 50);
      });
    });

    test('handles manual sources', () => {
      const source = manual<number>();
      const values: number[] = [];

      const result = run(
        source,
        Ops.transform((v: number) => v * 2)
      );

      result.onValue(v => values.push(v));
      
      source.set(1);
      source.set(2);
      source.set(3);

      expect(values).toEqual([2, 4, 6]);
    });
  });

  describe('writable', () => {
    test('allows setting values on writable source', () => {
      const source = manual<number>();
      const values: number[] = [];

      const writableStream = writable<number, number>(source);
      writableStream.onValue(v => values.push(v as number));

      writableStream.set(10);
      writableStream.set(20);

      expect(values).toEqual([10, 20]);
    });

    test('array sources are writable through resolved stream', () => {
      // Arrays resolved through iterator create a stream that supports set
      const source = [1, 2, 3];
      const writableStream = writable(source);
      
      // The resolved source is actually writable (it has a set method)
      // This test verifies the behavior rather than testing an error
      expect(() => writableStream.set(10)).not.toThrow();
    });

    test('pipes through operators while maintaining writability', () => {
      const source = manual<number>();
      const values: number[] = [];

      const writableStream = writable<number, number>(
        source,
        Ops.transform((v: number) => v * 2)
      );

      writableStream.onValue(v => values.push(v as number));
      writableStream.set(5);
      
      expect(values).toEqual([10]);
    });
  });

  describe('manual', () => {
    test('creates writable reactive', () => {
      const stream = manual<string>();
      const values: string[] = [];

      stream.onValue(v => values.push(v));
      stream.set('hello');
      stream.set('world');

      expect(values).toEqual(['hello', 'world']);
    });

    test('can be disposed', () => {
      const stream = manual<number>();
      
      expect(stream.isDisposed()).toBe(false);
      stream.dispose('test');
      expect(stream.isDisposed()).toBe(true);
    });

    test('throws after disposal', () => {
      const stream = manual<number>();
      stream.dispose('test');
      
      expect(() => stream.set(1)).toThrow();
    });

    test('supports on callback with full messages', () => {
      const stream = manual<string>();
      const messages: any[] = [];

      stream.on(msg => {
        messages.push(msg);
      });

      stream.set('test');

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty('value', 'test');
    });
  });

  describe('takeNextValue', () => {
    test('resolves with next value', async () => {
      const source = manual<string>();
      
      const promise = takeNextValue(source);
      source.set('expected value');
      
      const result = await promise;
      expect(result).toBe('expected value');
    });

    test('rejects on timeout', async () => {
      const source = manual<string>();
      
      await expect(
        takeNextValue(source, 10) // 10ms timeout
      ).rejects.toThrow('Timeout');
    });

    test('rejects when source closes without value', async () => {
      const source = manual<string>();
      
      const promise = takeNextValue(source, 100);
      source.dispose('closed');
      
      await expect(promise).rejects.toThrow('closed');
    });

    test('works with arrays', async () => {
      const result = await takeNextValue([1, 2, 3], 100);
      expect(result).toBe(1);
    });
  });

  describe('to', () => {
    test('connects reactive A to B', () => {
      const source = manual<number>();
      const target = manual<number>();
      const values: number[] = [];

      target.onValue(v => values.push(v));
      const unsub = to(source, target);

      source.set(1);
      source.set(2);

      expect(values).toEqual([1, 2]);

      unsub();
      source.set(3);
      expect(values).toEqual([1, 2]);
    });

    test('applies transform function', () => {
      const source = manual<number>();
      const target = manual<string>();
      const values: string[] = [];

      target.onValue(v => values.push(v));
      to(source, target, (n) => `value: ${n}`);

      source.set(42);

      expect(values).toEqual(['value: 42']);
    });

    test('closes target when source closes if closeBonA is true', () => {
      const source = manual<number>();
      const target = manual<number>();

      to(source, target, undefined, true);
      
      expect(target.isDisposed()).toBe(false);
      source.dispose('done');
      expect(target.isDisposed()).toBe(true);
    });

    test('does not close target when source closes by default', () => {
      const source = manual<number>();
      const target = manual<number>();

      to(source, target);
      
      source.dispose('done');
      expect(target.isDisposed()).toBe(false);
    });
  });
});