import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/arrays.ts',
    './src/core.ts',
    './src/collections.ts',
    './src/debug.ts',
    './src/dom.ts',
    './src/events.ts',
    './src/flow.ts',
    './src/geometry.ts',
    './src/guards.ts',
    './src/io.ts',
    './src/iterables.ts',
    './src/modulation.ts',
    './src/numbers.ts',
    './src/process.ts',
    './src/random.ts',
    './src/rx.ts',
    './src/trackers.ts',
    './src/ui.ts',
    './src/visual.ts',


  ],
  target: "es2024",
  clean: true,
  platform: 'browser',
  deps: {
    onlyAllowBundle:[
    /^@ixfx\/.*/,
    "colorizr",
    "bezier-js",
    "json5"
  ]
  }
  //external: [ 'node:module'  ],
})
