import fs from 'fs';
import { execSync } from 'child_process';
import * as git from './util/git.js';
import semver from 'semver';

async function main() {
  const version = process.argv[2];
  if (!semver.valid(version)) {
    throw new Error(
      'Must provide a valid semver version as first argument (e.g.: node tasks/version.js 1.0.0):\n\t' +
        version +
        '\n\n'
    );
  }

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.version = version;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  await git.add('package.json');

  const replaceSpec = [
    {
      path: 'lib/handlebars/base.js',
      regex: /const VERSION = ['"](.*)['"];/,
      replacement: `const VERSION = '${version}';`,
    },
    {
      path: 'components/bower.json',
      regex: /"version":.*/,
      replacement: `"version": "${version}",`,
    },
    {
      path: 'components/package.json',
      regex: /"version":.*/,
      replacement: `"version": "${version}",`,
    },
    {
      path: 'components/handlebars.js.nuspec',
      regex: /<version>.*<\/version>/,
      replacement: `<version>${version}</version>`,
    },
  ];

  await Promise.all(
    replaceSpec.map((spec) =>
      replaceAndAdd(spec.path, spec.regex, spec.replacement)
    )
  );

  execSync('pnpm run build', { stdio: 'inherit' });
}

export async function replaceAndAdd(filePath, regex, value) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(regex, value);
  fs.writeFileSync(filePath, content);
  await git.add(filePath);
}

import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
