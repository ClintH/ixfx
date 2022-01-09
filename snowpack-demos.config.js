// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mode: `development`,
  mount: {
    demos: {url: `/`},
    src: {url: `/src`}
  },
  plugins: [
    /* ... */
  ],
  packageOptions: {
    knownEntrypoints: [
      `@lit/reactive-element/decorators/query-assigned-nodes.js`,
      `@lit/reactive-element/decorators/custom-element.js`,
      `@lit/reactive-element/decorators/state.js`,
      `@lit/reactive-element/decorators/event-options.js`,
      `@lit/reactive-element/decorators/query-assigned-elements.js`
    ]
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
