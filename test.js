require.paths.push(__dirname + "/lib");

var Handlebars = require("handlebars").Handlebars;

var string = "foo {{ bar ../baz/bat/bam \"baz\" }}baz{{! foo bar baz }}{{#foo}} bar {{^}} baz {{/foo}}{{> partial }}{{# bar }}part1 {{^}} part2{{> foo }}{{/bar}}zomg"
var string = "foo {{person/name/0}} '{{ join person/name \", \" }}' baz";

var ast = Handlebars.parse(string);
//require("sys").print(Handlebars.print(ast));
//
var runtime = new Handlebars.Runtime({person: {name: ["Katz", "Yehuda"]}}, {join: function(name, sep) { return name.join(sep); }})
runtime.accept(ast)
require("sys").print(runtime.buffer)
