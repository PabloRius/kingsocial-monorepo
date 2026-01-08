module.exports = {
  projects: ["<rootDir>/packages/*", "<rootDir>/apps/*"],
  testEnvironment: "node",
  moduleNameMapper: {
    "^@repo/(.*)$": "<rootDir>/packages/$1/src",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  extensionsToTreatAsEsm: [".ts"],
  transformIgnorePatterns: ["node_modules/(?!(@repo)/)"],
};
