/* eslint-disable no-console */
import Handlebars from '../lib/index.js';
import * as Precompiler from '../lib/precompiler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import uglify from 'uglify-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('precompiler', function () {
  // NOP Under non-node environments
  if (typeof process === 'undefined') {
    return;
  }

  var log,
    logFunction,
    warnLog,
    warnLogFunction,
    errorLog,
    errorLogFunction,
    precompile,
    minify,
    emptyTemplate = {
      path: __dirname + '/artifacts/empty.handlebars',
      name: 'empty',
      source: '',
    },
    file,
    content,
    writeFileSync;

  beforeEach(function () {
    precompile = Handlebars.precompile;
    minify = uglify.minify;
    writeFileSync = fs.writeFileSync;

    // Mock stdout and stderr
    logFunction = console.log;
    log = '';
    console.log = function () {
      log += Array.prototype.join.call(arguments, '');
    };
    warnLogFunction = console.warn;
    warnLog = '';
    console.warn = function () {
      warnLog += Array.prototype.join.call(arguments, '');
    };
    errorLogFunction = console.error;
    errorLog = '';
    console.error = function () {
      errorLog += Array.prototype.join.call(arguments, '');
    };

    fs.writeFileSync = function (_file, _content) {
      file = _file;
      content = _content;
    };
  });
  afterEach(function () {
    Handlebars.precompile = precompile;
    uglify.minify = minify;
    fs.writeFileSync = writeFileSync;
    console.log = logFunction;
    console.warn = warnLogFunction;
    console.error = errorLogFunction;
  });

  it('should output version', async function () {
    await Precompiler.cli({ templates: [], version: true });
    expect(log).toBe(Handlebars.VERSION);
  });
  it('should throw if lacking templates', async function () {
    await expect(Precompiler.cli({ templates: [] })).rejects.toThrow(
      'Must define at least one template or directory.'
    );
  });
  it('should warn and stop when directories contain no matching templates', async function () {
    Handlebars.precompile = function () {
      return 'simple';
    };
    await Precompiler.cli({
      hasDirectory: true,
      templates: [],
      files: ['spec/artifacts'],
      extension: 'handlebars',
      output: 'ignored.js',
    });

    expect(warnLog).toBe(
      'Warning: No files matching *.handlebars found under spec/artifacts. Pass --extension <ext> if your templates use a different extension.'
    );
    expect(file).toBe(undefined);
    expect(log).toBe('');
  });
  it('should throw when combining simple and minimized', async function () {
    await expect(
      Precompiler.cli({ templates: [__dirname], simple: true, min: true })
    ).rejects.toThrow('Unable to minimize simple output');
  });
  it('should throw when combining simple and multiple templates', async function () {
    await expect(
      Precompiler.cli({
        templates: [
          __dirname + '/artifacts/empty.handlebars',
          __dirname + '/artifacts/empty.handlebars',
        ],
        simple: true,
      })
    ).rejects.toThrow('Unable to output multiple templates in simple mode');
  });
  it('should throw when missing name', async function () {
    await expect(
      Precompiler.cli({
        templates: [{ source: '' }, { source: '' }],
        hasDirectory: true,
      })
    ).rejects.toThrow('Name missing for template');
  });
  it('should throw when combining simple and directories', async function () {
    await expect(
      Precompiler.cli({ hasDirectory: true, templates: [1], simple: true })
    ).rejects.toThrow('Unable to output multiple templates in simple mode');
  });

  it('should output simple templates', async function () {
    Handlebars.precompile = function () {
      return 'simple';
    };
    await Precompiler.cli({ templates: [emptyTemplate], simple: true });
    expect(log).toBe('simple\n');
  });
  it('should default to simple templates', async function () {
    Handlebars.precompile = function () {
      return 'simple';
    };
    await Precompiler.cli({ templates: [{ source: '' }] });
    expect(log).toBe('simple\n');
  });

  it('should output wrapped templates', async function () {
    Handlebars.precompile = function () {
      return 'wrapped';
    };
    await Precompiler.cli({ templates: [emptyTemplate] });
    expect(log).toMatch(/template\(wrapped\)/);
    expect(log).toMatch(/\(function\(\)/);
  });

  it('should set data flag', async function () {
    Handlebars.precompile = function (data, options) {
      expect(options.data).toBe(true);
      return 'simple';
    };
    await Precompiler.cli({
      templates: [emptyTemplate],
      simple: true,
      data: true,
    });
    expect(log).toBe('simple\n');
  });

  it('should set known helpers', async function () {
    Handlebars.precompile = function (data, options) {
      expect(options.knownHelpers.foo).toBe(true);
      return 'simple';
    };
    await Precompiler.cli({
      templates: [emptyTemplate],
      simple: true,
      known: 'foo',
    });
    expect(log).toBe('simple\n');
  });
  it('should output to file system', async function () {
    Handlebars.precompile = function () {
      return 'simple';
    };
    await Precompiler.cli({
      templates: [emptyTemplate],
      simple: true,
      output: 'file!',
    });
    expect(file).toBe('file!');
    expect(content).toBe('simple\n');
    expect(log).toBe('');
  });

  it('should output minimized templates', async function () {
    Handlebars.precompile = function () {
      return 'iife';
    };
    uglify.minify = function () {
      return { code: 'min' };
    };
    await Precompiler.cli({ templates: [emptyTemplate], min: true });
    expect(log).toBe('min');
  });

  it('should output map', async function () {
    await Precompiler.cli({ templates: [emptyTemplate], map: 'foo.js.map' });

    expect(file).toBe('foo.js.map');
    expect(log.match(/sourceMappingURL=/g).length).toBe(1);
  });

  it('should output map with minification', async function () {
    await Precompiler.cli({
      templates: [emptyTemplate],
      min: true,
      map: 'foo.js.map',
    });

    expect(file).toBe('foo.js.map');
    expect(log.match(/sourceMappingURL=/g).length).toBe(1);
  });

  describe('#loadTemplates', function () {
    function loadTemplatesAsync(inputOpts) {
      return new Promise(function (resolve, reject) {
        Precompiler.loadTemplates(inputOpts, function (err, opts) {
          if (err) {
            reject(err);
          } else {
            resolve(opts);
          }
        });
      });
    }

    it('should throw on missing template', async function () {
      try {
        await loadTemplatesAsync({ files: ['foo'] });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.message).toBe('Unable to open template file "foo"');
      }
    });
    it('should enumerate directories by extension', async function () {
      var opts = await loadTemplatesAsync({
        files: [__dirname + '/artifacts'],
        extension: 'hbs',
      });
      expect(opts.templates.length).toBe(2);
      expect(opts.templates[0].name).toBe('example_2');
    });
    it('should enumerate all templates by extension', async function () {
      var opts = await loadTemplatesAsync({
        files: [__dirname + '/artifacts'],
        extension: 'handlebars',
      });
      expect(opts.templates.length).toBe(5);
      expect(opts.templates[0].name).toBe('bom');
      expect(opts.templates[1].name).toBe('empty');
      expect(opts.templates[2].name).toBe('example_1');
    });
    it('should handle regular expression characters in extensions', async function () {
      await loadTemplatesAsync({
        files: [__dirname + '/artifacts'],
        extension: 'hb(s',
      });
      // Success is not throwing
    });
    it('should handle BOM', async function () {
      var opts = await loadTemplatesAsync({
        files: [__dirname + '/artifacts/bom.handlebars'],
        extension: 'handlebars',
        bom: true,
      });
      expect(opts.templates[0].source).toBe('a');
    });

    it('should handle different root', async function () {
      var opts = await loadTemplatesAsync({
        files: [__dirname + '/artifacts/empty.handlebars'],
        simple: true,
        root: 'foo/',
      });
      expect(opts.templates[0].name).toBe(__dirname + '/artifacts/empty');
    });

    it('should accept string inputs', async function () {
      var opts = await loadTemplatesAsync({ string: '' });
      expect(opts.templates[0].name).toBeUndefined();
      expect(opts.templates[0].source).toBe('');
    });
    it('should accept string array inputs', async function () {
      var opts = await loadTemplatesAsync({
        string: ['', 'bar'],
        name: ['beep', 'boop'],
      });
      expect(opts.templates[0].name).toBe('beep');
      expect(opts.templates[0].source).toBe('');
      expect(opts.templates[1].name).toBe('boop');
      expect(opts.templates[1].source).toBe('bar');
    });
    it('should accept stdin input', async function () {
      var { stdin } = await import('mock-stdin');
      var stdinMock = stdin();
      var promise = loadTemplatesAsync({ string: '-' });
      stdinMock.send('fo');
      stdinMock.send('o');
      stdinMock.end();
      var opts = await promise;
      expect(opts.templates[0].source).toBe('foo');
    });
    it('error on name missing', async function () {
      try {
        await loadTemplatesAsync({ string: ['', 'bar'] });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.message).toBe(
          'Number of names did not match the number of string inputs'
        );
      }
    });

    it('should complete when no args are passed', async function () {
      var opts = await loadTemplatesAsync({});
      expect(opts.templates.length).toBe(0);
    });
  });
});
