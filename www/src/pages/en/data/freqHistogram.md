---
title: Frequency Histogram
setup: |
  import { Markdown } from 'astro/components';
  import Layout from '../../../layouts/MainLayout.astro';
  import FreqHistogramPlay from './FreqHistogramPlay.astro';
---

A _frequency histogram_ keeps track of the number of times a certain value is 'seen'.


## Demos

In the demo below, a weighted distribution of random numbers is produced, adding the each number to the histogram. The histogram is visualised using the `Histogram` component.

<FreqHistogramPlay />

For example, perhaps every time the pointer moves, you want to record its rough angular direction: up, down, left or right. If you log this to the FreqHisto, at any point you can find out the most frequently occurring direction, or, say, the proportion of upward moves compared to downward. 

## Why?

## Usage

The provided frequency histogram is _mutable_, meaning that the object reference stays the same while the data inside is permitted to change.

```js
// Create an instance
const freq = mutableFreqHistogram();

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
const freq = mutableFreqHistogram(car => car.make);

// Add array of cars
freq.add(...cars);

// Request count by string key
freq.frequencyOf(`Toyota`); // 1

// Or by object, which uses the same stringify function
freq.frequencyOf(cars[1]); // 1
```

_Todo..._