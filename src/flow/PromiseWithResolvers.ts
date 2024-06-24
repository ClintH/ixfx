export function promiseWithResolvers<T>() {
  let resolve: undefined | ((value: T) => void);
  let reject: undefined | ((reason: any) => void);
  const promise = new Promise<T>(
    (_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { promise, resolve: resolve!, reject: reject! };
}