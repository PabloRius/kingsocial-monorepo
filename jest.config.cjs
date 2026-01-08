module.exports = {
  projects: ["<rootDir>/packages/*", "<rootDir>/apps/*"],
  testEnvironment: "node",
  moduleNameMapper: {
    "^@repo/([^/]+)$": "<rootDir>/packages/$1/src",
    "^@repo/([^/]+)/(.*)$": "<rootDir>/packages/$1/$2",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  extensionsToTreatAsEsm: [".ts"],
  transformIgnorePatterns: ["node_modules/(?!(@repo)/)"],
};
