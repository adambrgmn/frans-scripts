const spawn = require('cross-spawn');
const {
  parseEnv,
  resolveBin,
  ifScript,
  getConcurrentlyArgs,
  getPackageManagerBin,
} = require('../utils');

// precommit runs linting and tests on the relevant files
// so those scripts don't need to be run if we're running
// this in the context of a precommit hook.
const precommit = parseEnv('SCRIPTS_PRECOMMIT', false);
const validateScripts = process.argv[2];
const useDefaultScripts = typeof validateScripts !== 'string';

const pm = getPackageManagerBin();
const extraDashDash = pm === 'npm' ? '-- ' : '';

const scripts = useDefaultScripts
  ? {
      build: ifScript('build', `${getPackageManagerBin()} run build --silent`),
      lint: precommit
        ? null
        : ifScript('lint', `${getPackageManagerBin()} run lint --quiet`),
      test: precommit
        ? null
        : ifScript(
            'test',
            `${getPackageManagerBin()} run test --silent ${extraDashDash}--coverage`,
          ),
      flow: ifScript('flow', `${getPackageManagerBin()} run flow --silent`),
    }
  : validateScripts.split(',').reduce(
      (scriptsToRun, name) =>
        Object.assign({}, scriptsToRun, {
          [name]: `${getPackageManagerBin()} run ${name} --silent`,
        }),
      {},
    );

const result = spawn.sync(
  resolveBin('concurrently'),
  getConcurrentlyArgs(scripts),
  { stdio: 'inherit' },
);

process.exit(result.status);
