import type { StackOpts } from './types.js';

export function trimStack<V>(opts: StackOpts, stack: readonly V[], toAdd: readonly V[]): readonly V[] {
  const potentialLength = stack.length + toAdd.length;
  const policy = opts.discardPolicy ?? `additions`;
  const capacity = opts.capacity ?? potentialLength;
  const toRemove = potentialLength - capacity;
  if (opts.debug) {
    console.log(
      `Stack.push: stackLen: ${stack.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${policy}`,
    );
  }
  switch (policy) {
    case `additions`: {
      if (opts.debug) {
        console.log(
          `Stack.push:DiscardAdditions: stackLen: ${stack.length} slice: ${potentialLength - capacity
          } toAddLen: ${toAdd.length}`,
        );
      }

      if (stack.length === opts.capacity) {
        return stack; // Completely full
      } else {
        // Only add some from the new array
        return [...stack, ...toAdd.slice(0, toAdd.length - toRemove)];
      }
    }
    case `newer`: {
      if (toAdd.length >= capacity) {
        return toAdd.slice(toAdd.length - capacity);
      }
      const keepFromOld = capacity - toAdd.length;
      return [
        ...stack.slice(0, keepFromOld),
        ...toAdd,
      ];
    }
    case `older`: {
      // Oldest item in stack is position 0
      if (toRemove >= stack.length)
        return toAdd.slice(toRemove - stack.length);
      return [...stack.slice(toRemove), ...toAdd];
    }
    default: {
      throw new Error(`Unknown discard policy ${policy}`);
    }
  }
}

// Add to top (last index)
export function push<V>(opts: StackOpts, stack: readonly V[], ...toAdd: readonly V[]): readonly V[] {
  // If stack is A, B and toAdd is C, D this yields A, B, C, D
  if (toAdd.length === 0)
    return stack;
  const potentialLength = stack.length + toAdd.length;

  const overSize = opts.capacity && potentialLength > opts.capacity;
  const toReturn = overSize
    ? trimStack(opts, stack, toAdd)
    : [...stack, ...toAdd];
  return toReturn;
}

// Remove from top (last index)
export function pop<V>(opts: StackOpts, stack: readonly V[]): readonly V[] {
  if (stack.length === 0)
    throw new Error(`Stack is empty`);
  return stack.slice(0, -1);
}

/**
 * Peek at the top of the stack (end of array)
 *
 * @typeParam V - Type of stored items
 * @param {StackOpts} opts
 * @param {V[]} stack
 * @returns {(V | undefined)}
 */
export function peek<V>(opts: StackOpts, stack: readonly V[]): V | undefined {
  return stack.at(-1);
}

export function isEmpty<V>(opts: StackOpts, stack: readonly V[]): boolean {
  return stack.length === 0;
}

export function isFull<V>(opts: StackOpts, stack: readonly V[]): boolean {
  if (opts.capacity) {
    return stack.length >= opts.capacity;
  }
  return false;
}
