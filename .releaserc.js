'use strict';

/* The releaseConfig object drives configuration across 5 semantic-release plugins.  For more details on the
plugin options and overides used see:
- @semantic-release/commit-analyzer: https://github.com/semantic-release/commit-analyzer
- @semantic-release/release-notes-generator: https://github.com/semantic-release/release-notes-generator
- @semantic-release/changelog: https://github.com/semantic-release/changelog
- @semantic-release/npm: https://github.com/semantic-release/npm#semantic-releasenpm
- @semantic-release/git: https://github.com/semantic-release/git
- @semantic-release/github: https://github.com/semantic-release/github
*/

function compileReleaseRules(listOfTypes, release = 'patch') {
  return listOfTypes.map(type => ({
    type,
    release
  }));
}

const typesForPatch = ['docs', 'style', 'refactor', 'perf'];
const typesForMinor = ['feat'];
const parserOpts = {
  noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING']
};

const releaseConfig = {
  branches: ['master'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          ...compileReleaseRules(typesForPatch),
          ...compileReleaseRules(typesForMinor, 'minor')
        ],
        parserOpts
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        parserOpts
      }
    ],
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: false
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
        message:
          'chore(release): ${nextRelease.version} \n\n${nextRelease.notes}'
      }
    ],
    '@semantic-release/github'
  ]
};

module.exports = releaseConfig;
