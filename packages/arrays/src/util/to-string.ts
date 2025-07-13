/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */
export const toStringDefault = <V>(itemToMakeStringFor: V): string =>
  typeof itemToMakeStringFor === `string`
    ? itemToMakeStringFor
    : JSON.stringify(itemToMakeStringFor);