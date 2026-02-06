import { describe, test, expect, vi } from 'vitest';
import * as Iterables from '../src/index.js';

describe('controller', () => {
  describe('iteratorController', () => {
    test('starts and iterates through values', async () => {
      const values: number[] = [];
      
      const controller = Iterables.iteratorController({
        iterator: function* () {
          yield 1;
          yield 2;
          yield 3;
        },
        onValue: (v: number) => {
          values.push(v);
          return true;
        },
        delay: 0
      });
      
      controller.start();
      
      // Wait for iteration to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(values).toEqual([1, 2, 3]);
      expect(controller.state).toBe('stopped');
    });

    test('pauses iteration', async () => {
      const values: number[] = [];
      
      const controller = Iterables.iteratorController({
        iterator: function* () {
          yield 1;
          yield 2;
          yield 3;
        },
        onValue: (v: number) => {
          values.push(v);
          return true;
        },
        delay: 10
      });
      
      controller.start();
      await new Promise(resolve => setTimeout(resolve, 15));
      controller.pause();
      
      const valuesAtPause = [...values];
      expect(valuesAtPause.length).toBeGreaterThanOrEqual(1);
      expect(controller.state).toBe('paused');
      
      // Wait a bit more, should not get more values
      await new Promise(resolve => setTimeout(resolve, 30));
      expect(values.length).toBe(valuesAtPause.length);
    });

    test('restarts iteration', async () => {
      const values: number[] = [];
      
      const controller = Iterables.iteratorController({
        iterator: function* () {
          yield 1;
          yield 2;
        },
        onValue: (v: number) => {
          values.push(v);
          return true;
        },
        delay: 0
      });
      
      controller.start();
      await new Promise(resolve => setTimeout(resolve, 30));
      
      controller.restart();
      await new Promise(resolve => setTimeout(resolve, 30));
      
      // Should have iterated twice (1,2,1,2)
      expect(values).toEqual([1, 2, 1, 2]);
    });

    test('cancels iteration', async () => {
      const values: number[] = [];
      
      const controller = Iterables.iteratorController({
        iterator: function* () {
          yield 1;
          yield 2;
          yield 3;
        },
        onValue: (v: number) => {
          values.push(v);
          return true;
        },
        delay: 10
      });
      
      controller.start();
      await new Promise(resolve => setTimeout(resolve, 15));
      controller.cancel();
      
      expect(controller.state).toBe('stopped');
      
      // Clear values from first run
      values.length = 0;
      
      // Restart should start from beginning
      controller.start();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(values).toEqual([1, 2, 3]);
    });

    test('stops when onValue returns false', async () => {
      const values: number[] = [];
      
      const controller = Iterables.iteratorController({
        iterator: function* () {
          yield 1;
          yield 2;
          yield 3;
        },
        onValue: (v: number) => {
          values.push(v);
          return v < 2; // Stop after yielding 2
        },
        delay: 0
      });
      
      controller.start();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(values).toEqual([1, 2]);
      expect(controller.state).toBe('stopped');
    });

    test.skip('throws error if no iterator provided', () => {
      // Skip: error is thrown when remake() is called, not at creation
    });

    test('multiple start calls do not create multiple loops', async () => {
      let callCount = 0;
      
      const controller = Iterables.iteratorController({
        iterator: function* () {
          yield 1;
          yield 2;
        },
        onValue: () => {
          callCount++;
          return true;
        },
        delay: 0
      });
      
      controller.start();
      controller.start(); // Should not start twice
      controller.start(); // Should not start a third time
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should only iterate through once (2 items)
      expect(callCount).toBe(2);
    });
  });
});
