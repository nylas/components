/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      diagnostics: {
        pathRegex: /\.(spec|test)\.ts$/,
      },
      tsconfig: "<rootDir>/tsconfig.json",
      babelConfig: true,
    },
  },
  rootDir: ".",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/?(*.)+(spec|test).+(ts)"],
  transform: {
    "^.+\\.svelte$": ["svelte-jester", { preprocess: true }],
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.js?$": "babel-jest",
  },
  transformIgnorePatterns: ["^(.+)/([^/]+)node_modules/(?!d3-time)"],
  moduleNameMapper: {
    "@commons/(.*)": "<rootDir>/commons/src/$1",
    "@commons": "<rootDir>/commons/src",
  },
  testEnvironment: "jsdom",
};
