import { isPlainObjectOrPrimitive } from "@ixfxfun/guards";

export const cloneFromFields = <T extends object>(source: T) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries: [ key: string, value: any ][] = [];
  for (const field in source) {
    const value = (source)[ field ];
    if (isPlainObjectOrPrimitive(value as unknown)) {
      entries.push([ field, value ]);
    }
  }
  return Object.fromEntries(entries) as T;
}