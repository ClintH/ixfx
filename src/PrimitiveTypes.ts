export type StringOrNumber = string | number | bigint;
export type Primitive = string | number | bigint | boolean;
export type PrimitiveOrObject = Primitive | object;

export type BasicType = StringOrNumber | object;
export type KeyValue = readonly [ key: string, value: StringOrNumber ];