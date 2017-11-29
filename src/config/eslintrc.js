const { ifAnyDep } = require('../utils');

module.exports = {
  parser: 'babel-eslint',
  extends: [
    require.resolve('eslint-config-airbnb-base'),
    ifAnyDep('react', require.resolve('eslint-config-airbnb')),
    require.resolve('eslint-config-prettier'),
  ].filter(Boolean),
  plugins: ['babel'],
  env: {
    browser: true,
    node: true,
    commonjs: true,
    'shared-node-browser': true,
    es6: true,
    worker: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: { experimentalObjectRestSpread: true },
  },
  rules: {
    'import/prefer-default-export': 'off',
    'react/jsx-filename-extension': 'off',
    'react/sort-comp': 'off',
  },
};
