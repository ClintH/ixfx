import { isPlainObjectOrPrimitive } from "../util/GuardObject.js";

export const cloneFromFields = <T extends object>(source: T) => {
  const entries: Array<[ key: string, value: any ]> = [];
  for (const field in source) {
    const value = (source)[ field ];
    if (isPlainObjectOrPrimitive(value as unknown)) {
      entries.push([ field, value ]);
    }
  }
  return Object.fromEntries(entries) as T;
}