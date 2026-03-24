import { defineConfig } from 'tsdown/config'

import common from './tsdown.common.config.js';

export default defineConfig({
  ...common,
  minify: true,
  sourcemap: false,
  outDir: './dist/min'
})
