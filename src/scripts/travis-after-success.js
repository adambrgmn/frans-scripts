const spawn = require('cross-spawn');
const {
  resolveBin,
  getConcurrentlyArgs,
  hasFile,
  pkg,
  parseEnv,
} = require('../utils');

const autorelease =
  pkg.version === '0.0.0-semantically-released' &&
  parseEnv('TRAVIS', false) &&
  process.env.TRAVIS_BRANCH === 'master' &&
  !parseEnv('TRAVIS_PULL_REQUEST', false);

const reportCoverage = hasFile('coverage') && !parseEnv('SKIP_CODECOV', false);

if (!autorelease && !reportCoverage) {
  console.log('No need to autorelease or report coverage.');
} else {
  const result = spawn.sync(
    resolveBin('concurrently'),
    getConcurrentlyArgs(
      {
        codecov: reportCoverage
          ? `echo installing codecov && npx -p codecov -c 'echo running codecov && codecov'`
          : null,
        release: autorelease
          ? `echo installing semantic-release && npx -p semantic-release@11 -c 'echo running semantic-release && semantic-release'`
          : `echo running semantic-release dry-run && echo installing semantic-release && npx -p semantic-release@11 -c 'echo running semantic-release && semantic-release --dry-run'`,
      },
      { killOthers: false },
    ),
    { stdio: 'inherit' },
  );

  process.exit(result.status);
}
