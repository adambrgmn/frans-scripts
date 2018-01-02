const execa = require('execa');
const isCi = require('is-ci');

const runScript = (bin, args, interactive = false, opts = {}) => {
  const proc = execa(bin, args, {
    ...opts,
    stdio: interactive && 'inherit',
    env: { ...process.env, FORCE_COLOR: !isCi },
  });

  return proc.then(result => {
    if (!interactive) {
      console.log(result.stdout);
      console.error(result.stderr);
    }
  });
};

module.exports = runScript;
