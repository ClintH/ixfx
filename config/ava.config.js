export default {
	require: ['./src/test/util.ts'],
  files: [
    './src/test/**/*.ts',
    '!./src/test/util.ts'
  ],
  // extensions: {
  //   ts: 'module'
  // },
  // nodeArguments: [
  //   '--loader=tsx'
  // ],
  typescript: {
    rewritePaths: {
      "src/": "etc/build/"
    },
    compile: false
  }
}; 