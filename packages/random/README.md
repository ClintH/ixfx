Functions for generating random values.

It has a notion of a 'random source', a function that produces a scalar on 0..1 range. If not specified, `Math.random` is used throughout these functions. But it allows you to slot in a different number generator.

There are narrowed random generators to produce integers, booleans, time values and so on. These will have a '..Source' version, eg `integer` and `integerSource`. The simple version returns the random value directly. This is useful if there's only one place where you're creating the value. However, if you're creating the random value at various places, it might be desired to 'bake in' the parameters. the 'Source' alternate returns a function which is callable to produce a value on demand.

For example:
```js
const v1 = integer({ max: 5,  min: 10 }); // Random integer value

const f = integerSource({ max: 5,  min: 10 }); // Function which produces integer value
const v2 = f(); // Generate the value
```