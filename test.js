require.paths.push(__dirname + "/lib");

var Handlebars = require("handlebars").Handlebars;

var string = "foo {{ bar ../baz/bat/bam \"baz\" }}baz{{! foo bar baz }}{{#foo}} bar {{^}} baz {{/foo}}{{> partial }}{{# bar }}part1 {{^}} part2{{> foo }}{{/bar}}zomg"
var string = "foo {{#list people}}{{name}}{{/list}}{{#bool}}true: {{name}}{{/bool}}{{#nobool}}false: {{name}}{{/bool}}";

var ast = Handlebars.parse(string);
//require("sys").print(Handlebars.print(ast));
//
var runtime = new Handlebars.Runtime({people: [{name: "Yehuda"}, {name: "Leah"}], bool: true, nobool: false, name: "Yehuda Katz"}, 
  {
    list: function(ctx, fn) {
      var out = "<ul>";
      for(var i=0, l=ctx.length; i<l; i++) {
        out = out + "<li>" + fn(ctx[i]) + "</li>";
      }
      return out + "</ul>";
    },
    helperMissing: function(context, fn) {
      if(context === true) {
        return fn(this);
      } else if(context === false) {
        return "";
      }
    }
  }
)
runtime.accept(ast)
require("sys").print(runtime.buffer)
