import { processChain, type Processors } from "../../data/Process.js";
import { resolveSource } from "../ResolveSource.js";
import type { ReactiveOrSource, Reactive, ReactiveWritable, ReactiveOp } from "../Types.js";

/**
 * 'Taps' the values from 'input', passing them to the 'process' function.
 * Return stream is the input stream, unaffected by what 'process' does.
 * @param input 
 * @param process 
 * @returns 
 */
export function tapProcess<In, T2, T3, T4, T5, T6>(input: ReactiveOrSource<In>, ...processors: Processors<In, T2, T3, T4, T5, T6>): Reactive<In> {
  const inputStream = resolveSource(input);

  // @ts-expect-error
  const chain = processChain(...processors);
  inputStream.onValue(value => {
    chain(value);
  });
  return inputStream;
}

/**
 * 'Taps' the values from 'input', passing them to 'diverged'
 * Returns the original input stream, unaffected by what 'diverged' does.
 * @param input 
 * @param stream 
 * @returns 
 */
export function tapStream<In>(input: ReactiveOrSource<In>, diverged: ReactiveWritable<In>): Reactive<In> {
  const inputStream = resolveSource(input);
  inputStream.onValue(value => {
    diverged.set(value);
  });
  return inputStream;
}


export const tapOps = <TIn, TOut>(source: ReactiveOrSource<TIn>, ...ops: Array<ReactiveOp<TIn, TOut>>): Reactive<TOut> => {
  for (const op of ops) {
    // @ts-expect-error
    source = op(source);
  }
  return source as any as Reactive<TOut>;
}