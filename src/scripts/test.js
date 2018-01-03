const debug = require('debug')('frans:test');
const isCi = require('is-ci');
const { isNil, is, has, prop, propIs } = require('ramda');
const runScript = require('../utils/run-script');
const {
  resolveBin,
  hasFile,
  hasPkgProp,
  parseEnv,
  reformatFlags,
} = require('../utils');

function test(configPath) {
  if (isNil(configPath) || !is(String, configPath)) {
    throw new Error(
      `You must specify a default config path (as string) to command test`,
    );
  }

  return async args => {
    debug('Setup script test');

    debug('Set NODE_ENV and BABEL_ENV = "test"');
    process.env.NODE_ENV = 'test';
    process.env.BABEL_ENV = 'test';

    const hasArg = p => has(p, args);
    const getArg = p => prop(p, args);
    const argIsString = p => propIs(String, p, args);

    const useBuiltinConfig =
      !hasArg('config') && !hasFile('jest.config.js') && !hasPkgProp('jest');
    debug(`Use builtin config: ${useBuiltinConfig}`);

    const hasNoWatchArg = hasArg('watch') && !getArg('watch');
    const useBuiltinWatch =
      !hasNoWatchArg &&
      !isCi &&
      !parseEnv('SCRIPTS_PRECOMMIT', false) &&
      !hasArg('coverage') &&
      !hasArg('updateSnapshot');
    debug(`Use builtin watch: ${useBuiltinWatch}`);

    const config = useBuiltinConfig
      ? ['--config', configPath]
      : hasArg('config') && argIsString('config')
        ? ['--config', getArg('config')]
        : [];

    const watch = useBuiltinWatch ? ['--watch', '--onlyChanged'] : [];

    const flags = reformatFlags(args, ['config', 'watch']);

    const files = getArg('_');

    return runScript(resolveBin('jest'), [
      ...config,
      ...watch,
      ...flags,
      ...files,
    ]);
  };
}

module.exports = test;
