module.exports = {
  collectCoverage: true,
  verbose: false,
  collectCoverageFrom: [ 'src/**/*.js' ],
  testRegex: '/test/[^_]*/*.js$',
  coverageDirectory: 'tmp/coverage',
  setupFiles: [
    '<rootDir>/test/_helpers/globals.js',
    'jest-plugin-fs/setup'
  ],
  testURL: 'http://localhost',
  timers: 'fake',
  coverageThreshold: {
    global: {
      lines: 100,
      branches: 100,
      statements: 100
    }
  }
}
