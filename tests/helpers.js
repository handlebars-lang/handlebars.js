import { compile, precompile } from "handlebars/compiler/compiler";
import { template as t } from "handlebars/runtime";

var local = window || global;

local.CompilerContext = {
  compile: function(template, options) {
    var templateSpec = precompile(template, options);
    return t(eval('(' + templateSpec + ')'));
  },
  compileWithPartial: function(template, options) {
    return compile(template, options);
  }
};

local.shouldCompileTo = function(string, hashOrArray, expected, message) {
  shouldCompileToWithPartials(string, hashOrArray, false, expected, message);
};

local.shouldCompileToWithPartials = function(string, hashOrArray, partials, expected, message) {
  var result = compileWithPartials(string, hashOrArray, partials);
  result.should.equal(expected, "'" + expected + "' should === '" + result + "': " + message);
};

local.compileWithPartials = function(string, hashOrArray, partials) {
  var template = CompilerContext[partials ? 'compileWithPartial' : 'compile'](string), ary;
  if(Object.prototype.toString.call(hashOrArray) === "[object Array]") {
    ary = [];
    ary.push(hashOrArray[0]);
    ary.push({ helpers: hashOrArray[1], partials: hashOrArray[2] });
  } else {
    ary = [hashOrArray];
  }

  return template.apply(this, ary);
};

local.equals = local.equal = function(a, b, msg) {
  a.should.equal(b, msg || '');
};

