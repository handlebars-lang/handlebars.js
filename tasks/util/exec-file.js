const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  execNodeJsScriptWithInheritedOutput,
  execFileWithInheritedOutput
};

async function execNodeJsScriptWithInheritedOutput(command, args) {
  return new Promise((resolve, reject) => {
    const child = childProcess.fork(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Child process failed with exit-code ${code}`));
      }
      resolve();
    });
  });
}

async function execFileWithInheritedOutput(command, args) {
  return new Promise((resolve, reject) => {
    const resolvedCommand = preferLocalDependencies(command);
    const child = childProcess.spawn(resolvedCommand, args, {
      stdio: 'inherit'
    });
    child.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`Child process failed with exit-code ${code}`));
      }
      resolve();
    });
  });
}

function preferLocalDependencies(command) {
  const localCandidate = resolveLocalCandidate(command);

  if (fs.existsSync(localCandidate)) {
    return localCandidate;
  }
  return command;
}

function resolveLocalCandidate(command) {
  if (process.platform === 'win32') {
    return path.join('node_modules', '.bin', command + '.cmd');
  }
  return path.join('node_modules', '.bin', command);
}
