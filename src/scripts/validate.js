const runScript = require('../utils/run-script');
const { resolveFransScripts, reduceP } = require('../utils');

async function validate() {
  const fs = resolveFransScripts();

  const tasks = [
    () => runScript(fs, ['lint']),
    () =>
      runScript(fs, ['test', '--silent', '--no-watch', '--passWithNoTests']),
    () => runScript(fs, ['build']),
  ];

  return reduceP(tasks);
}

module.exports = validate;
