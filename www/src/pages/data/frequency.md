---
title: Frequency
setup: |
  import { Markdown } from 'astro/components';
  import Layout from '../../layouts/MainLayout.astro';
  import FreqLetters from './FreqLetters.ts';
  import FreqWeighted from './FreqWeighted.astro';
---

The `Frequency` class keeps track of the number of times a certain value is 'seen'.

## Why?

In some scenarios it can be useful to aggregate data over time, rather than looking at a single event or snapshot-in-time. It allows you to do some fuzzy logic, for example using the value that _mostly_ occurs.

## Demo

In the demo below, a weighted distribution of random numbers is produced. In this case, lower numbers will occur more often than higher numbers. The `Frequency` is used to count how many times each number appears, and for visualisation purposes shown as a histogram.

<FreqWeighted />

## Usage

The provided frequency histogram is _mutable_, meaning that the object reference stays the same while the data inside is permitted to change.

```js
// Create an instance
const freq = mutableFrequency();

// Add string or numeric data...
freq.add(`apples`);
freq.add(`oranges`);
freq.add(`apples`);
freq.add(`pears`);
freq.add(`pears`);
```

Clear all data
```js
freq.clear();
```

Get the count of a specific group. Returns `undefined` if group is not found.

```js
const apples = freq.frequencyOf(`apples`); // 2
```

Get the groups and counts of each:

```js
const data = freq.toArray();
for ([group, count] of data) {
  console.log(`${group} has a count of ${count}`); // apples has a count of 2 (...)
}
```

### Custom objects

To keep track of objects, provide a function that creates a string for the items you're adding. This allows you to group by different fields, or some combination of fields.

In the below example, cars are grouped by their make:

```js
// Two cars
const cars = [
  {
    make: `Toyota`,
    model: `Corolla`,
    year: 1980
  },
  {
    make: `Honda`,
    model: `Civic`,
    year: 1985
  }
]

// Count cars by make
const freq = mutableFrequency(car => car.make);

// Add array of cars
freq.add(...cars);

// Count a group
freq.frequencyOf(`Toyota`); // 1

// Or by object, which uses the same stringify function
freq.frequencyOf(cars[1]); // 1
```

## Examples

Count occurrence of letters in a string

```js
const msg = `Hello there! - Obiwan Kenobi`;
const freq = mutableFreq();
for (let i=0; i<msg.length; i++) {
  freq.add(msg[i]);
}
```

<freq-letters client:visible />