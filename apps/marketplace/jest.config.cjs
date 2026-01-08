module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@repo/(.*)$": "<rootDir>/../../packages/$1/src",
  },
};
