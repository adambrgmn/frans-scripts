const path = require('path');

const readPkgUp = jest.genMockFromModule('read-pkg-up');

readPkgUp.sync = jest.fn().mockImplementation(() => ({
  pkg: {
    name: 'mock-pkg',
    dependencies: {
      'module-a': '^1.0.0',
      'module-b': '^2.0.0',
    },
    devDependencies: {
      'module-c': '^3.0.0',
      'module-d': '^4.0.0',
    },
    peerDependencies: {
      'module-e': '^5.0.0',
      'module-f': '^6.0.0',
    },
    config: {
      foo: 'bar',
    },
  },
  path: path.join(process.cwd(), 'package.json'),
}));

module.exports = readPkgUp;
