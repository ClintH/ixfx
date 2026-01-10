import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: [
    './src/index.ts', './src/midi/index.ts', './src/audio/index.ts'
  ]
})
