/* eslint-disable no-underscore-dangle */
const which = jest.genMockFromModule('which');

which.__shouldThrow = false;
which.__setShouldThrow = b => {
  which.__shouldThrow = b;
};

which.sync = bin => {
  if (which.__shouldThrow) {
    throw new Error(`not found: ${bin}`);
  }

  return bin;
};

module.exports = which;
