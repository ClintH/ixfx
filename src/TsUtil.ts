/**
 * Remaps `TShape` so each field has type `TFieldValue`.
 * Recursive.
 */
export type RecursiveReplace<TShape, TFieldValue> = {
  [ P in keyof TShape ]: TShape[ P ] extends (infer U)[]
  ? RecursiveReplace<U, TFieldValue>[]
  : TShape[ P ] extends number | string | symbol | undefined
  ? TFieldValue
  : RecursiveReplace<TShape[ P ], TFieldValue>;
};

export type RecursivePartial<T> = {
  [ P in keyof T ]?:
  T[ P ] extends (infer U)[] ? RecursivePartial<U>[] :
  T[ P ] extends object | undefined ? RecursivePartial<T[ P ]> :
  T[ P ];
};

export type ReadonlyRemapObjectPropertyType<OriginalType, PropertyType> = {
  readonly [ Property in keyof OriginalType ]: PropertyType;
};
export type RemapObjectPropertyType<OriginalType, PropertyType> = {
  [ Property in keyof OriginalType ]: PropertyType;
};
