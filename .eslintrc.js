// should be the same as https://github.com/nylas/dashboard/blob/main/.eslintrc.js

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jasmine: true,
  },
  globals: {
    cy: true,
    Cypress: true,
    expect: true,
    assert: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
  },
  plugins: ["svelte3", "@typescript-eslint", "cypress"],
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  overrides: [
    {
      files: ["**/*.svelte"],
      processor: "svelte3/svelte3",
    },
  ],
  settings: {
    "svelte3/ignore-styles": (_) => true,
    "svelte3/ignore-warnings": (_) => true,
  },
  rules: {
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "no-console": ["error", { allow: ["warn", "error", "time"] }],
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-empty-function": 0,
  },
};
