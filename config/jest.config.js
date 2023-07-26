/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
//import "jest-extended"

export default {
  preset: `ts-jest/presets/default-esm`,
  testEnvironment: `jest-environment-node`,
  setupFilesAfterEnv: [`jest-extended/all`],
  // globals: {
  //   // See reference: https://kulshekhar.github.io/ts-jest/docs/getting-started/options/tsconfig
  //   "ts-jest": {
  //       tsconfig: "config/tsconfig.jest.json"
  //   }
  // },
  extensionsToTreatAsEsm: [`.ts`],
  transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // ts-jest configuration goes here
        useESM: true
      },
    ],
  },
  coverageDirectory:  `../etc/`,
  collectCoverageFrom: [`../src/**/*.ts`],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  roots: [
    `../src/`
  ],
  // moduleNameMapper: {
  //   '^(\\.{1,2}/.*)\\.js$': `$1`,
  // },
};