const path = require('path');
const { ifAnyDep, hasFile, hasPkgProp, fromRoot } = require('../../utils');

const here = p => path.join(__dirname, p);

const useBuiltInBabelConfig = !hasFile('.babelrc') && !hasPkgProp('babel');

const ignores = [
  '/node_modules/',
  '/fixtures/',
  '/__tests__/helpers/',
  '__mocks__',
];

const jestConfig = {
  rootDir: fromRoot('.'),
  roots: [fromRoot('src')],
  testEnvironment: ifAnyDep(['webpack', 'rollup', 'react'], 'jsdom', 'node'),
  collectCoverageFrom: ['src/**/*.js'],
  testPathIgnorePatterns: [...ignores],
  coveragePathIgnorePatterns: [...ignores, 'src/(umd|cjs|esm)-entry.js$'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};

if (useBuiltInBabelConfig) {
  jestConfig.transform = { '^.+\\.js$': here('./babel-transform') };
}

module.exports = jestConfig;
