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


// eg RequireOnlyOne<someType, 'prop1'|'prop2'>
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
    [ K in Keys ]-?:
    Required<Pick<T, K>>
    & Partial<Record<Exclude<Keys, K>, undefined>>
  }[ Keys ]


// Everything but first, eg Rest<Parameters<sometype>>
//export type Rest<T extends any[]> = ((...p: T) => void) extends ((p1: infer P1, ...rest: infer R) => void) ? R : never;
export type Rest<T extends any[]> = T extends [ infer A, ...infer R ] ? R : never;