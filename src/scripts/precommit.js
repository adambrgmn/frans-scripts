const path = require('path');
const spawn = require('cross-spawn');
const {
  isOptedIn,
  resolveBin,
  hasFile,
  hasPkgProp,
  getPackageManagerBin,
} = require('../utils');

const here = p => path.join(__dirname, p);
const hereRelative = p => here(p).replace(process.cwd(), '.');

const [, , ...args] = process.argv;

const useBuiltinConfig =
  !args.includes('--config') &&
  !hasFile('.lintstagedrc') &&
  !hasFile('lintstaged.config.js') &&
  !hasPkgProp('lintstaged');

const config = useBuiltinConfig
  ? ['--config', hereRelative('../config/lintstagedrc.js')]
  : [];

const lintStagedResult = spawn.sync(resolveBin('lint-staged'), [...config], {
  stdio: 'inherit',
});

if (lintStagedResult.status !== 0 || !isOptedIn('pre-commit')) {
  process.exit(lintStagedResult.status);
} else {
  const validateResult = spawn.sync(
    getPackageManagerBin(),
    ['run', 'validate'],
    {
      stdio: 'inherit',
    },
  );

  process.exit(validateResult.status);
}
