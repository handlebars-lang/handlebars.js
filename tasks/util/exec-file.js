const childProcess = require('child_process');

module.exports = {
  execNodeJsScriptWithInheritedOutput,
};

async function execNodeJsScriptWithInheritedOutput(command, args) {
  return new Promise((resolve, reject) => {
    const child = childProcess.fork(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Child process failed with exit-code ${code}`));
      }
      resolve();
    });
  });
}
