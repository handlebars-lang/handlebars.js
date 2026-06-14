import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../../dist');

const EXPECTED_BUNDLES = [
  'handlebars.js',
  'handlebars.min.js',
  'handlebars.runtime.js',
  'handlebars.runtime.min.js',
];

describe('rspack build output', () => {
  beforeAll(() => {
    // Ensure full build has been run
    if (!fs.existsSync(path.join(distDir, 'handlebars.js'))) {
      execSync('pnpm run build', {
        cwd: path.resolve(__dirname, '../..'),
        stdio: 'inherit',
      });
    }
  });

  describe('bundle files', () => {
    for (const bundle of EXPECTED_BUNDLES) {
      it(`produces ${bundle}`, () => {
        const filePath = path.join(distDir, bundle);
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.statSync(filePath).size).toBeGreaterThan(0);
      });
    }
  });

  describe('global export', () => {
    it('handlebars.js assigns to self.Handlebars', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.js'),
        'utf8'
      );
      expect(content).toContain('self.Handlebars');
    });

    it('handlebars.runtime.js assigns to self.Handlebars', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.runtime.js'),
        'utf8'
      );
      expect(content).toContain('self.Handlebars');
    });
  });

  describe('license banner', () => {
    for (const bundle of EXPECTED_BUNDLES) {
      it(`${bundle} starts with license banner`, () => {
        const content = fs.readFileSync(path.join(distDir, bundle), 'utf8');
        expect(content).toMatch(/^\/\*!\s/);
        expect(content).toContain('@license');
        expect(content).toContain('Permission is hereby granted');
        expect(content).toContain('handlebars v');
      });
    }
  });

  describe('minification', () => {
    it('minified bundles are significantly smaller', () => {
      const fullSize = fs.statSync(path.join(distDir, 'handlebars.js')).size;
      const minSize = fs.statSync(path.join(distDir, 'handlebars.min.js')).size;
      // Minified should be at most 50% of unminified
      expect(minSize).toBeLessThan(fullSize * 0.5);
    });

    it('minified runtime bundles are significantly smaller', () => {
      const fullSize = fs.statSync(
        path.join(distDir, 'handlebars.runtime.js')
      ).size;
      const minSize = fs.statSync(
        path.join(distDir, 'handlebars.runtime.min.js')
      ).size;
      expect(minSize).toBeLessThan(fullSize * 0.5);
    });

    it('minified bundles preserve license comments', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.min.js'),
        'utf8'
      );
      expect(content).toContain('@license');
    });
  });

  describe('functional correctness', () => {
    it('ESM entry point loads and compiles templates', async () => {
      const Handlebars = (await import('../../lib/index.js')).default;
      const template = Handlebars.compile('Hello {{name}}!');
      expect(template({ name: 'World' })).toBe('Hello World!');
    });

    it('ESM runtime entry loads correctly', async () => {
      const runtime = (await import('../../runtime.js')).default;
      expect(typeof runtime.template).toBe('function');
      expect(typeof runtime.VERSION).toBe('string');
    });

    it('precompile and template round-trip works', async () => {
      const Handlebars = (await import('../../lib/index.js')).default;
      const spec = Handlebars.precompile('{{name}} is {{age}}');
      // eslint-disable-next-line no-eval
      const templateFn = Handlebars.template(eval('(' + spec + ')'));
      expect(templateFn({ name: 'Alice', age: 30 })).toBe('Alice is 30');
    });

    it('VM runtime functions are overridable', async () => {
      const Handlebars = (await import('../../lib/index.js')).default;
      const env = Handlebars.create();
      const originalCheckRevision = env.VM.checkRevision;

      // This must not throw — VM should be a plain mutable object
      env.VM.checkRevision = function () {};
      expect(env.VM.checkRevision).not.toBe(originalCheckRevision);

      // Restore
      env.VM.checkRevision = originalCheckRevision;
    });
  });

  describe('browser compatibility targeting', () => {
    it('unminified bundle does not contain arrow functions', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.js'),
        'utf8'
      );
      expect(content).not.toMatch(/[=]>\s*\{/);
    });

    it('unminified bundle does not contain const/let declarations', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.js'),
        'utf8'
      );
      expect(content).not.toMatch(/^\s*(const|let)\s+/m);
    });

    it('unminified bundle does not use template literal syntax', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.js'),
        'utf8'
      );
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
        expect(trimmed).not.toMatch(/`[^`]*\$\{/);
      }
    });

    it('unminified bundle does not contain class declarations', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.js'),
        'utf8'
      );
      const classDeclarations = content.split('\n').filter((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return false;
        return /^\s*class\s+\w+/.test(line);
      });
      expect(classDeclarations).toEqual([]);
    });

    it('runtime bundle also targets older browsers', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.runtime.js'),
        'utf8'
      );
      expect(content).not.toMatch(/[=]>\s*\{/);
      expect(content).not.toMatch(/^\s*(const|let)\s+/m);
    });
  });
});
