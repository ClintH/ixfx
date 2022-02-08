import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    bundle: `./src/index.ts`,
    arrays: `./src/collections/Arrays.ts`,
    components: `./src/components/index.ts`,
    collections: `./src/collections/index.ts`,
    forms: `./src/dom/Forms.ts`,
    dom: `./src/dom/index.ts`,
    drawing: `./src/visual/Drawing.ts`,
    geometry: `./src/geometry/index.ts`,
    generators: `./src/Generators.ts`,
    keyValues: `./src/KeyValue.ts`,
    modulation: `./src/modulation/index.ts`,
    maps: `./src/collections/Map.ts`,
    random: `./src/Random.ts`,
    sets: `./src/collections/Set.ts`,
    stateMachine: `./src/StateMachine.ts`,
    timers: `./src/Timer.ts`,
    util: `./src/Util.ts`,
    visual: `./src/visual/index.ts`,
  },
  dts: true,
  noExternal: [`bezier-js`, `color2k`,  `rxjs`],
  platform: `browser`,
  target: `es2020`,
  format: [
    `esm`
  ]
});