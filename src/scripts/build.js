const winston = require('winston');
const { isNil, is, has, prop, propIs } = require('ramda');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const {
  asyncSpawn,
  resolveBin,
  hasFile,
  hasPkgProp,
  reformatFlags,
  fromRoot,
} = require('../utils');

async function build(configPath, args) {
  if (isNil(configPath) || !is(String, configPath)) {
    throw new Error(
      `You must specify a default config path (as string) to command build`,
    );
  }

  const hasArg = p => has(p, args);
  const getArg = p => prop(p, args);
  const argIsString = p => propIs(String, p, args);

  const useBuiltinConfig =
    !hasArg('presets') && !hasFile('.babelrc') && !hasPkgProp('babel');

  const useBuiltinIgnore = !hasArg('ignore');
  const useBuiltinOutDir = !hasArg('out-dir') || !argIsString('out-dir');
  const useBuiltinCopy = !hasArg('copy-files') || getArg('copy-files');
  const useBuiltinClean = !hasArg('clean') || getArg('clean');

  const config = useBuiltinConfig
    ? ['--presets', configPath]
    : hasArg('presets') && argIsString('presets')
      ? ['--presets', getArg('presets')]
      : [];

  const ignore = useBuiltinIgnore
    ? ['--ignore', '__tests__,__mocks__,*.test.js,*.spec.js']
    : hasArg('ignore') && argIsString('ignore')
      ? ['--ignore', getArg('ignore')]
      : [];

  const outDir = useBuiltinOutDir
    ? ['--out-dir', 'dist']
    : ['--out-dir', getArg('out-dir')];

  const copyFiles = useBuiltinCopy ? ['--copy-files'] : [];

  const flags = reformatFlags(args, [
    'presets',
    'ignore',
    'out-dir',
    'copy-files',
    'clean',
    'debug',
  ]);

  const bin = resolveBin('babel-cli', { executable: 'babel' });
  const commandArgs = [
    'src',
    ...outDir,
    ...config,
    ...ignore,
    ...copyFiles,
    ...flags,
  ];

  const out = fromRoot(outDir[1]);
  if (useBuiltinClean) {
    winston.debug(`Clean "${out}"`);
    await rimraf(out);
  } else {
    winston.debug(`Skip cleaning "${out}"`);
  }

  winston.debug(`Will call ${bin} – with args: ${commandArgs.join(' ')}`);
  const result = await asyncSpawn(bin, commandArgs);

  if (result > 0)
    throw new Error(`frans-scripts build exited with code ${result}`);
}

module.exports = build;
