export default {
	require: ['./src/test/util.ts'],
  verbose: false,
  files: [
    './src/test/**/*.ts',
    '!./src/test/util.ts'
  ],
  failFast: true,
  typescript: {
    rewritePaths: {
      "src/": "etc/build/"
    },
    compile: false
  }
}; 