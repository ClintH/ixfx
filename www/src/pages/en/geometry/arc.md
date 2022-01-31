---
title: Arc
setup: |
  import {Markdown} from 'astro/components';
  import Layout from '../../../layouts/MainLayout.astro';
  import ArcEditor from '../../../components/ArcEditor';
  import RadiansEditor from '../../../components/RadiansEditor';

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

Try editing this example:

<input style="width: 40em" class="code arc" type="text" id="arc1Txt" value="{ radius: 10, startRadian: 0, endRadian: Math.PI }">
<arc-editor id="arc1" client:visible radius="10" startRadian="0" endRadian="{Math.PI}" />

## Radians

Radians define the start and end of the arc, rather than the more familiar degrees.

<radians-editor width="500" height="300" client:visible />

## Functions

## Helper functions
