const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const { isNil, is, has, prop, propIs } = require('ramda');
const pEachSeries = require('p-each-series');
const runScript = require('../utils/run-script');
const { resolveBin, hasFile, fromRoot, reformatFlags } = require('../utils');

async function bundle(configPath, args) {
  if (isNil(configPath) || !is(String, configPath)) {
    throw new Error(
      `You must specify a default config path (as string) to command lint`,
    );
  }

  const hasArg = p => has(p, args);
  const getArg = p => prop(p, args);
  const argIsString = p => propIs(String, p, args);

  const useBuiltinConfig =
    !hasArg('config') && !hasArg('c') && !hasFile('rollup.config.js');

  const useBuiltinClean = !hasArg('clean') || getArg('clean');

  const config = useBuiltinConfig
    ? ['--config', configPath]
    : (hasArg('config') && argIsString('config')) ||
      (hasArg('c') && argIsString('c'))
      ? ['--config', getArg('config') || getArg('c')]
      : ['--config'];

  const flags = reformatFlags(args, ['config', 'clean', 'watch']);

  const outputDir = process.env.BUNDLE_OUTPUT_DIR || 'dist';

  const formats = ['esm', 'cjs', 'umd', 'umd.min'];
  const tasks = formats.map(format => {
    const [name, minify = false] = format.split('.');

    const mode = minify ? 'production' : 'development';
    const sourcemap = name === 'umd';

    const envVars = [
      `NODE_ENV=${mode}`,
      `BABEL_ENV=${mode}`,
      `BUNDLE_FORMAT=${name}`,
      `BUNDLE_MINIFY=${Boolean(minify)}`,
      `BUNDLE_SOURCEMAP=${sourcemap}`,
    ];

    const crossEnv = resolveBin('cross-env');
    const rollup = resolveBin('rollup');

    return runScript(crossEnv, [...envVars, rollup, ...config, ...flags]);
  });

  return pEachSeries(
    [
      () => {
        if (useBuiltinClean) {
          return rimraf(fromRoot(outputDir));
        }

        return Promise.resolve();
      },
      ...tasks,
    ],
    () => Promise.resolve(),
  );
}

module.exports = bundle;
