export default {
  files: [
    './src/__test/**/*.Test.ts',
  ],
  failFast: false,
  // typescript: {
  //   rewritePaths: {
  //     "src/": "etc/build/"
  //   },
  //   compile: false
  // },
  extensions: {
    ts: "module",
    js: true
  },
  nodeArguments: [
    "--import=tsimp",
    //"--trace-warnings"
  ]
}; 