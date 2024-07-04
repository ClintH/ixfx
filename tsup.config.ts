import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    arrays: `./src/data/arrays/index.ts`,
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
    geometry: `./src/geometry/index.ts`,
    guards: `./src/util/guards.ts`,
    iterables: './src/iterables/index.ts',
    io: './src/io/index.ts',
    keyValues: `./src/KeyValue.ts`,
    maps: `./src/collections/Map/index.ts`,
    modulation: `./src/modulation/index.ts`,
    numbers: `./src/numbers/index.ts`,
    queues: `./src/collections/queue/index.ts`,
    random: `./src/random/index.ts`,
    rx: `./src/rx/index.ts`,
    sets: `./src/collections/set/index.ts`,
    stateMachine: `./src/flow/StateMachine.ts`,
    svg: `./src/visual/Svg.ts`,
    text: `./src/Text.ts`,
    trees: './src/collections/tree/index.ts',
    util: `./src/util/index.ts`,
    visual: `./src/visual/index.ts`,
  },
  dts: true,
  experimentalDts: false,
  noExternal: [ `bezier-js`, `colorjs.io`, `json5`, `lit-html` ],
  platform: `browser`,
  target: `es2022`,
  format: [
    `esm`
  ]
});