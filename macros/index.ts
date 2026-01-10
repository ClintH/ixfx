import path from 'node:path'

import { defineMacro } from 'unplugin-macros/api'

export * from './repo'

const root = path.resolve(__dirname, '..')

function getPackageName(filePath: string) {
  const relative = path.relative(root, filePath)
  const [ , packageName ] = relative.split(path.sep)
  return packageName
}

export const generatePluginName: () => string = defineMacro(function () {
  const packageName = getPackageName(this.id)
  return `unplugin-vue-${ packageName }`
})
