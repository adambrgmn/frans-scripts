const { isNil, prop } = require('ramda');
const { toCamelCase } = require('strman');
const hijackCosmiconfig = require('../utils/hijack-cosmiconfig');
const { hasPkgProp } = require('../utils');

const convertArgs = args => {
  const getProp = p => prop(p, args);
  return Object.keys(args).reduce((acc, key) => {
    const keysProp = getProp(key);

    if (isNil(keysProp)) return acc;
    if (key === '_') return acc;

    return {
      ...acc,
      [toCamelCase(key)]: keysProp,
    };
  }, {});
};

function release(configPath) {
  if (configPath != null && typeof configPath !== 'string') {
    throw new Error(
      'If you specify a configPath to command release it must be a string',
    );
  }

  return async args => {
    const useBuiltinConfig = configPath != null && !hasPkgProp('release');

    if (useBuiltinConfig) {
      await hijackCosmiconfig('semantic-release', configPath, 'release');
    }

    const convertedArgs = convertArgs(args);
    return require('semantic-release')(convertedArgs);
  };
}

module.exports = release;
