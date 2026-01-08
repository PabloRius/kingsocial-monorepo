module.exports = {
  projects: ["<rootDir>/packages/*", "<rootDir>/apps/*"],
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@repo/(.*)$": "<rootDir>/packages/$1/src",
  },
};
