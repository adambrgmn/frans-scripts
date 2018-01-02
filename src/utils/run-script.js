const spawn = require('cross-spawn');

const runScript = (bin, args, opts = { stdio: 'inherit' }) => {
  const cp = spawn(bin, args, opts);
  const promise = new Promise((resolve, reject) => {
    cp.on('close', code => {
      if (code > 0) return reject(code);
      return resolve();
    });
  });

  Object.defineProperty(promise, 'cp', { value: cp });

  return promise;
};

module.exports = runScript;
