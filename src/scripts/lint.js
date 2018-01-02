const { isNil, is, has, prop, propIs } = require('ramda');
const runScript = require('../utils/run-script');
const {
  resolveBin,
  hasFile,
  hasPkgProp,
  reformatFlags,
  fromRoot,
} = require('../utils');

async function lint(configPath, args) {
  if (isNil(configPath) || !is(String, configPath)) {
    throw new Error(
      `You must specify a default config path (as string) to command lint`,
    );
  }

  const hasArg = p => has(p, args);
  const getArg = p => prop(p, args);
  const argIsString = p => propIs(String, p, args);

  const useBuiltinConfig =
    !hasArg('config') &&
    !hasFile('.eslintrc') &&
    !hasFile('.eslintrc.json') &&
    !hasFile('.eslintrc.js') &&
    !hasPkgProp('eslintConfig');

  const useGitignore =
    hasFile('.gitignore') &&
    !hasArg('ignore-path') &&
    !hasFile('.eslintignore') &&
    !hasPkgProp('eslintIgnore');

  const useBuiltinCache = !hasArg('cache') || getArg('cache');

  const config = useBuiltinConfig
    ? ['--config', configPath]
    : hasArg('config') && argIsString('config')
      ? ['--config', getArg('config')]
      : [];

  const ignore = useGitignore
    ? ['--ignore-path', fromRoot('.gitignore')]
    : hasArg('ignore-path') && argIsString('ignore-path')
      ? ['--ignore-path', getArg('ignore-path')]
      : [];

  const cache = useBuiltinCache ? ['--cache'] : [];

  const flags = reformatFlags(args, [
    'config',
    'ignore-path',
    'cache',
    'debug',
  ]);

  const filesGiven = getArg('_');
  const files =
    filesGiven.length > 0
      ? filesGiven.filter(f => f.endsWith('.js') || f.endsWith('.jsx'))
      : ['.'];

  const bin = resolveBin('eslint');
  const commandArgs = [...files, ...config, ...ignore, ...cache, ...flags];

  return runScript(bin, commandArgs);
}

module.exports = lint;
