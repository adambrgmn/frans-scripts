const { has, propIs, prop, isNil, is } = require('ramda');
const runScript = require('../utils/run-script');
const { hasFile, hasPkgProp, resolveBin, reformatFlags } = require('../utils');

async function precommit(configPath, args) {
  if (isNil(configPath) || !is(String, configPath)) {
    throw new Error(
      `You must specify a default config path (as string) to command precommit`,
    );
  }

  const hasArg = p => has(p, args);
  const getArg = p => prop(p, args);
  const argIsString = p => propIs(String, p, args);

  const useBuiltinConfig =
    !hasArg('config') &&
    !hasFile('.lintstagedrc') &&
    !hasFile('lintstaged.config.js') &&
    !hasPkgProp('lint-staged');

  const config = useBuiltinConfig
    ? ['--config', configPath]
    : hasArg('config') && argIsString('config')
      ? ['--config', getArg('config')]
      : [];

  const flags = reformatFlags(args, ['config']);

  const { _: files } = args;

  const bin = resolveBin('lint-staged');
  const cmdArgs = [...config, ...flags, ...files];

  return runScript(bin, cmdArgs, true);
}

module.exports = precommit;
