var BenchWarmer = require("./util/benchwarmer");
Handlebars = require("../lib/handlebars");

var dust, Mustache, eco;

try {
  dust = require("dustjs-linkedin");
} catch (err) { /* NOP */ }

try {
  Mustache = require("mustache");
} catch (err) { /* NOP */ }

try {
  var ecoExports = require("eco");
  eco = function(str) {
    return ecoExports(str);
  };
} catch (err) { /* NOP */ }

var benchDetails = require('./templates');

var handlebarsTemplates = {},
    ecoTemplates = {};

var warmer = new BenchWarmer();

function makeSuite(name) {
  warmer.suite(name, function(bench) {
    var templateName = name;
    var details = benchDetails[templateName];
    var mustachePartials = details.partials && details.partials.mustache;
    var mustacheSource = details.mustache;
    var context = details.context;
    var options = {helpers: details.helpers};

    var error = function() { throw new Error("EWOT"); };

    bench("handlebars", function() {
      handlebarsTemplates[templateName](context, options);
    });

    if (dust) {
      if (details.dust) {
        bench("dust", function() {
          dust.render(templateName, context, function(err, out) { });
        });
      } else {
        bench('dust', error);
      }
    }

    if (eco) {
      if(ecoTemplates[templateName]) {
        bench("eco", function() {
          ecoTemplates[templateName](context);
        });
      } else {
        bench("eco", error);
      }
    }

    if (Mustache) {
      if (mustacheSource) {
        bench("mustache", function() {
          Mustache.to_html(mustacheSource, context, mustachePartials);
        });
      } else {
        bench("mustache", error);
      }
    }
  });
}

for(var name in benchDetails) {
  if(benchDetails.hasOwnProperty(name)) {
    if (!benchDetails[name].handlebars) {
      continue;
    }

    if (dust && benchDetails[name].dust) {
      dust.loadSource(dust.compile(benchDetails[name].dust, name));
    }

    handlebarsTemplates[name] = Handlebars.compile(benchDetails[name].handlebars);

    if (eco && benchDetails[name].eco) {
      ecoTemplates[name] = eco(benchDetails[name].eco);
    }

    var partials = benchDetails[name].partials;
    if(partials) {
      for(var partialName in partials.handlebars) {
        if(partials.handlebars.hasOwnProperty(partialName)) {
          Handlebars.registerPartial(partialName, partials.handlebars[partialName]);
        }
      }
    }

    makeSuite(name);
  }
}

warmer.bench();
