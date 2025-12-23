import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export const testEnvironment = "node";
export const transform = {
    ...tsJestTransformCfg,
};
export const testRegex = ".*/src/.*\\.spec\\.ts$"

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
