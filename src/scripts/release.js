const debug = require('debug')('frans:release');
const { isNil, prop, has } = require('ramda');
const { toCamelCase } = require('strman');
const hijackCosmiconfig = require('../utils/hijack-cosmiconfig');
const { hasPkgProp, parseEnv } = require('../utils');

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
    debug('Setup script release');

    const hasArg = p => has(p, args);

    const useBuiltinConfig = configPath != null && !hasPkgProp('release');
    debug(`Use builtin config: ${useBuiltinConfig}`);

    const runRelease =
      !hasArg('dry-run') &&
      parseEnv('TRAVIS', false) &&
      process.env.TRAVIS_BRANCH === 'master' &&
      !parseEnv('TRAVIS_PULL_REQUEST', false);
    debug(`Run release: ${runRelease}`);

    if (useBuiltinConfig) {
      await hijackCosmiconfig('semantic-release', configPath, 'release');
    }

    const convertedArgs = convertArgs({ ...args, dryRun: !runRelease });

    debug('Call semantic release');
    debug('With args: %o', convertedArgs);
    return require('semantic-release')(convertedArgs);
  };
}

module.exports = release;
