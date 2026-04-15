const nextJest = require("next/jest.js");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["<rootDir>/src/__tests__/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "src/utils/**/*.{ts,tsx}",
    "src/helpers/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "src/stores/**/*.{ts,tsx}",
    "src/lib/utils.ts",
    "src/components/**.tsx",

    "!src/**/*.d.ts",
    "!src/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
};

module.exports = createJestConfig(config);
