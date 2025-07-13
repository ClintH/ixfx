export * from './types.js';
export * from './logger.js';
export * from './fps-counter.js';

export const getErrorMessage = (ex: unknown): string => {
  if (typeof ex === `string`) return ex;
  if (ex instanceof Error) {
    return ex.message;
  }
  return ex as string;
};