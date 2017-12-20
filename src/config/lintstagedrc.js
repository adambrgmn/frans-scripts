const { resolveFransScripts, resolveBin, isOptedOut } = require('../utils');

const fransScripts = resolveFransScripts();
const doctoc = resolveBin('doctoc');

module.exports = {
  concurrent: false,
  linters: {
    'README.md': [`${doctoc} --maxlevel 3 --notitle`, 'git add'],
    '.all-contributorsrc': [
      `${fransScripts} contributors generate`,
      'git add README.md',
    ],
    '**/*.+(js|jsx|json|less|scss|sass|css|ts|md)': [
      isOptedOut('autoformat', null, `${fransScripts} format`),
      `${fransScripts} test --passWithNoTests --findRelatedTests`,
      `${fransScripts} lint`,
      isOptedOut('autoformat', null, 'git add'),
    ].filter(Boolean),
  },
};
