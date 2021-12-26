import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    bundle: "src/index.ts"
  },
  sourcemap: true,
  dts: true,
  noExternal: ["bezier-js"],
  platform: "browser",
  target: "es2020",
  format: [
    "esm"
  ]
});