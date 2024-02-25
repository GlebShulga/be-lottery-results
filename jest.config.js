module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["./src"],
  silent: false,
  verbose: true,
  collectCoverageFrom: ["src/**"],
  coverageDirectory: "coverage",
  coverageReporters: ["text"],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
