// rolldown.config.js
import { dts } from 'rolldown-plugin-dts'

export default {
  input: './src/index.ts',
  plugins: [dts()],
  platform: `browser`,
  output: [{
    dir: 'rolldown',
    format: 'es'
  }],
}