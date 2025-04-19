import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    bundle: `./packages/ixfx/src/index.ts`,
  },
  dts: true,
  outDir: `./bundle-tsup/`,
  experimentalDts: false,
  sourcemap: true,
  noExternal: [ `bezier-js`, `colorjs.io`, `json5`, `lit-html` ],
  platform: `browser`,
  target: `es2022`,
  format: [
    `esm`
  ]
});