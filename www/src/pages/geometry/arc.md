---
title: Arc
setup: |
  import {Markdown} from 'astro/components';
  import Layout from '../../layouts/MainLayout.astro';
  import ArcEditor from '../../components/ArcEditor';
  import RadiansEditor from '../../components/RadiansEditor';

---
<script type="module" src={Astro.resolve('./arc.ts')}></script>
<style>
input.code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  border-radius: 8px;
  background-color: var(--theme-code-bg);
  color: var(--theme-code-text);
  padding: 1em;
}

radians-editor {
  --label-color: var(--theme-text-light);
  --axis-color: var(--theme-bg-hover);
  --ray-color: var(--theme-hit-color);
}

</style>

An arc describes a segment of a circle. It is defined by its radius as well as the start and end radian.

[API docs](/ixfx/api/modules/Geometry.Arcs.html)

## Type

The expected type of arcs in ixfx is:

```typescript
type Arc = {
  radius:number
  startRadian:number
  endRadian:number
  counterClockwise?:boolean
}>
```

`ArcPositioned` also includes `x` and `y` fields.


Try editing this example:

<input style="width: 40em" class="code arc" type="text" id="arc1Txt" value="{ radius: 10, startRadian: 0, endRadian: Math.PI }">
<arc-editor id="arc1" client:visible radius="10" startRadian="0" endRadian="{Math.PI}" />

Angles are set with _radians_, not the more familiar _degrees_. See [Units](units) for more info

<radians-editor width="500" height="300" client:visible />

## Conversions

Create an arc from degrees:

```js
// fromDegrees(radius, startDegrees, endDegrees, origin?)
const a = Arcs.fromDegrees(10, 0, 90);
const b = Arcs.fromDegrees(10, 0, 90, {x: 100, y: 100});
```

Return a [Path](path) instance, which wraps up some functions together with the arc:

```js
const p = Arcs.toPath(arc);
p.length();
p.bbox();
p.compute(0.5);
p.toString();
```

Get a [Line](line) connecting the start and end point of the arc:

```js
const line = Arcs.toLine(arc);
```

## Other functions

Get the x,y coordinate of a point at specified angle
```js
// Arcs.point(arc, angleRadian, origin?);
const p = Arcs.point(arc, Math.PI);
```

Equality

```js
// Returns true if `a` and `b` arcs have the same value
Arcs.isEqual(a, b);
```

Dimensions/distances

```js
Arcs.bbox(arc);   // Get a rectangle that encompasses arc
Arcs.length(arc); // Get the length of arc
Arcs.distanceCenter(a, b); // Distance between the centers of two arcs 
```