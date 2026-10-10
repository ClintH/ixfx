import antfu from '@antfu/eslint-config';

export default antfu({
  vue: false,
  gitignore: true,
  ignores: [
    `**/*.md`,
    `bundle/`,
    `coverage/`,
    `macros/`,
    `demos/`,
    // Legacy pre-monorepo sources (root src/): not part of any package,
    // not built or tested; PlotElement.js uses decorators and does not parse.
    // Excluded pending a decision on deleting them.
    `src/`,
  ],
  formatters: {
    css: true,
    html: true,
    markdown: `prettier`,
  },
  stylistic: {
    indent: 2,
    quotes: `backtick`,
    semi: true,
  },
  typescript: {
    // Enables type-aware linting for package sources via projectService.
    // Scoped to src files only: tsconfig.lib.json excludes tests and root
    // config files, and a type-aware rule crashes on files outside its
    // project. `ts/no-for-in-array` (a type-aware rule) must therefore only
    // be enabled here, never in the top-level `rules`.
    tsconfigPath: `./tsconfig.lib.json`,
    filesTypeAware: [`packages/*/src/**/*.ts`],
    overridesTypeAware: {
      // Opt-in: keep only the type-aware rules this repo wants, disable the
      // rest of the antfu type-aware bundle. Enable more deliberately over
      // time; see TESTING-PLAN.md
      'ts/no-for-in-array': `error`,
      'ts/await-thenable': `off`,
      'ts/dot-notation': `off`,
      'ts/no-floating-promises': `off`,
      'ts/no-implied-eval': `off`,
      'ts/no-misused-promises': `off`,
      'ts/no-unnecessary-type-assertion': `off`,
      'ts/no-unsafe-argument': `off`,
      'ts/no-unsafe-assignment': `off`,
      'ts/no-unsafe-call': `off`,
      'ts/no-unsafe-member-access': `off`,
      'ts/no-unsafe-return': `off`,
      'ts/promise-function-async': `off`,
      'ts/restrict-plus-operands': `off`,
      'ts/restrict-template-expressions': `off`,
      'ts/return-await': `off`,
      'ts/strict-boolean-expressions': `off`,
      'ts/switch-exhaustiveness-check': `off`,
      'ts/unbound-method': `off`,
    },
  },
  rules: {
    'no-console': `off`,
    'style/eol-last': `off`,
    'style/max-statements-per-line': `off`,
    'style/brace-style': [
      `error`,
      `1tbs`,
    ],
    // NB: do not add a generator-star-spacing override without matching the
    // codebase (`function* name` = antfu default). A previous override of
    // { after: false } contradicted every generator in the repo, and its
    // fixer mangled async generators.
    'style/block-spacing': [
      `error`,
      `always`,
    ],
    // Unsafe fixer: rewrites Object.assign(...)/x.concat(...) to spread. It
    // mangles rest-args (Object.assign({}, ...a) -> {......a}) and misfires
    // on non-Array receivers (Sync.concat(...) -> [...Sync]), producing
    // invalid code. Keep off unless the fixer is fixed upstream.
    'e18e/prefer-spread-syntax': `off`,
    'ts/consistent-type-definitions': [
      `off`,
    ],
    'ts/array-type': [`error`, {
      default: `array-simple`,
    }],
  },
});
