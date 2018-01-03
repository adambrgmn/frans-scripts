const runScript = require('../utils/run-script');
const { resolveBin } = require('../utils');

function contributors() {
  return async ({ _: args }) => {
    const bin = resolveBin('all-contributors-cli', {
      executable: 'all-contributors',
    });

    return runScript(bin, args);
  };
}

module.exports = contributors;
