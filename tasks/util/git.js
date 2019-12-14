const childProcess = require('child_process');

module.exports = {
  async remotes() {
    return git('remotes', '-v');
  },
  async branches() {
    return git('branch', '-a');
  },
  async clean() {
    const stdout = git('diff-index', '--name-only', 'HEAD', '--');
    return stdout === '';
  },
  async commitInfo() {
    const headSha = await this.headSha();
    const masterSha = await this.masterSha();
    return {
      headSha,
      masterSha,
      tagName: await this.tagName(),
      isMaster: headSha === masterSha
    };
  },
  async headSha() {
    const stdout = await git(' rev-parse', '--short', 'HEAD');
    return stdout.trim();
  },
  async masterSha() {
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
  },

  async add(path) {
    return git('add', '-f', path);
  },
  async commit(message) {
    return git('commit', '--message', message);
  },
  async tag(name) {
    return git('tag', '-a', `--message=${name}`, name);
  },
  async tagName() {
    const stdout = await git('tag', '-l', '--points-at', 'HEAD');

    const tags = stdout.trim().split(/\n|\r\n/);
    const versionTags = tags.filter(tag => /^v/.test(tag));

    if (versionTags[0] != null) {
      return versionTags;
    }
    return tags[0];
  }
};

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
