---
title: Circle
setup: |
  import {Markdown} from 'astro/components';
  import Layout from '../../layouts/MainLayout.astro';
  import ArcEditor from '../../components/ArcEditor';
---

A circle...

## Type

```typescript
export type Circle = {
  readonly radius: number
}

export type CirclePositioned = Points.Point & Circle;
export type CircularPath = Circle & Path & {
  kind: `circular`
};
```


Editor end.

## Functions

## Helper functions
