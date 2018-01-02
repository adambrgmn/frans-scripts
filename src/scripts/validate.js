const runScript = require('../utils/run-script');
const pEachSeries = require('p-each-series');
const { resolveFransScripts } = require('../utils');

async function validate() {
  const fs = resolveFransScripts();

  const tasks = [
    ['lint'],
    ['test', '--silent', '--no-watch', '--passWithNoTests'],
    ['build'],
  ];

  const iterator = t => runScript(fs, t);
  return pEachSeries(tasks, iterator);
}

module.exports = validate;
