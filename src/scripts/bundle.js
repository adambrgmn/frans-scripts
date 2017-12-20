const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const { isNil, is, has, prop, propIs } = require('ramda');
const Listr = require('listr');
const spawn = require('cross-spawn');
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

    return {
      title: `Bundle ${format}`,
      task: () =>
        new Promise((resolve, reject) => {
          const proc = spawn(crossEnv, [
            ...envVars,
            rollup,
            ...config,
            ...flags,
          ]);

          const err = [];

          proc.stdout.on('data', data => console.log(data.toString()));
          proc.stderr.on('data', data => err.push(data.toString()));

          proc.on('close', code => {
            if (code > 0) {
              const error = new Error(err.join('\n'));
              reject(error);
            }

            resolve();
          });
        }),
    };
  });

  const taskRunner = new Listr([
    {
      title: `Clean "${outputDir}/"`,
      task: () => rimraf(fromRoot(outputDir)),
      skip: () => !useBuiltinClean,
    },
    {
      title: `Bundle files to "${outputDir}/"`,
      task: () => new Listr(tasks, { concurrent: true }),
    },
  ]);

  await taskRunner.run();
}

module.exports = bundle;
