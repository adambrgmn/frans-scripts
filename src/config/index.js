module.exports = {
  babel: require('./build/babel.config'),
  eslint: require('./lint/eslint.config'),
  jest: require('./test/jest.config'),
  lintStaged: require('./precommit/lintstaged.config'),
  prettier: require('./format/prettier.config'),
  getRollupConfig: () => require('./bundle/rollup.config'),
};
