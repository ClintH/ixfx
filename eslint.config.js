// @ts-check
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.builtin,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true
      }
    },
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/array-type": ["error", { "default": "generic" }],
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      'unicorn/better-regex': 'error',
      'unicorn/consistent-destructuring': 'off',
      'unicorn/no-thenable': 'off',
      'unicorn/consistent-function-scoping': 'off',
      "unicorn/filename-case": ["error", { "case": "pascalCase" }],
      "unicorn/require-post-message-target-origin": "off",
      "unicorn/no-this-assignment": "off",
      "unicorn/no-keyword-prefix": ["off"],
      "unicorn/prevent-abbreviations": ["error", {
        "ignore": [
          ".*Opts$",
          "ctx",
          "args*",
          "Args*",
          "el",
          "fn*",
          "opts",
          "dest",
          ".*El$"
        ],
      }]
    },
  }
)