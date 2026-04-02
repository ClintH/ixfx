import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: [`./src/index.ts`, `./src/state-machine.ts`],
  deps: {
    neverBundle: [`node:module`],
  },
});
