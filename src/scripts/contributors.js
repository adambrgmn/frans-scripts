const { asyncSpawn, resolveBin } = require('../utils');

async function contributors(_, { _: args }) {
  const result = await asyncSpawn(
    resolveBin('all-contributors-cli', { executable: 'all-contributors' }),
    args,
  );

  if (result > 0)
    throw new Error(`frans-scripts contributors exited with code ${result}`);
}

module.exports = contributors;
