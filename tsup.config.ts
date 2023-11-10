import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    arrays: `./src/collections/arrays/index.ts`,
    bundle: `./src/index.ts`,
    collections: `./src/collections/index.ts`,
    components: `./src/components/index.ts`,
    webcomponents: `./src/web-components/index.ts`,
    data: `./src/data/index.ts`,
    dom: `./src/dom/index.ts`,
    debug: `./src/debug/index.ts`,
    events: `./src/Events.ts`,
    flow: './src/flow/index.ts',
    forms: `./src/dom/Forms.ts`,
    global: `./src/MakeGlobal.ts`,
    generators: `./src/Generators.ts`,
    geometry: `./src/geometry/index.ts`,
    io: './src/io/index.ts',
    keyValues: `./src/KeyValue.ts`,
    maps: `./src/collections/Map/index.ts`,
    modulation: `./src/modulation/index.ts`,
    numbers: `./src/Numbers.ts`,
    queues: `./src/collections/queue/index.ts`,
    random: `./src/random/index.ts`,
    sets: `./src/collections/set/index.ts`,
    stateMachine: `./src/flow/StateMachine.ts`,
    svg: `./src/visual/Svg.ts`,
    text: `./src/Text.ts`,
    util: `./src/Util.ts`,
    visual: `./src/visual/index.ts`,
  },
  dts: true,
  noExternal: [ `bezier-js`, `d3-color`, `d3-interpolate`, `rxjs`, `json5` ],
  platform: `browser`,
  target: `es2022`,
  format: [
    `esm`
  ]
});