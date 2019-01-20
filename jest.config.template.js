module.exports = {
  // collectCoverage: true,
  // coverageDirectory: './coverage',
  // coverageReporters: ['html'],
  // collectCoverageFrom: [
  //   '**/*.ts'
  // ],
  roots: [
    '<rootDir>/tests',
    '<rootDir>/src',
  ],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '.+\.spec\.ts$',
  moduleFileExtensions: [
    'ts',
    'js',
    'json',
    'node'
  ],
  testEnvironment: 'node',
  // globals: {
  //   'ts-jest': {
  //     babelConfig: true
  //   }
  // }
};
