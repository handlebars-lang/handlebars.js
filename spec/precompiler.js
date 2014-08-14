/*global shouldThrow */

describe('precompiler', function() {
  // NOP Under non-node environments
  if (typeof process === 'undefined') {
    return;
  }

  var Handlebars = require('../lib'),
      Precompiler = require('../lib/precompiler');

  var log,
      logFunction,

      precompile;

  beforeEach(function() {
    precompile = Handlebars.precompile;
    logFunction = console.log;
    log = '';
    console.log = function() {
      log += Array.prototype.join.call(arguments, '');
    };
  });
  afterEach(function() {
    Handlebars.precompile = precompile;
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
    }, Handlebars.Exception, 'Unable to minimze simple output');
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
  it('should output commonjs templates', function() {
    Handlebars.precompile = function() { return 'commonjs'; };
    Precompiler.cli({templates: [__dirname + '/artifacts/empty.handlebars'], commonjs: true, extension: 'handlebars'});
    equal(/template\(commonjs\)/.test(log), true);
  });
});
