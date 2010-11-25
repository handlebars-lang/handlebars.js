require.paths.push(__dirname + "/lib");

var Handlebars = require("handlebars").Handlebars;

var string = "foo {{ bar baz \"baz\" }}baz{{! foo bar baz }}{{#foo}} bar {{^}} baz {{/foo}}{{> partial }}{{# bar }}part1 {{^}} part2{{> foo }}{{/bar}}zomg"

var ast = Handlebars.parse(string);
Handlebars.print(ast);
