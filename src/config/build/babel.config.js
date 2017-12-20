const { ifAnyDep, parseEnv } = require('../../utils');

const isTest = (process.env.BABEL_ENV || process.env.NODE_ENV) === 'test';
const isBundleScript = parseEnv('SCRIPTS_BUNDLE', false);
const isUMD = process.env.BUNDLE_FORMAT === 'umd';
const treeshake = parseEnv('TREESHAKE', isBundleScript);
const ssr = parseEnv('SSR', false);

const modules = treeshake ? { modules: false } : {};

const targets = isTest
  ? { node: 'current' }
  : isBundleScript ? { browsers: ['ie 10', 'ios 7'] } : { node: '8' };
const envOptions = { ...modules, targets };

module.exports = {
  presets: [
    [require.resolve('babel-preset-env'), envOptions],
    ifAnyDep(['react'], require.resolve('babel-preset-react')),
  ].filter(Boolean),
  plugins: [
    require.resolve('babel-macros'),
    ifAnyDep(['styled-components'])
      ? [require.resolve('babel-plugin-styled-components'), { ssr }]
      : null,
    isBundleScript ? require.resolve('babel-plugin-external-helpers') : null,
    isUMD
      ? require.resolve('babel-plugin-transform-inline-environment-variables')
      : null,
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-transform-object-rest-spread'),
    require.resolve('babel-plugin-minify-dead-code-elimination'),
  ].filter(Boolean),
};
