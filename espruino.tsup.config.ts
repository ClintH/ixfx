import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    scale: `./src/data/Scale.ts`,
  },
  dts: true,
  noExternal: [`bezier-js`, `d3-color`, `d3-interpolate`, `rxjs`, `json5`],
  platform: `browser`,
  target: `es5`,
  minify: true,
  legacyOutput: true,
  outDir: `espruino`,
  format: [
    `cjs`
  ]
});