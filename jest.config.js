export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {},
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js',
    '!src/**/*.config.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '!<rootDir>/tests/e2e/**/*'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/'
  ],
  verbose: true
};