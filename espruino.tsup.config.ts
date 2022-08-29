import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    scale: `./src/data/Scale.ts`,
  },
  dts: true,
  noExternal: [`bezier-js`, `d3-color`, `d3-interpolate`, `rxjs`, `json5`],
  platform:'node',
  target: `es5`,
  sourcemap: false,
  minify: false,
  legacyOutput: true,
  outDir: `espruino`,
  format: [
    `cjs`
  ]
});