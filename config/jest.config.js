/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: `ts-jest/presets/default-esm`,
  testEnvironment: `jest-environment-node`,
  setupFilesAfterEnv: [`./jest.setup.js`, `jest-extended/all`],
  extensionsToTreatAsEsm: [`.ts`],
  transform: {},
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
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': `$1`,
  },
};