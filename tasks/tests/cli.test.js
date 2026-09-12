import fs from 'fs';
import { exec, spawnSync } from 'child_process';
import { runInNewContext } from 'vm';
import { execCommand, FileTestHelper } from 'cli-testlab';
import Handlebars from '../../lib/index.js';

const cli = 'node ./bin/handlebars.js';

expect.extend({
  toEqualWithRelaxedSpace(received, expected) {
    const normalize = (str) =>
      typeof str === 'string'
        ? str
            .replace(/\r\n/g, '\n')
            .split('\n')
            .map((line) => line.replace(/\s+/g, ' ').trim())
            .filter((line) => line.length > 0)
            .join('\n')
            .trim()
        : str;

    const normalizedReceived = normalize(received);
    const normalizedExpected = normalize(expected);
    const pass = normalizedReceived === normalizedExpected;

    return {
      pass,
      message: () =>
        `Expected output to match with relaxed whitespace.\n\n` +
        `Expected:\n${normalizedExpected}\n\nReceived:\n${normalizedReceived}`,
    };
  },
});

function expectedFile(specPath) {
  return fs.readFileSync(specPath, 'utf-8');
}

describe('bin/handlebars', function () {
  describe('help and version', function () {
    it('--help displays help menu', async function () {
      const result = await execCommand(`${cli} --help`);
      expect(result.stdout).toEqualWithRelaxedSpace(
        expectedFile('./spec/expected/help.menu.txt')
      );
    });

    it('no arguments displays help menu', async function () {
      const result = await execCommand(`${cli}`);
      expect(result.stdout).toEqualWithRelaxedSpace(
        expectedFile('./spec/expected/help.menu.txt')
      );
    });

    it('-v prints the compiler version', async function () {
      await execCommand(`${cli} -v`, {
        expectedOutput: Handlebars.VERSION,
      });
    });
  });

  describe('namespace', function () {
    it('-n sets custom namespace', async function () {
      const result = await execCommand(
        `${cli} -n CustomNamespace.templates spec/artifacts/empty.handlebars`
      );
      expect(result.stdout).toEqualWithRelaxedSpace(
        expectedFile('./spec/expected/empty.namespace.js')
      );
    });

    it('--namespace sets custom namespace', async function () {
      const result = await execCommand(
        `${cli} --namespace CustomNamespace.templates spec/artifacts/empty.handlebars`
      );
      expect(result.stdout).toEqualWithRelaxedSpace(
        expectedFile('./spec/expected/empty.namespace.js')
      );
    });
  });

  describe('file output', function () {
    let files;

    beforeEach(function () {
      files = new FileTestHelper({ basePath: '.' });
      files.createDir('tmp');
    });

    afterEach(function () {
      files.cleanup();
    });

    it('-f writes output to a file', async function () {
      const outputFile = 'tmp/cli-test-output.js';
      files.registerForCleanup(outputFile);

      await execCommand(
        `${cli} -f ${outputFile} spec/artifacts/empty.handlebars`
      );

      expect(files.fileExists(outputFile)).toBe(true);
      const content = files.getFileTextContent(outputFile);
      expect(content).toMatch(/template\(/);
    });

    it('--map writes source map and appends sourceMappingURL', async function () {
      const mapFile = 'tmp/cli-test-source.map';
      files.registerForCleanup(mapFile);

      const result = await execCommand(
        `${cli} -i "<div>1</div>" -m -N test --map ${mapFile}`
      );

      expect(result.stdout).toContain('sourceMappingURL=');
      expect(files.fileExists(mapFile)).toBe(true);
      const parsed = JSON.parse(files.getFileTextContent(mapFile));
      expect(parsed).toHaveProperty('version', 3);
      expect(parsed).toHaveProperty('sources');
      expect(parsed).toHaveProperty('mappings');
    });
  });

  describe('template options', function () {
    it('-e sets custom extension', async function () {
      const result = await execCommand(
        `${cli} -e hbs ./spec/artifacts/non.default.extension.hbs`
      );
      expect(result.stdout).toMatch(/template\(/);
    });

    it('-p compiles as partial', async function () {
      const result = await execCommand(
        `${cli} -p ./spec/artifacts/partial.template.handlebars`
      );
      expect(result.stdout).toMatch(/Handlebars\.partials/);
    });

    it('-r strips root from template names', async function () {
      const result = await execCommand(
        `${cli} spec/artifacts/partial.template.handlebars -r spec`
      );
      expect(result.stdout).toMatch(/template\(/);
    });

    it('-b strips BOM', async function () {
      const result = await execCommand(
        `${cli} ./spec/artifacts/bom.handlebars -b`
      );
      expect(result.stdout).toMatch(/template\(/);
    });

    it('-k -o sets known helpers only', async function () {
      const result = await execCommand(
        `${cli} spec/artifacts/known.helpers.handlebars -k someHelper -k anotherHelper -o`
      );
      expect(result.stdout).toMatch(/template\(/);
    });
  });

  describe('inline templates', function () {
    it('-i compiles inline template', async function () {
      const result = await execCommand(
        `${cli} -i "<div>hello</div>" -N myTemplate`
      );
      expect(result.stdout).toContain("templates['myTemplate']");
    });

    it('-i compiles simple unnamed inline template', async function () {
      const result = await execCommand(`${cli} -i "<div>hello</div>"`);
      // Unnamed single template defaults to simple mode
      expect(result.stdout).toMatch(/function/);
    });
  });

  describe('minification', function () {
    const inputs = [
      { name: 'inline', args: ['-i', 'test'] },
      { name: 'stdin', args: ['-i', '-'], input: 'test' },
    ];

    it.each(inputs)('rejects unnamed $name input', function ({ args, input }) {
      const result = spawnSync(
        process.execPath,
        ['./bin/handlebars.js', '-m', ...args],
        { input, encoding: 'utf8' }
      );

      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('Unable to minimize simple output');
    });

    it.each(inputs)('compiles named $name input', function ({ args, input }) {
      const result = spawnSync(
        process.execPath,
        ['./bin/handlebars.js', '-m', '-N', 'test', ...args],
        { input, encoding: 'utf8' }
      );

      expect(result.error).toBeUndefined();
      expect(result.status).toBe(0);
      const environment = Handlebars.create();
      runInNewContext(result.stdout, { Handlebars: environment });
      expect(environment.templates.test({})).toBe('test');
    });
  });

  describe('error handling', function () {
    it('should not produce unhandled promise rejections on async errors', async function () {
      const { stderr } = await new Promise((resolve) => {
        exec(
          `node --unhandled-rejections=warn ./bin/handlebars.js -i "<div>test</div>" -N test --map /nonexistent/dir/test.map`,
          (error, stdout, stderr) => {
            resolve({ exitCode: error ? error.code : 0, stderr });
          }
        );
      });

      expect(stderr).not.toMatch(/unhandled/i);
    });
  });
});
