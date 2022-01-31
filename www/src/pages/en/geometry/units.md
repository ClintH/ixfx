---
title: Units
setup: |
  import {Markdown} from 'astro/components';
  import Layout from '../../../layouts/MainLayout.astro';
  import RadiansEditor from '../../../components/RadiansEditor';

---

<script type="module" src = {Astro.resolve('./arc.ts')} ></script>
<style>
radians-editor {
  --label-color: var(--theme-text-light);
  --axis-color: var(--theme-bg-hover);
  --ray-color: var(--theme-hit-color);
}
</style>

An arc describes a segment of a circle.It is defined by its radius as well as the start and end radian.


## Radians

<radians-editor width="500" height="300" client:visible />
