import { HandlebarsEnvironment, createFrame, logger, log } from "./handlebars/base";

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
import { SafeString, Exception, extend, escapeExpression, isEmpty } from "./handlebars/utils";
import { compile, precompile } from "./handlebars/compiler/compiler";
import { template } from "./handlebars/runtime";

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
var create = function() {
  var hb = {},
      env = new HandlebarsEnvironment();

  // support new environments in global namespace mode
  hb.HandlebarsEnvironment = HandlebarsEnvironment;

  hb.registerHelper = env.registerHelper.bind(env);
  hb.registerPartial = env.registerPartial.bind(env);

  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = { extend: extend, escapeExpression: escapeExpression, isEmpty: isEmpty };
  hb.compile = function(input, options) {
    options = options || {};
    options.env = options.env || env;
    return compile(input, options);
  };
  hb.precompile = precompile;
  hb.template = template;
  hb.createFrame = createFrame;

  hb.log = log;
  hb.logger = logger;

  return hb;
};

var Handlebars = create();
Handlebars.create = create;

export default Handlebars;

// Publish a Node.js require() handler for .handlebars and .hbs files
if (typeof require !== 'undefined' && require.extensions) {
  var extension = function(module, filename) {
    var fs = require("fs");
    var templateString = fs.readFileSync(filename, "utf8");
    module.exports = Handlebars.compile(templateString);
  };
  require.extensions[".handlebars"] = extension;
  require.extensions[".hbs"] = extension;
}

// USAGE:
// var handlebars = require('handlebars');

// var singleton = handlebars.Handlebars,
//  local = handlebars.create();
