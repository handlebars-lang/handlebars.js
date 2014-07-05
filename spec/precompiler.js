/*global shouldThrow */

describe('precompiler', function() {
  // NOP Under non-node environments
  if (typeof process === 'undefined') {
    return;
  }

  var Handlebars = require('../lib'),
      Precompiler = require('../lib/precompiler');

  var log,
      logFunction;

  beforeEach(function() {
    logFunction = console.log;
    log = '';
    console.log = function() {
      log += Array.prototype.join.call(arguments, '');
    };
  });
  afterEach(function() {
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
});
