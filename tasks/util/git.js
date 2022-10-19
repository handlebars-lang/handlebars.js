const childProcess = require('child_process');

module.exports = {
  async remotes() {
    return git('remote', '-v');
  },
  async branches() {
    return git('branch', '-a');
  },
  async commitInfo() {
    const headSha = await getHeadSha();
    const masterSha = await getMasterSha();
    return {
      headSha,
      masterSha,
      tagName: await getTagName(),
      isMaster: headSha === masterSha,
    };
  },
  async add(path) {
    return git('add', '-f', path);
  },
  async commit(message) {
    return git('commit', '--message', message);
  },
  git, // visible for testing
};

async function getHeadSha() {
  const stdout = await git('rev-parse', '--short', 'HEAD');
  return stdout.trim();
}

async function getMasterSha() {
  try {
    const stdout = await git('rev-parse', '--short', 'origin/master');
    return stdout.trim();
  } catch (error) {
    if (/Needed a single revision/.test(error.message)) {
      // Master was not checked out but in this case, so we know we are not master. We can ignore this
      return '';
    }
    throw error;
  }
}

async function getTagName() {
  const stdout = await git('tag', '-l', '--points-at', 'HEAD');
  const trimmedStdout = stdout.trim();
  if (trimmedStdout === '') {
    return null; // there is no tag
  }

  const tags = trimmedStdout.split(/\n|\r\n/);
  const versionTags = tags.filter((tag) => /^v/.test(tag));
  if (versionTags[0] != null) {
    return versionTags[0];
  }
  return tags[0];
}

async function git(...args) {
  return new Promise((resolve, reject) =>
    childProcess.execFile('git', args, (err, stdout) => {
      if (err != null) {
        return reject(
          new Error(`"git ${args.join(' ')}" caused error: ${err.message}`)
        );
      }
      resolve(stdout);
    })
  );
}
