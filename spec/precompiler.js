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
    equals(log, Handlebars.VERSION);
  });
  it('should throw if lacking templates', function () {
    shouldThrow(
      function () {
        Precompiler.cli({ templates: [] });
      },
      Handlebars.Exception,
      'Must define at least one template or directory.'
    );
  });
  it('should handle empty/filtered directories', function () {
    Precompiler.cli({ hasDirectory: true, templates: [] });
    // Success is not throwing
  });
  it('should throw when combining simple and minimized', function () {
    shouldThrow(
      function () {
        Precompiler.cli({ templates: [__dirname], simple: true, min: true });
      },
      Handlebars.Exception,
      'Unable to minimize simple output'
    );
  });
  it('should throw when combining simple and multiple templates', function () {
    shouldThrow(
      function () {
        Precompiler.cli({
          templates: [
            __dirname + '/artifacts/empty.handlebars',
            __dirname + '/artifacts/empty.handlebars',
          ],
          simple: true,
        });
      },
      Handlebars.Exception,
      'Unable to output multiple templates in simple mode'
    );
  });
  it('should throw when missing name', function () {
    shouldThrow(
      function () {
        Precompiler.cli({ templates: [{ source: '' }], amd: true });
      },
      Handlebars.Exception,
      'Name missing for template'
    );
  });
  it('should throw when combining simple and directories', function () {
    shouldThrow(
      function () {
        Precompiler.cli({ hasDirectory: true, templates: [1], simple: true });
      },
      Handlebars.Exception,
      'Unable to output multiple templates in simple mode'
    );
  });

  it('should output simple templates', function () {
    Handlebars.precompile = function () {
      return 'simple';
    };
    Precompiler.cli({ templates: [emptyTemplate], simple: true });
    equal(log, 'simple\n');
  });
  it('should default to simple templates', function () {
    Handlebars.precompile = function () {
      return 'simple';
    };
    Precompiler.cli({ templates: [{ source: '' }] });
    equal(log, 'simple\n');
  });
  it('should output amd templates', function () {
    Handlebars.precompile = function () {
      return 'amd';
    };
    Precompiler.cli({ templates: [emptyTemplate], amd: true });
    equal(/template\(amd\)/.test(log), true);
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
    equal(/templates = foo = foo \|\|/.test(log), true);
    equal(/return templates/.test(log), true);
    equal(/template\(amd\)/.test(log), true);
  });
  it('should output amd partials', function () {
    Handlebars.precompile = function () {
      return 'amd';
    };
    Precompiler.cli({ templates: [emptyTemplate], amd: true, partial: true });
    equal(/return Handlebars\.partials\['empty'\]/.test(log), true);
    equal(/template\(amd\)/.test(log), true);
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
    equal(/return Handlebars\.partials\[/.test(log), false);
    equal(/template\(amd\)/.test(log), true);
  });
  it('should output commonjs templates', function () {
    Handlebars.precompile = function () {
      return 'commonjs';
    };
    Precompiler.cli({ templates: [emptyTemplate], commonjs: true });
    equal(/template\(commonjs\)/.test(log), true);
  });

  it('should set data flag', function () {
    Handlebars.precompile = function (data, options) {
      equal(options.data, true);
      return 'simple';
    };
    Precompiler.cli({ templates: [emptyTemplate], simple: true, data: true });
    equal(log, 'simple\n');
  });

  it('should set known helpers', function () {
    Handlebars.precompile = function (data, options) {
      equal(options.knownHelpers.foo, true);
      return 'simple';
    };
    Precompiler.cli({ templates: [emptyTemplate], simple: true, known: 'foo' });
    equal(log, 'simple\n');
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
    equal(file, 'file!');
    equal(content, 'simple\n');
    equal(log, '');
  });

  it('should output minimized templates', function () {
    Handlebars.precompile = function () {
      return 'amd';
    };
    uglify.minify = function () {
      return { code: 'min' };
    };
    Precompiler.cli({ templates: [emptyTemplate], min: true });
    equal(log, 'min');
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
      equal(/template\(amd\)/.test(log), true);
      equal(/\n/.test(log), true);
      equal(/Code minimization is disabled/.test(errorLog), true);
    });
  });

  it('should fail on errors (other than missing module) while loading uglify-js', function () {
    mockRequireUglify(new Error('Mock Error'), function () {
      shouldThrow(
        function () {
          var Precompiler = require('../dist/cjs/precompiler');
          Handlebars.precompile = function () {
            return 'amd';
          };
          Precompiler.cli({ templates: [emptyTemplate], min: true });
        },
        Error,
        'Mock Error'
      );
    });
  });

  it('should output map', function () {
    Precompiler.cli({ templates: [emptyTemplate], map: 'foo.js.map' });

    equal(file, 'foo.js.map');
    equal(log.match(/sourceMappingURL=/g).length, 1);
  });

  it('should output map', function () {
    Precompiler.cli({
      templates: [emptyTemplate],
      min: true,
      map: 'foo.js.map',
    });

    equal(file, 'foo.js.map');
    equal(log.match(/sourceMappingURL=/g).length, 1);
  });

  describe('#loadTemplates', function () {
    it('should throw on missing template', function (done) {
      Precompiler.loadTemplates({ files: ['foo'] }, function (err) {
        equal(err.message, 'Unable to open template file "foo"');
        done();
      });
    });
    it('should enumerate directories by extension', function (done) {
      Precompiler.loadTemplates(
        { files: [__dirname + '/artifacts'], extension: 'hbs' },
        function (err, opts) {
          equal(opts.templates.length, 2);
          equal(opts.templates[0].name, 'example_2');

          done(err);
        }
      );
    });
    it('should enumerate all templates by extension', function (done) {
      Precompiler.loadTemplates(
        { files: [__dirname + '/artifacts'], extension: 'handlebars' },
        function (err, opts) {
          equal(opts.templates.length, 5);
          equal(opts.templates[0].name, 'bom');
          equal(opts.templates[1].name, 'empty');
          equal(opts.templates[2].name, 'example_1');
          done(err);
        }
      );
    });
    it('should handle regular expression characters in extensions', function (done) {
      Precompiler.loadTemplates(
        { files: [__dirname + '/artifacts'], extension: 'hb(s' },
        function (err) {
          // Success is not throwing
          done(err);
        }
      );
    });
    it('should handle BOM', function (done) {
      var opts = {
        files: [__dirname + '/artifacts/bom.handlebars'],
        extension: 'handlebars',
        bom: true,
      };
      Precompiler.loadTemplates(opts, function (err, opts) {
        equal(opts.templates[0].source, 'a');
        done(err);
      });
    });

    it('should handle different root', function (done) {
      var opts = {
        files: [__dirname + '/artifacts/empty.handlebars'],
        simple: true,
        root: 'foo/',
      };
      Precompiler.loadTemplates(opts, function (err, opts) {
        equal(opts.templates[0].name, __dirname + '/artifacts/empty');
        done(err);
      });
    });

    it('should accept string inputs', function (done) {
      var opts = { string: '' };
      Precompiler.loadTemplates(opts, function (err, opts) {
        equal(opts.templates[0].name, undefined);
        equal(opts.templates[0].source, '');
        done(err);
      });
    });
    it('should accept string array inputs', function (done) {
      var opts = { string: ['', 'bar'], name: ['beep', 'boop'] };
      Precompiler.loadTemplates(opts, function (err, opts) {
        equal(opts.templates[0].name, 'beep');
        equal(opts.templates[0].source, '');
        equal(opts.templates[1].name, 'boop');
        equal(opts.templates[1].source, 'bar');
        done(err);
      });
    });
    it('should accept stdin input', function (done) {
      var stdin = require('mock-stdin').stdin();
      Precompiler.loadTemplates({ string: '-' }, function (err, opts) {
        equal(opts.templates[0].source, 'foo');
        done(err);
      });
      stdin.send('fo');
      stdin.send('o');
      stdin.end();
    });
    it('error on name missing', function (done) {
      var opts = { string: ['', 'bar'] };
      Precompiler.loadTemplates(opts, function (err) {
        equal(
          err.message,
          'Number of names did not match the number of string inputs'
        );
        done();
      });
    });

    it('should complete when no args are passed', function (done) {
      Precompiler.loadTemplates({}, function (err, opts) {
        equal(opts.templates.length, 0);
        done(err);
      });
    });
  });
});
