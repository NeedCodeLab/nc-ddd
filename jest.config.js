import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export const testEnvironment = "node";
export const transform = {
    ...tsJestTransformCfg,
};
export const testMatch = ["**/tests/**/*.spec.ts"];
export const moduleNameMapper = {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
};

// "jest": {
//   "moduleFileExtensions": [
//     "js",
//     "json",
//     "ts"
//   ],
//   "rootDir": ".",
//   "testRegex": ".*/src/.*\\.spec\\.ts$",
//   "transform": {
//     "^.+\\.(t|j)s$": "ts-jest"
//   },
//   "collectCoverageFrom": [
//     "**/*.(t|j)s"
//   ],
//   "coverageDirectory": "./coverage",
//   "testEnvironment": "node",
//   "moduleNameMapper": {
//     "^src/(.*)$": "<rootDir>/src/$1"
//   }
// }
