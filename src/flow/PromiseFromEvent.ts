export const promiseFromEvent = (target: EventTarget, name: string): Promise<any> => {
  return new Promise(resolve => {
    const handler = (...args: Array<any>) => {
      target.removeEventListener(name, handler);
      if (Array.isArray(args) && args.length === 1) resolve(args[ 0 ]);
      else resolve(args);
    };
    target.addEventListener(name, handler);
  });
};