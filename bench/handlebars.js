var BenchWarmer = require("./benchwarmer");
Handlebars = require("../lib/handlebars");

var dust, Mustache, eco;

try {
  dust = require("dust");
} catch (err) { /* NOP */ }

try {
  Mustache = require("mustache");
} catch (err) { /* NOP */ }

try {
  var ecoExports = require("eco");
  eco = function(str) {
    return ecoExports(str);
  }
} catch (err) { /* NOP */ }

var benchDetails = {
  string: {
    context: {},
    handlebars: "Hello world",
    dust: "Hello world",
    mustache: "Hello world",
    eco: "Hello world"
  },
  variables: {
    context: {name: "Mick", count: 30},
    handlebars:  "Hello {{name}}! You have {{count}} new messages.",
    dust: "Hello {name}! You have {count} new messages.",
    mustache: "Hello {{name}}! You have {{count}} new messages.",
    eco: "Hello <%= @name %>! You have <%= @count %> new messages."
  },
  object: {
    context:  { person: { name: "Larry", age: 45 } },
    handlebars: "{{#with person}}{{name}}{{age}}{{/with}}",
    dust: "{#person}{name}{age}{/person}",
    mustache: "{{#person}}{{name}}{{age}}{{/person}}"
  },
  array: {
    context:  { names: [{name: "Moe"}, {name: "Larry"}, {name: "Curly"}, {name: "Shemp"}] },
    handlebars: "{{#each names}}{{name}}{{/each}}",
    dust: "{#names}{name}{/names}",
    mustache: "{{#names}}{{name}}{{/names}}",
    eco: "<% for item in @names: %><%= item.name %><% end %>"
  },
  partial: {
    context: { peeps: [{name: "Moe", count: 15}, {name: "Larry", count: 5}, {name: "Curly", count: 1}] },
    partials: {
      mustache: { variables: "Hello {{name}}! You have {{count}} new messages." },
      handlebars: { variables: "Hello {{name}}! You have {{count}} new messages." }
    },
    handlebars: "{{#each peeps}}{{>variables}}{{/each}}",
    dust: "{#peeps}{>variables/}{/peeps}",
    mustache: "{{#peeps}}{{>variables}}{{/peeps}}"
  },
  recursion: {
    context: { name: '1', kids: [{ name: '1.1', kids: [{name: '1.1.1', kids: []}] }] },
    partials: {
      mustache: { recursion: "{{name}}{{#kids}}{{>recursion}}{{/kids}}" },
      handlebars: { recursion: "{{name}}{{#each kids}}{{>recursion}}{{/each}}" }
    },
    handlebars: "{{name}}{{#each kids}}{{>recursion}}{{/each}}",
    dust: "{name}{#kids}{>recursion:./}{/kids}",
    mustache: "{{name}}{{#kids}}{{>recursion}}{{/kids}}"
  },
  complex: {
    handlebars: "<h1>{{header}}</h1>{{#if items}}<ul>{{#each items}}{{#if current}}" +
                "<li><strong>{{name}}</strong></li>{{^}}" +
                "<li><a href=\"{{url}}\">{{name}}</a></li>{{/if}}" +
                "{{/each}}</ul>{{^}}<p>The list is empty.</p>{{/if}}",

    dust:       "<h1>{header}</h1>\n"                             +
                "{?items}\n"                                      +
                "  <ul>\n"                                        +
                "    {#items}\n"                                  +
                "      {#current}\n"                              +
                "        <li><strong>{name}</strong></li>\n"      +
                "      {:else}\n"                                 +
                "        <li><a href=\"{url}\">{name}</a></li>\n" +
                "      {/current}\n"                              +
                "    {/items}\n"                                  +
                "  </ul>\n"                                       +
                "{:else}\n"                                       +
                "  <p>The list is empty.</p>\n"                   +
                "{/items}",
    context: {
               header: function() {
                 return "Colors";
               },
               items: [
                 {name: "red", current: true, url: "#Red"},
                 {name: "green", current: false, url: "#Green"},
                 {name: "blue", current: false, url: "#Blue"}
               ]
             }
  }

};

handlebarsTemplates = {};
ecoTemplates = {};

var warmer = new BenchWarmer();

var makeSuite = function(name) {
  warmer.suite(name, function(bench) {
    var templateName = name;
    var details = benchDetails[templateName];
    var mustachePartials = details.partials && details.partials.mustache;
    var mustacheSource = details.mustache;
    var context = details.context;

    var error = function() { throw new Error("EWOT"); };

    if (dust) {
      bench("dust", function() {
        dust.render(templateName, context, function(err, out) { });
      });
    }

    bench("handlebars", function() {
      handlebarsTemplates[templateName](context);
    });

    if (eco) {
      if(ecoTemplates[templateName]) {
        bench("eco", function() {
          ecoTemplates[templateName](context);
        });
      } else {
        bench("eco", error);
      }
    }

    if (Mustache && mustacheSource) {
      bench("mustache", function() {
        Mustache.to_html(mustacheSource, context, mustachePartials);
      });
    } else {
      bench("mustache", error);
    }
  });
}

for(var name in benchDetails) {
  if(benchDetails.hasOwnProperty(name)) {
    if (dust) {
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
