const pkg = require('../package.json');

exports.actions = {
  format: {
    config: require.resolve('./config/format/prettier.config.js'),
    description: 'Format sourcecode with Prettier',
  },
  contributors: {
    description: 'Add contributors to your project with all-contributors',
  },
  lint: {
    config: require.resolve('./config/lint/eslint.config.js'),
    description: 'Lint sourcecode with Eslint',
  },
  test: {
    config: require.resolve('./config/test/jest.config.js'),
    description: 'Test sourcecode with Jest',
  },
  bundle: {
    config: require.resolve('./config/bundle/rollup.config.js'),
    description: 'Bundle your lib with Rollup',
  },
  build: {
    config: require.resolve('./config/build/babel.config.js'),
    description: 'Build your lib with Babel',
  },
  precommit: {
    config: require.resolve('./config/precommit/lintstaged.config.js'),
    description: 'Run scripts against staged files with lint-staged',
  },
  release: {
    description: 'Publish scripts to npm with semantic-release',
  },
};

exports.cliOptions = {
  name: pkg.name,
  description: pkg.description,
  version: pkg.version,
};
