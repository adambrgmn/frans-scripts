const { has, propIs, prop, isNil, is } = require('ramda');
const runScript = require('../utils/run-script');
const {
  hasFile,
  hasPkgProp,
  resolveBin,
  reformatFlags,
  fromRoot,
} = require('../utils');

function format(configPath) {
  if (isNil(configPath) || !is(String, configPath)) {
    throw new Error(
      `You must specify a default config path (as string) to command format`,
    );
  }

  return async args => {
    const hasArg = p => has(p, args);
    const getArg = p => prop(p, args);
    const argIsString = p => propIs(String, p, args);

    const useBuiltinConfig =
      !hasArg('config') &&
      !hasFile('.prettierrc') &&
      !hasFile('prettier.config.js') &&
      !hasPkgProp('prettier');

    const useGitignore =
      hasFile('.gitignore') &&
      !hasFile('.prettierignore') &&
      !hasArg('ignore-path');
    const useBuiltinWrite = !hasArg('write') || getArg('write');

    const config = useBuiltinConfig
      ? ['--config', configPath]
      : hasArg('config') && argIsString('config')
        ? ['--config', getArg('config')]
        : [];

    const ignore = useGitignore
      ? ['--ignore-path', fromRoot('.gitignore')]
      : hasArg('ignore-path') && argIsString('config')
        ? ['--ignore-path', getArg('ignore-path')]
        : [];

    const write = useBuiltinWrite ? ['--write'] : [];

    const flags = reformatFlags(args, [
      'config',
      'ignore-path',
      'write',
      'debug',
    ]);

    const filesProvided = getArg('_');
    const files =
      filesProvided.length > 0
        ? filesProvided
        : ['**/*.+(js|jsx|json|less|scss|css|ts|md)'];

    const bin = resolveBin('prettier');
    const commandArgs = [...flags, ...config, ...ignore, ...write, ...files];

    return runScript(bin, commandArgs);
  };
}

module.exports = format;
