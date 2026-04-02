import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: [`./src/index.ts`, `./src/basic.ts`],
  deps: {
    neverBundle: [`node:module`],
  },
});
