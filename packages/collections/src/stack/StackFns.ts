import type { StackOpts } from './types.js';

export const trimStack = <V>(
  opts: StackOpts,
  stack: ReadonlyArray<V>,
  toAdd: ReadonlyArray<V>
): ReadonlyArray<V> => {
  const potentialLength = stack.length + toAdd.length;
  const policy = opts.discardPolicy ?? `additions`;
  const capacity = opts.capacity ?? potentialLength;
  const toRemove = potentialLength - capacity;
  if (opts.debug) {
    console.log(
      `Stack.push: stackLen: ${ stack.length } potentialLen: ${ potentialLength } toRemove: ${ toRemove } policy: ${ policy }`
    );
  }
  switch (policy) {
    case `additions`: {
      if (opts.debug) {
        console.log(
          `Stack.push:DiscardAdditions: stackLen: ${ stack.length } slice: ${ potentialLength - capacity
          } toAddLen: ${ toAdd.length }`
        );
      }

      // eslint-disable-next-line unicorn/prefer-ternary
      if (stack.length === opts.capacity) {
        return stack; // Completely full
      } else {
        // Only add some from the new array
        return [ ...stack, ...toAdd.slice(0, toAdd.length - toRemove) ];
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
      return [ ...stack, ...toAdd ].slice(toRemove);
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown discard policy ${ policy }`);
    }
  }
};

// Add to top (last index)
export const push = <V>(
  opts: StackOpts,
  stack: ReadonlyArray<V>,
  ...toAdd: ReadonlyArray<V>
): ReadonlyArray<V> => {
  // If stack is A, B and toAdd is C, D this yields A, B, C, D
  //const mutated = [...stack, ...toAdd];
  const potentialLength = stack.length + toAdd.length;

  const overSize = opts.capacity && potentialLength > opts.capacity;
  const toReturn = overSize
    ? trimStack(opts, stack, toAdd)
    : [ ...stack, ...toAdd ];
  return toReturn;
};

// Remove from top (last index)
export const pop = <V>(
  opts: StackOpts,
  stack: ReadonlyArray<V>
): ReadonlyArray<V> => {
  if (stack.length === 0) throw new Error(`Stack is empty`);
  return stack.slice(0, - 1);
};

/**
 * Peek at the top of the stack (end of array)
 *
 * @typeParam V - Type of stored items
 * @param {StackOpts} opts
 * @param {V[]} stack
 * @returns {(V | undefined)}
 */
export const peek = <V>(
  opts: StackOpts,
  stack: ReadonlyArray<V>
): V | undefined => stack.at(-1);

export const isEmpty = <V>(opts: StackOpts, stack: ReadonlyArray<V>): boolean =>
  stack.length === 0;

export const isFull = <V>(
  opts: StackOpts,
  stack: ReadonlyArray<V>
): boolean => {
  if (opts.capacity) {
    return stack.length >= opts.capacity;
  }
  return false;
};
