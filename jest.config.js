module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: 1,
  setupFilesAfterEnv: ['./src/test/setupTests.ts']
};
