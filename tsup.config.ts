import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    arrays: `./src/collections/Arrays.ts`,
    audio: './src/audio/index.ts',
    bundle: `./src/index.ts`,
    collections: `./src/collections/index.ts`,
    components: `./src/components/index.ts`,
    dom: `./src/dom/index.ts`,
    events: `./src/Events.ts`,
    flow: './src/flow/index.ts',
    forms: `./src/dom/Forms.ts`,
    generators: `./src/Generators.ts`,
    geometry: `./src/geometry/index.ts`,
    io: './src/io/index.ts',
    keyValues: `./src/KeyValue.ts`,
    maps: `./src/collections/Map.ts`,
    modulation: `./src/modulation/index.ts`,
    random: `./src/Random.ts`,
    sets: `./src/collections/Set.ts`,
    stateMachine: `./src/flow/StateMachine.ts`,
    svg: `./src/visual/Svg.ts`,
    temporal: `./src/temporal/index.ts`,
    text: `./src/Text.ts`,
    util: `./src/Util.ts`,
    visual: `./src/visual/index.ts`,
  },
  dts: true,
  noExternal: [`bezier-js`, `d3-color`, `d3-interpolate`, `rxjs`],
  platform: `browser`,
  target: `es2020`,
  format: [
    `esm`
  ]
});