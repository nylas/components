module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      diagnostics: {
        pathRegex: /\.(spec|test)\.ts$/,
      },
    },
  },
  rootDir: ".",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/?(*.)+(spec|test).+(ts)"],
  transform: {
    "^.+\\.svelte$": ["svelte-jester", { preprocess: true }],
    "^.+\\.(ts)$": "ts-jest",
  },
  moduleNameMapper: {
    "@commons/(.*)": "<rootDir>/commons/src/$1",
    "@commons": "<rootDir>/commons/src",
  },
};
