// DEMOS
// https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mode: "development",
  mount: {
    public: {url: '/'},
    src: {url: '/src'}
  },
  plugins: [
    /* ... */
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    out: "build-demos"
  },
};
