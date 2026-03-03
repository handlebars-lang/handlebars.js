/* eslint-disable no-console */
describe('precompiler', function () {
  // NOP Under non-node environments
  if (typeof process === 'undefined') {
    return;
  }

  var Handlebars = require('../lib'),
    Precompiler = require('../dist/cjs/precompiler'),
    fs = require('fs'),
    uglify = require('uglify-js');

  var log,
    logFunction,
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

  /**
   * Mock the Module.prototype.require-function such that an error is thrown, when "uglify-js" is loaded.
   *
   * The function cleans up its mess when "callback" is finished
   *
   * @param {Error} loadError the error that should be thrown if uglify is loaded
   * @param {function} callback a callback-function to run when the mock is active.
   */
  function mockRequireUglify(loadError, callback) {
    var Module = require('module');
    var _resolveFilename = Module._resolveFilename;
    delete require.cache[require.resolve('uglify-js')];
    delete require.cache[require.resolve('../dist/cjs/precompiler')];
    Module._resolveFilename = function (request, mod) {
      if (request === 'uglify-js') {
        throw loadError;
      }
      return _resolveFilename.call(this, request, mod);
    };
    try {
      callback();
    } finally {
      Module._resolveFilename = _resolveFilename;
      delete require.cache[require.resolve('uglify-js')];
      delete require.cache[require.resolve('../dist/cjs/precompiler')];
    }
  }

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
    console.error = errorLogFunction;
  });

  it('should output version', function () {
    Precompiler.cli({ templates: [], version: true });
    expect(log).toBe(Handlebars.VERSION);
  });
  it('should throw if lacking templates', function () {
    expect(function () {
      Precompiler.cli({ templates: [] });
    }).toThrow('Must define at least one template or directory.');
  });
  it('should handle empty/filtered directories', function () {
    Precompiler.cli({ hasDirectory: true, templates: [] });
    // Success is not throwing
  });
  it('should throw when combining simple and minimized', function () {
    expect(function () {
      Precompiler.cli({ templates: [__dirname], simple: true, min: true });
    }).toThrow('Unable to minimize simple output');
  });
  it('should throw when combining simple and multiple templates', function () {
    expect(function () {
      Precompiler.cli({
        templates: [
          __dirname + '/artifacts/empty.handlebars',
          __dirname + '/artifacts/empty.handlebars',
        ],
        simple: true,
      });
    }).toThrow('Unable to output multiple templates in simple mode');
  });
  it('should throw when missing name', function () {
    expect(function () {
      Precompiler.cli({ templates: [{ source: '' }], amd: true });
    }).toThrow('Name missing for template');
  });
  it('should throw when combining simple and directories', function () {
    expect(function () {
      Precompiler.cli({ hasDirectory: true, templates: [1], simple: true });
    }).toThrow('Unable to output multiple templates in simple mode');
  });

  it('should output simple templates', function () {
    Handlebars.precompile = function () {
      return 'simple';
    };
    Precompiler.cli({ templates: [emptyTemplate], simple: true });
    expect(log).toBe('simple\n');
  });
  it('should default to simple templates', function () {
    Handlebars.precompile = function () {
      return 'simple';
    };
    Precompiler.cli({ templates: [{ source: '' }] });
    expect(log).toBe('simple\n');
  });
  it('should output amd templates', function () {
    Handlebars.precompile = function () {
      return 'amd';
    };
    Precompiler.cli({ templates: [emptyTemplate], amd: true });
    expect(log).toMatch(/template\(amd\)/);
  });
  it('should output multiple amd', function () {
    Handlebars.precompile = function () {
      return 'amd';
    };
    Precompiler.cli({
      templates: [emptyTemplate, emptyTemplate],
      amd: true,
      namespace: 'foo',
    });
    expect(log).toMatch(/templates = foo = foo \|\|/);
    expect(log).toMatch(/return templates/);
    expect(log).toMatch(/template\(amd\)/);
  });
  it('should output amd partials', function () {
    Handlebars.precompile = function () {
      return 'amd';
    };
    Precompiler.cli({ templates: [emptyTemplate], amd: true, partial: true });
    expect(log).toMatch(/return Handlebars\.partials\['empty'\]/);
    expect(log).toMatch(/template\(amd\)/);
  });
  it('should output multiple amd partials', function () {
    Handlebars.precompile = function () {
      return 'amd';
    };
    Precompiler.cli({
      templates: [emptyTemplate, emptyTemplate],
      amd: true,
      partial: true,
    });
    expect(log).not.toMatch(/return Handlebars\.partials\[/);
    expect(log).toMatch(/template\(amd\)/);
  });
  it('should output commonjs templates', function () {
    Handlebars.precompile = function () {
      return 'commonjs';
    };
    Precompiler.cli({ templates: [emptyTemplate], commonjs: true });
    expect(log).toMatch(/template\(commonjs\)/);
  });

  it('should set data flag', function () {
    Handlebars.precompile = function (data, options) {
      expect(options.data).toBe(true);
      return 'simple';
    };
    Precompiler.cli({ templates: [emptyTemplate], simple: true, data: true });
    expect(log).toBe('simple\n');
  });

  it('should set known helpers', function () {
    Handlebars.precompile = function (data, options) {
      expect(options.knownHelpers.foo).toBe(true);
      return 'simple';
    };
    Precompiler.cli({ templates: [emptyTemplate], simple: true, known: 'foo' });
    expect(log).toBe('simple\n');
  });
  it('should output to file system', function () {
    Handlebars.precompile = function () {
      return 'simple';
    };
    Precompiler.cli({
      templates: [emptyTemplate],
      simple: true,
      output: 'file!',
    });
    expect(file).toBe('file!');
    expect(content).toBe('simple\n');
    expect(log).toBe('');
  });

  it('should output minimized templates', function () {
    Handlebars.precompile = function () {
      return 'amd';
    };
    uglify.minify = function () {
      return { code: 'min' };
    };
    Precompiler.cli({ templates: [emptyTemplate], min: true });
    expect(log).toBe('min');
  });

  it('should omit minimization gracefully, if uglify-js is missing', function () {
    var error = new Error("Cannot find module 'uglify-js'");
    error.code = 'MODULE_NOT_FOUND';
    mockRequireUglify(error, function () {
      var Precompiler = require('../dist/cjs/precompiler');
      Handlebars.precompile = function () {
        return 'amd';
      };
      Precompiler.cli({ templates: [emptyTemplate], min: true });
      expect(log).toMatch(/template\(amd\)/);
      expect(log).toMatch(/\n/);
      expect(errorLog).toMatch(/Code minimization is disabled/);
    });
  });

  it('should fail on errors (other than missing module) while loading uglify-js', function () {
    mockRequireUglify(new Error('Mock Error'), function () {
      expect(function () {
        var Precompiler = require('../dist/cjs/precompiler');
        Handlebars.precompile = function () {
          return 'amd';
        };
        Precompiler.cli({ templates: [emptyTemplate], min: true });
      }).toThrow('Mock Error');
    });
  });

  it('should output map', function () {
    Precompiler.cli({ templates: [emptyTemplate], map: 'foo.js.map' });

    expect(file).toBe('foo.js.map');
    expect(log.match(/sourceMappingURL=/g).length).toBe(1);
  });

  it('should output map', function () {
    Precompiler.cli({
      templates: [emptyTemplate],
      min: true,
      map: 'foo.js.map',
    });

    expect(file).toBe('foo.js.map');
    expect(log.match(/sourceMappingURL=/g).length).toBe(1);
  });

  describe('#loadTemplates', function () {
    function loadTemplatesAsync(inputOpts) {
      // eslint-disable-next-line compat/compat
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
      var stdin = require('mock-stdin').stdin();
      var promise = loadTemplatesAsync({ string: '-' });
      stdin.send('fo');
      stdin.send('o');
      stdin.end();
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
