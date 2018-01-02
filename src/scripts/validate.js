const runScript = require('../utils/run-script');
const pEachSeries = require('p-each-series');
const { resolveFransScripts } = require('../utils');

function validate() {
  const fs = resolveFransScripts();

  return async () => {
    const tasks = [
      ['lint'],
      ['test', '--silent', '--no-watch', '--passWithNoTests'],
      ['build'],
    ];

    const iterator = t => runScript(fs, t);
    return pEachSeries(tasks, iterator);
  };
}

module.exports = validate;
