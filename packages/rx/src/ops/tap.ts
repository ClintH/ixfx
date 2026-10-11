import type { Processors } from "@ixfx/process";
import type { Reactive, ReactiveOp, ReactiveOrSource, ReactiveWritable } from "../types.js";
import { flow as processFlow } from "@ixfx/process";
import { resolveSource } from "../resolve-source.js";

/**
 * 'Taps' the values from 'input', passing them to the 'process' function.
 * Return stream is the input stream, unaffected by what 'process' does.
 * @param input Input stream
 * @param processors List of processors
 * @returns
 */
export function tapProcess<In, T2, T3, T4, T5, T6>(input: ReactiveOrSource<In>, ...processors: Processors<In, T2, T3, T4, T5, T6>): Reactive<In> {
  const inputStream = resolveSource(input);
  // NB: 'Process' was previously referenced here without being imported
  // @ts-expect-error Processors union is not spreadable against flow's overloads
  const chain = processFlow(...processors);
  inputStream.onValue((value) => {
    chain(value);
  });
  return inputStream;
}

/**
 * 'Taps' the values from 'input', passing them to 'diverged'
 * Returns the original input stream, unaffected by what 'diverged' does.
 * @param input Input stream
 * @param diverged Stream to write to
 * @returns
 */
export function tapStream<In>(input: ReactiveOrSource<In>, diverged: ReactiveWritable<In>): Reactive<In> {
  const inputStream = resolveSource(input);
  inputStream.onValue((value) => {
    diverged.set(value);
  });
  return inputStream;
}

/**
 * Create a parallel 'tap' of processing
 * @param input Input stream
 * @param ops Series of ops to process data
 * @returns
 */
export function tapOps<TIn, TOut>(input: ReactiveOrSource<TIn>, ...ops: Array<ReactiveOp<TIn, TOut>>): Reactive<TOut> {
  for (const op of ops) {
    // @ts-expect-error ops of mixed input/output types chain loosely
    input = op(input);
  }
  return input as any as Reactive<TOut>;
}