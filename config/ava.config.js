export default {
	require: ['./src/__test/util.ts'],
  verbose: false,
  files: [
    './src/__test/**/*.ts',
    '!./src/__test/util.ts'
  ],
  failFast: true,
  typescript: {
    rewritePaths: {
      "src/": "etc/build/"
    },
    compile: false
  }
}; 