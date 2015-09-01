describe('spec', function() {
  // NOP Under non-node environments
  if (typeof process === 'undefined') {
    return;
  }

  var _ = require('underscore'),
      fs = require('fs');

  var specDir = __dirname + '/mustache/specs/';
  var specs = _.filter(fs.readdirSync(specDir), function(name) {
    return (/.*\.json$/).test(name);
  });

  _.each(specs, function(name) {
    var spec = require(specDir + name);
    _.each(spec.tests, function(test) {
      // Our lambda implementation knowingly deviates from the optional Mustace lambda spec
      // We also do not support alternative delimeters
      if (name === '~lambdas.json'

          // We also choose to throw if paritals are not found
          || (name === 'partials.json' && test.name === 'Failed Lookup')

          // We nest the entire response from partials, not just the literals
          || (name === 'partials.json' && test.name === 'Standalone Indentation')

          || (/\{\{\=/).test(test.template)
          || _.any(test.partials, function(partial) { return (/\{\{\=/).test(partial); })) {
        it.skip(name + ' - ' + test.name);
        return;
      }

      var data = _.clone(test.data);
      if (data.lambda) {
        // Blergh
        /* eslint-disable no-eval */
        data.lambda = eval('(' + data.lambda.js + ')');
        /* eslint-enable no-eval */
      }
      it(name + ' - ' + test.name, function() {
        if (test.partials) {
          shouldCompileToWithPartials(test.template, [data, {}, test.partials, true], true, test.expected, test.desc + ' "' + test.template + '"');
        } else {
          shouldCompileTo(test.template, [data, {}, {}, true], test.expected, test.desc + ' "' + test.template + '"');
        }
      });
    });
  });
});
