export const isFunction = (object: unknown): object is (...args: Array<any>) => any => object instanceof Function;
