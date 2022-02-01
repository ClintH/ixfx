import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    ixfx: `./src/index.ts`
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