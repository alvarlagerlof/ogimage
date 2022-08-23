import type { Config } from "jest";
import path from "node:path";

const config: Config = {
  preset: "ts-jest",
  testPathIgnorePatterns: ["utils", "dist"],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  globalSetup: "./jestGlobalSetup.js",
  moduleNameMapper: {
    // "../frameworks/(.*)": ["<rootDir>/src/frameworks/$1"],
    // "../frameworks/react.js": ["<rootDir>/src/frameworks/react.ts"],
    "^(\\.{1,2}/.*)\\.js$": "$1",
    chalk: require.resolve("chalk"),
    "#ansi-styles": path.join(
      require.resolve("chalk").split("chalk")[0],
      "chalk/source/vendor/ansi-styles/index.js"
    ),
    "#supports-color": path.join(
      require.resolve("chalk").split("chalk")[0],
      "chalk/source/vendor/supports-color/index.js"
    ),
  },
};

export default config;
