module base from "./handlebars/base";

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
import SafeString from "./handlebars/safe-string";
import Exception from "./handlebars/exception";
module Utils from "./handlebars/utils";
module runtime from "./handlebars/runtime";

// Compiler imports
module AST from "./handlebars/compiler/ast";
import { parser as Parser, parse } from "./handlebars/compiler/base";
import { Compiler, compile, precompile } from "./handlebars/compiler/compiler";
import JavaScriptCompiler from "./handlebars/compiler/javascript-compiler";

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
var create = function() {
  var hb = {},
      env = new base.HandlebarsEnvironment();

  // support new environments in global namespace mode
  hb.registerHelper = env.registerHelper.bind(env);
  hb.registerPartial = env.registerPartial.bind(env);

  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;

  hb.VM = runtime;
  hb.template = runtime.template;

  hb.compile = function(input, options) {
    options = options || {};
    options.env = options.env || env;
    return compile(input, options);
  };
  hb.precompile = precompile;

  hb.AST = AST;
  hb.Compiler = Compiler;
  hb.JavaScriptCompiler = JavaScriptCompiler;
  hb.Parser = Parser;
  hb.parse = parse;

  return hb;
};

var handlebars = create();
handlebars.create = create;

export default handlebars;
