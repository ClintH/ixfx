import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    bundle: `./src/index.ts`,
    geometry: `./src/geometry/index.ts`,
    visual: `./src/visual/index.ts`,
    dom: `./src/dom/index.ts`,
    forms: `./src/dom/Forms.ts`,
    modulation: `./src/modulation/index.ts`,
    collections: `./src/collections/index.ts`,
    maps: `./src/collections/Map.ts`,
    sets: `./src/collection/Set.ts`,
    arrays: `./src/collection/Arrays.ts`,
    generators: `./src/Generators.ts`,
    components: `./src/components/index.ts`,
    random: `./src/Random.ts`,
    stateMachine: `./src/StateMachine.ts`,
    keyValues: `./src/KeyValue.ts`
  },
  sourcemap: true,
  dts: true,
  noExternal: [`bezier-js`, `color2k`,  `rxjs`],
  platform: `browser`,
  target: `es2020`,
  format: [
    `esm`
  ]
});