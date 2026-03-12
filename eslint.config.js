import antfu from '@antfu/eslint-config';

export default antfu({
  vue: false,
  gitignore: true,
  ignores: [`**/*.md`, `bundle/`, `coverage/`, `macros/`, `tests/`],
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
  rules: {
    'no-console': `off`,
    'style/eol-last': `off`,
    'style/max-statements-per-line': `off`,
    'style/brace-style': [
      `error`,
      `1tbs`,
    ],
    'style/generator-star-spacing': [
      `error`,
      {
        after: false,
      },
    ],
    'style/block-spacing': [
      `error`,
      `always`,
    ],
    'ts/consistent-type-definitions': [
      `off`,
    ],
    'ts/no-for-in-array': [`error`],
    'ts/array-type': [`error`, {
      default: `array-simple`,
    }],
  },
});
