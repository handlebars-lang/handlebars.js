/*global shouldThrow */


describe('precompiler', function() {
  // NOP Under non-node environments
  if (typeof process === 'undefined') {
    return;
  }

  var Handlebars = require('../lib'),
      Precompiler = require('../lib/precompiler'),
      fs = require('fs'),
      uglify = require('uglify-js');

  var log,
      logFunction,

      precompile,
      minify,

      file,
      content,
      writeFileSync;

  beforeEach(function() {
    precompile = Handlebars.precompile;
    minify = uglify.minify;
    writeFileSync = fs.writeFileSync;

    logFunction = console.log;
    log = '';
    console.log = function() {
      log += Array.prototype.join.call(arguments, '');
    };
    fs.writeFileSync = function(_file, _content) {
      file = _file;
      content = _content;
    };
  });
  afterEach(function() {
    Handlebars.precompile = precompile;
    uglify.minify = minify;
    fs.writeFileSync = writeFileSync;
    console.log = logFunction;
  });

  it('should output version', function() {
    Precompiler.cli({templates: [], version: true});
    equals(log, Handlebars.VERSION);
  });
  it('should throw if lacking templates', function() {
    shouldThrow(function() {
      Precompiler.cli({templates: []});
    }, Handlebars.Exception, 'Must define at least one template or directory.');
  });
  it('should throw on missing template', function() {
    shouldThrow(function() {
      Precompiler.cli({templates: ['foo']});
    }, Handlebars.Exception, 'Unable to open template file "foo"');
  });
  it('should throw when combining simple and minimized', function() {
    shouldThrow(function() {
      Precompiler.cli({templates: [__dirname], simple: true, min: true});
    }, Handlebars.Exception, 'Unable to minimize simple output');
  });
  it('should throw when combining simple and multiple templates', function() {
    shouldThrow(function() {
      Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars', __dirname + '/artifacts/empty.handlebars'], simple: true});
    }, Handlebars.Exception, 'Unable to output multiple templates in simple mode');
  });
  it('should throw when combining simple and directories', function() {
    shouldThrow(function() {
      Precompiler.cli({templates: [__dirname], simple: true});
    }, Handlebars.Exception, 'Unable to output multiple templates in simple mode');
  });
  it('should enumerate directories by extension', function() {
    Precompiler.cli({templates: [__dirname + '/artifacts'], extension: 'hbs'});
    equal(/'example_2'/.test(log), true);
    log = '';

    Precompiler.cli({templates: [__dirname + '/artifacts'], extension: 'handlebars'});
    equal(/'empty'/.test(log), true);
    equal(/'example_1'/.test(log), true);
  });
  it('should protect from regexp patterns', function() {
    Precompiler.cli({templates: [__dirname + '/artifacts'], extension: 'hb(s'});
    // Success is not throwing
  });
  it('should output simple templates', function() {
    Handlebars.precompile = function() { return 'simple'; };
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], simple: true, extension: 'handlebars'});
    equal(log, 'simple\n');
  });
  it('should output amd templates', function() {
    Handlebars.precompile = function() { return 'amd'; };
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], amd: true, extension: 'handlebars'});
    equal(/template\(amd\)/.test(log), true);
  });
  it('should output multiple amd', function() {
    Handlebars.precompile = function() { return 'amd'; };
    Precompiler.cli({templates: [__dirname + '/artifacts'], amd: true, extension: 'handlebars', namespace: 'foo'});
    equal(/templates = foo = foo \|\|/.test(log), true);
    equal(/return templates/.test(log), true);
    equal(/template\(amd\)/.test(log), true);
  });
  it('should output amd partials', function() {
    Handlebars.precompile = function() { return 'amd'; };
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], amd: true, partial: true, extension: 'handlebars'});
    equal(/return Handlebars\.partials\['empty'\]/.test(log), true);
    equal(/template\(amd\)/.test(log), true);
  });
  it('should output multiple amd partials', function() {
    Handlebars.precompile = function() { return 'amd'; };
    Precompiler.cli({templates: [__dirname + '/artifacts'], amd: true, partial: true, extension: 'handlebars'});
    equal(/return Handlebars\.partials\[/.test(log), false);
    equal(/template\(amd\)/.test(log), true);
  });
  it('should output commonjs templates', function() {
    Handlebars.precompile = function() { return 'commonjs'; };
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], commonjs: true, extension: 'handlebars'});
    equal(/template\(commonjs\)/.test(log), true);
  });

  it('should set data flag', function() {
    Handlebars.precompile = function(data, options) { equal(options.data, true); return 'simple'; };
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], simple: true, extension: 'handlebars', data: true});
    equal(log, 'simple\n');
  });

  it('should set known helpers', function() {
    Handlebars.precompile = function(data, options) { equal(options.knownHelpers.foo, true); return 'simple'; };
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], simple: true, extension: 'handlebars', known: 'foo'});
    equal(log, 'simple\n');
  });

  it('should handle different root', function() {
    Handlebars.precompile = function() { return 'simple'; };
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], simple: true, extension: 'handlebars', root: 'foo/'});
    equal(log, 'simple\n');
  });
  it('should output to file system', function() {
    Handlebars.precompile = function() { return 'simple'; };
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], simple: true, extension: 'handlebars', output: 'file!'});
    equal(file, 'file!');
    equal(content, 'simple\n');
    equal(log, '');
  });
  it('should handle BOM', function() {
    Handlebars.precompile = function(template) { return template === 'a' ? 'simple' : 'fail'; };
    Precompiler.cli({templates: [__dirname + '/artifacts/bom.handlebars'], simple: true, extension: 'handlebars', bom: true});
    equal(log, 'simple\n');
  });

  it('should output minimized templates', function() {
    Handlebars.precompile = function() { return 'amd'; };
    uglify.minify = function() { return {code: 'min'}; };
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], min: true, extension: 'handlebars'});
    equal(log, 'min');
  });

  it('should output map', function() {
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], map: 'foo.js.map', extension: 'handlebars'});

    equal(file, 'foo.js.map');
    equal(/sourceMappingURL=/.test(log), true);
  });

  it('should output map', function() {
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], min: true, map: 'foo.js.map', extension: 'handlebars'});

    equal(file, 'foo.js.map');
    equal(/sourceMappingURL=/.test(log), true);
  });
});
