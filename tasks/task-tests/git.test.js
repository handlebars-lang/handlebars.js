const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const chai = require('chai');
chai.use(require('dirty-chai'));

const git = require('../util/git');

const expect = chai.expect;

const tmpBaseDir = path.join(os.tmpdir(), 'handlebars-task-tests');
const tmpDir = path.join(tmpBaseDir, Date.now().toString(36));
const remoteDir = path.join(tmpDir, 'remote-repo');
const cloneDir = path.join(tmpDir, 'clone-repo');
const oldCwd = process.cwd();

describe('utils/git', function() {
  beforeEach(async function() {
    await fs.remove(tmpDir);
    await createRepositoryThatActsAsRemote();
    process.chdir(tmpDir);
    await git.git('clone', 'remote-repo', 'clone-repo');
    process.chdir(cloneDir);
  });

  async function createRepositoryThatActsAsRemote() {
    await fs.mkdirp(remoteDir);
    process.chdir(remoteDir);

    await git.git('init');
    await fs.writeFile('testfile.txt', 'Testfile');
    await git.add('testfile.txt');
    await git.commit('commit message');
  }

  afterEach(function() {
    process.chdir(oldCwd);
  });

  describe('the "remotes"-function', function() {
    it('should list all remotes', async function() {
      await git.git('remote', 'set-url', 'origin', 'https://test.org/test');
      await git.git('remote', 'add', 'second-remote', 'https://test.org/test2');

      const result = await git.remotes();

      expect(result.trim().split('\n')).to.deep.equal([
        'origin\thttps://test.org/test (fetch)',
        'origin\thttps://test.org/test (push)',
        'second-remote\thttps://test.org/test2 (fetch)',
        'second-remote\thttps://test.org/test2 (push)'
      ]);
    });
  });

  describe('the "branches"-function', function() {
    it('should list all branches', async function() {
      await git.git('branch', 'test');
      await git.git('branch', 'test2');

      const result = await git.branches();
      expect(result.trim().split('\n')).to.deep.equal([
        '* master',
        '  test',
        '  test2',
        '  remotes/origin/HEAD -> origin/master',
        '  remotes/origin/master'
      ]);
    });
  });

  describe('the "commitInfo"-function', function() {
    it('should list head and master sha', async function() {
      const result = await git.commitInfo();
      expect(result.masterSha).to.equal(result.headSha);
      expect(result.masterSha).to.match(/^[0-9a-f]+$/);
      expect(result.headSha).to.match(/^[0-9a-f]+$/);
    });

    it('should have "isMaster=true" if the master branch is checked out', async function() {
      const result = await git.commitInfo();
      expect(result.isMaster).to.be.true();
    });

    it('should have "isMaster=true" if the current commit is the last commit of the master branch', async function() {
      await git.git('checkout', '-b', 'new-branch');

      const result = await git.commitInfo();
      expect(result.isMaster).to.be.true();
    });

    it('should have "isMaster=false" if the current commit is NOT the last commit of the master branch', async function() {
      await git.git('checkout', '-b', 'new-branch');
      fs.writeFile('new-file.txt', 'new-file');
      await git.add('new-file.txt');
      await git.commit('added new file');

      const result = await git.commitInfo();
      expect(result.isMaster).to.be.false();
    });

    it('should show the current tag', async function() {
      await git.git('tag', 'test-tag');
      const result = await git.commitInfo();
      expect(result.tagName).to.be.equal('test-tag');
    });

    it('should show a version tag rather than standard tags', async function() {
      await git.git('tag', 'test-tag');
      await git.git('tag', 'v1.2');
      await git.git('tag', 'test-tag2');
      const result = await git.commitInfo();
      expect(result.tagName).to.be.equal('v1.2');
    });

    it('should show no tag if there is no tag', async function() {
      const result = await git.commitInfo();
      expect(result.tagName).to.be.null();
    });
  });
});
