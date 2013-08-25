var _ = require('underscore'),
    BenchWarmer = require('./util/benchwarmer'),
    templates = require('./templates'),

    eco, dust, Handlebars, Mustache, eco;

try {
  dust = require("dustjs-linkedin");
} catch (err) { /* NOP */ }

try {
  Mustache = require("mustache");
} catch (err) { /* NOP */ }

try {
  eco = require("eco");
} catch (err) { /* NOP */ }

function error() {
  throw new Error("EWOT");
}

function makeSuite(warmer, name, template, handlebarsOnly) {
  warmer.suite(name, function(bench) {
    // Create aliases to minimize any impact from having to walk up the closure tree.
    var templateName = name,

        context = template.context,
        partials = template.partials,

        handlebarsOut,
        dustOut,
        ecoOut,
        mustacheOut;

    var handlebar = Handlebars.compile(template.handlebars, {data: false}),
        options = {helpers: template.helpers};
    _.each(template.partials && template.partials.handlebars, function(partial, name) {
      Handlebars.registerPartial(name, Handlebars.compile(partial, {data: false}));
    });

    handlebarsOut = handlebar(context, options);
    bench("handlebars", function() {
      handlebar(context, options);
    });

    if (handlebarsOnly) {
      return;
    }

    if (dust) {
      if (template.dust) {
        dustOut = false;
        dust.loadSource(dust.compile(template.dust, templateName));

        dust.render(templateName, context, function(err, out) { dustOut = out; });

        bench("dust", function() {
          dust.render(templateName, context, function(err, out) { });
        });
      } else {
        bench('dust', error);
      }
    }

    if (eco) {
      if (template.eco) {
        var ecoTemplate = eco.compile(template.eco);

        ecoOut = ecoTemplate(context);

        bench("eco", function() {
          ecoTemplate(context);
        });
      } else {
        bench("eco", error);
      }
    }

    if (Mustache) {
      var mustacheSource = template.mustache,
          mustachePartials = partials && partials.mustache;

      if (mustacheSource) {
        mustacheOut = Mustache.to_html(mustacheSource, context, mustachePartials);

        bench("mustache", function() {
          Mustache.to_html(mustacheSource, context, mustachePartials);
        });
      } else {
        bench("mustache", error);
      }
    }

    // Hack around whitespace until we have whitespace control
    handlebarsOut = handlebarsOut.replace(/\s/g, '');
    function compare(b, lang) {
      if (b == null) {
        return;
      }

      b = b.replace(/\s/g, '');

      if (handlebarsOut !== b) {
        throw new Error('Template output mismatch: ' + name
              + '\n\nHandlebars: ' + handlebarsOut
              + '\n\n' + lang + ': ' + b);
      }
    }

    compare(dustOut, 'dust');
    compare(ecoOut, 'eco');
    compare(mustacheOut, 'mustache');
  });
}

module.exports = function(grunt, callback) {
  // Deferring load incase we are being run inline with the grunt build
  Handlebars = require('../lib/handlebars');

  var warmer = new BenchWarmer();

  var handlebarsOnly = grunt.option('handlebars-only'),
      grep = grunt.option('grep');
  if (grep) {
    grep = new RegExp(grep);
  }

  _.each(templates, function(template, name) {
    if (!template.handlebars || (grep && !grep.test(name))) {
      return;
    }

    makeSuite(warmer, name, template, handlebarsOnly);
  });

  warmer.bench(function() {
    callback && callback(warmer.times);
  });
};
