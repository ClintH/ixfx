import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    bundle: `./src/index.ts`,
  },
  dts: true,
  outDir: `./dist/`,
  sourcemap: true,
  noExternal: [ `bezier-js` ],
  platform: `browser`,
  target: `es2022`,
  format: [
    `esm`
  ]
});