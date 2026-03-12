import type { LabelledSingleValue, LabelledValue, LabelledValues } from "./types.js";

export function isSingleValue<T>(v: LabelledValue<T>): v is LabelledSingleValue<T> {
  if (`value` in v)
    return true;
  return false;
}

export function isMultiValue<T>(v: LabelledValue<T>): v is LabelledValues<T> {
  if (`values` in v) {
    return Array.isArray(v.values);
  }
  return false;
}