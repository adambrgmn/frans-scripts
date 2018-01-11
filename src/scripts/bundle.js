const debug = require('debug')('frans:bundle');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const { isNil, is, has, prop, propIs } = require('ramda');
const pSeries = require('p-series');
const runScript = require('../utils/run-script');
const {
  resolveBin,
  hasFile,
  fromRoot,
  reformatFlags,
  hasPkgProp,
} = require('../utils');

function bundle(configPath) {
  if (isNil(configPath) || !is(String, configPath)) {
    throw new Error(
      `You must specify a default config path (as string) to command lint`,
    );
  }

  return async args => {
    debug('Setup script build');
    const hasArg = p => has(p, args);
    const getArg = p => prop(p, args);
    const argIsString = p => propIs(String, p, args);

    const useBuiltinConfig =
      !hasArg('config') && !hasArg('c') && !hasFile('rollup.config.js');
    debug(`Use builtin config: ${useBuiltinConfig}`);

    const useBuiltinClean = !hasArg('clean') || getArg('clean');
    debug(`Use builtin clean: ${useBuiltinClean}`);

    const config = useBuiltinConfig
      ? ['--config', configPath]
      : (hasArg('config') && argIsString('config')) ||
        (hasArg('c') && argIsString('c'))
        ? ['--config', getArg('config') || getArg('c')]
        : ['--config'];

    const flags = reformatFlags(args, ['config', 'clean', 'watch']);

    const outputDir = process.env.BUNDLE_OUTPUT_DIR || 'dist';
    debug(`Output dir: ${outputDir}`);

    const formats = ['esm', 'cjs', 'umd', 'umd.min'];
    const tasks = formats.map(format => {
      const [name, minify = false] = format.split('.');

      const mode = minify ? 'production' : 'development';
      const sourcemap = name === 'umd';

      const rollup = resolveBin('rollup');
      return () =>
        runScript(rollup, [...config, ...flags], {
          env: {
            NODE_ENV: mode,
            BABEL_ENV: mode,
            BUNDLE_FORMAT: name,
            BUNDLE_MINIFY: Boolean(minify),
            BUNDLE_SOURCEMAP: sourcemap,
          },
        });
    });

    return pSeries([
      async () => {
        if (useBuiltinClean) {
          debug(`Clean output dir`);
          await rimraf(fromRoot(outputDir));
          debug(`Output dir cleaned successfully`);
        } else {
          debug('Skip cleaning output dir');
        }
      },
      ...tasks,
      async () => {
        const bundlesizeConfig = hasPkgProp('bundlesize')
          ? []
          : ['--files', 'dist/*.js'];
        await runScript('npx', ['bundlesize', ...bundlesizeConfig]);
      },
    ]);
  };
}

module.exports = bundle;
