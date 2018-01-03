/* eslint-disable no-underscore-dangle */
const fs = jest.genMockFromModule('fs');

fs.realpathSync = str => str;

fs.__accessShouldThrow = false;
fs.__setAccessShouldThrow = b => {
  fs.__accessShouldThrow = b;
};

fs.accessSync = file => {
  if (fs.__accessShouldThrow) {
    throw new Error(
      `ENOENT: no such file or directory, access '${file}' (from mock)`,
    );
  }
};

module.exports = fs;
