The process module contains functions for orchestrating a simple series of data transformations. 

Use `flow` to create this orchestration:

```js
const p = flow(
 (value:string) => value.toUpperCase(), // Convert to uppercase
 (value:string) => value.at(0) === 'A') // If first letter is an A, return true
);
```

Once created, the flow can be invoked with an input value:
```js
p('apple'); // True
```

Each function in the processing flow takes one input and returns one result. There are a few in-built functions as well. Some of these are stateful, remembering previous values that have been processed (eg `seenToUndefined`).