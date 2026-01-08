module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@repo/(.*)$": "<rootDir>/../$1",
  },
};
