import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distDir = path.resolve(__dirname, '../../dist');

const EXPECTED_BUNDLES = [
  'handlebars.js',
  'handlebars.min.js',
  'handlebars.runtime.js',
  'handlebars.runtime.min.js',
];

describe('rspack build output', () => {
  beforeAll(() => {
    // Ensure build has been run
    if (!fs.existsSync(path.join(distDir, 'handlebars.js'))) {
      execSync('npm run build', {
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

  describe('CJS output', () => {
    it('produces dist/cjs/ with correct structure', () => {
      expect(fs.existsSync(path.join(distDir, 'cjs/handlebars.js'))).toBe(true);
      expect(
        fs.existsSync(path.join(distDir, 'cjs/handlebars.runtime.js'))
      ).toBe(true);
      expect(fs.existsSync(path.join(distDir, 'cjs/handlebars/base.js'))).toBe(
        true
      );
      expect(
        fs.existsSync(path.join(distDir, 'cjs/handlebars/runtime.js'))
      ).toBe(true);
      expect(fs.existsSync(path.join(distDir, 'cjs/handlebars/utils.js'))).toBe(
        true
      );
    });

    it('does not compile lib/index.js into CJS', () => {
      // lib/index.js is already CJS, so it should be excluded from SWC compilation
      expect(fs.existsSync(path.join(distDir, 'cjs/index.js'))).toBe(false);
    });

    it('produces valid CommonJS modules', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'cjs/handlebars.js'),
        'utf8'
      );
      expect(content).toContain('"use strict"');
      expect(content).toContain('exports');
      // Should not contain ES module import/export syntax
      expect(content).not.toMatch(/^import /m);
      expect(content).not.toMatch(/^export /m);
    });
  });

  describe('UMD format', () => {
    it('wraps handlebars.js as UMD', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.js'),
        'utf8'
      );
      // UMD pattern: checks for AMD define, CommonJS module, and falls back to global
      expect(content).toContain('define');
      expect(content).toContain('exports');
      expect(content).toContain('Handlebars');
    });

    it('wraps handlebars.runtime.js as UMD', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.runtime.js'),
        'utf8'
      );
      expect(content).toContain('define');
      expect(content).toContain('exports');
      expect(content).toContain('Handlebars');
    });

    it('exposes Handlebars as global library name', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.js'),
        'utf8'
      );
      // UMD should assign to root["Handlebars"]
      expect(content).toMatch(/root\["Handlebars"\]/);
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
    it('CJS entry point loads and compiles templates', () => {
      const Handlebars = require('../../lib');
      const template = Handlebars.compile('Hello {{name}}!');
      expect(template({ name: 'World' })).toBe('Hello World!');
    });

    it('CJS runtime entry loads correctly', () => {
      const runtime = require('../../runtime');
      expect(typeof runtime.template).toBe('function');
      expect(typeof runtime.VERSION).toBe('string');
    });

    it('UMD bundle loads in Node.js (CommonJS mode)', () => {
      const Handlebars = require('../../dist/handlebars');
      expect(typeof Handlebars.compile).toBe('function');
      expect(typeof Handlebars.template).toBe('function');
      expect(typeof Handlebars.VERSION).toBe('string');

      const template = Handlebars.compile('{{greeting}} {{target}}');
      expect(template({ greeting: 'Hi', target: 'UMD' })).toBe('Hi UMD');
    });

    it('UMD runtime bundle loads in Node.js', () => {
      const runtime = require('../../dist/handlebars.runtime');
      expect(typeof runtime.template).toBe('function');
      expect(typeof runtime.SafeString).toBe('function');
      expect(typeof runtime.VERSION).toBe('string');
    });

    it('minified UMD bundle loads and works correctly', () => {
      const Handlebars = require('../../dist/handlebars.min');
      const template = Handlebars.compile('{{a}} + {{b}} = {{c}}');
      expect(template({ a: 1, b: 2, c: 3 })).toBe('1 + 2 = 3');
    });

    it('precompile and template round-trip works', () => {
      const Handlebars = require('../../lib');
      const spec = Handlebars.precompile('{{name}} is {{age}}');
      // eslint-disable-next-line no-eval
      const templateFn = Handlebars.template(eval('(' + spec + ')'));
      expect(templateFn({ name: 'Alice', age: 30 })).toBe('Alice is 30');
    });

    it('VM runtime functions are overridable', () => {
      const Handlebars = require('../../lib');
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
      // Arrow functions should be transpiled for browser compat.
      // Check that no "=>" appears outside of comments/strings in a meaningful way.
      // Simple heuristic: no "=> {" pattern which indicates arrow function bodies.
      expect(content).not.toMatch(/[=]>\s*\{/);
    });

    it('unminified bundle does not contain const/let declarations', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.js'),
        'utf8'
      );
      // For broad browser compat, const/let should be transpiled to var
      expect(content).not.toMatch(/^\s*(const|let)\s+/m);
    });

    it('unminified bundle does not use template literal syntax', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.js'),
        'utf8'
      );
      // Remove comments and string literals, then check for backticks
      // Backticks in comments/strings/regexes are fine — only actual template
      // literal usage (e.g. `foo ${bar}`) indicates untranspiled code
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip comment lines
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
        // Check for template literal interpolation pattern
        expect(trimmed).not.toMatch(/`[^`]*\$\{/);
      }
    });

    it('unminified bundle does not contain class declarations', () => {
      const content = fs.readFileSync(
        path.join(distDir, 'handlebars.js'),
        'utf8'
      );
      // Match actual class declarations at statement level (not "class" in
      // strings, comments, or reserved word lists)
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
