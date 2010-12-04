if(exports) {
  require.paths.push("lib");
  var Handlebars = require("handlebars").Handlebars;

  if(require("sys")) {
    var print = function(val) {
      require("sys").print(val + "\n")
    }
  }
}

var string = "foo {{ bar ../baz/bat/bam \"baz\" }}baz{{! foo bar baz }}{{#foo}} bar {{^}} baz {{/foo}}{{> partial }}{{# bar }}part1 {{^}} part2{{> foo }}{{/bar}}zomg"
var string = "foo {{#list people}}{{name}}{{/list}}{{#bool}}true: {{name}}{{/bool}}{{#nobool}}false: {{name}}{{/nobool}}";


var helperMissing = function(context, fn) {
  var ret = "";

  if(context === true) {
    return fn(this);
  } else if(context === false) {
    return "";
  } else if(Object.prototype.toString.call(context) === "[object Array]") {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(context[i]);
    }
    return ret;
  } else {
		return fn(context);
	}
};

var context = {people: [{name: "Yehuda"}, {name: "Leah"}], bool: true, nobool: false, name: "Yehuda Katz"};
var fallback =
  {
    list: function(ctx, fn) {
      var out = "<ul>";
      for(var i=0, l=ctx.length; i<l; i++) {
        out = out + "<li>" + fn(ctx[i]) + "</li>";
      }
      return out + "</ul>";
    },
    helperMissing: helperMissing
  };

var compiled = Handlebars.compile(string);

var result;

var time = new Date;

for(var i=0; i<10000; i++) {
  result = compiled(context, fallback);
}
print(new Date - time)
print(result)
