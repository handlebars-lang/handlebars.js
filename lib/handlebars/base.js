/*jshint eqnull: true */

import { Exception, extend } from "handlebars/utils";

var K = function() { return this; };

export VERSION = "1.0.0";
export COMPILER_REVISION = 4;

export REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};

// TODO: Make this a class
export function base(helpers, partials) {

  var exports = {};


  helpers = helpers || {};
  partials = partials || {};

  var toString = Object.prototype.toString,
      functionType = '[object Function]',
      objectType = '[object Object]';

  exports.registerHelper(name, fn, inverse) {
    if (toString.call(name) === objectType) {
      if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
      extend(helpers, name);
    } else {
      if (inverse) { fn.not = inverse; }
      helpers[name] = fn;
    }
  };

  exports.registerPartial(name, str) {
    if (toString.call(name) === objectType) {
      extend(partials,  name);
    } else {
      partials[name] = str;
    }
  };

  exports.registerHelper('helperMissing', function(arg) {
    if(arguments.length === 2) {
      return undefined;
    } else {
      throw new Error("Missing helper: '" + arg + "'");
    }
  });

  exports.registerHelper('blockHelperMissing', function(context, options) {
    var inverse = options.inverse || function() {}, fn = options.fn;

    var type = toString.call(context);

    if(type === functionType) { context = context.call(this); }

    if(context === true) {
      return fn(this);
    } else if(context === false || context == null) {
      return inverse(this);
    } else if(type === "[object Array]") {
      if(context.length > 0) {
        return Handlebars.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      return fn(context);
    }
  });

  exports.registerHelper('each', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var i = 0, ret = "", data;

    var type = toString.call(context);
    if(type === functionType) { context = context.call(this); }

    if (options.data) {
      data = Handlebars.createFrame(options.data);
    }

    if(context && typeof context === 'object') {
      if(context instanceof Array){
        for(var j = context.length; i<j; i++) {
          if (data) { data.index = i; }
          ret = ret + fn(context[i], { data: data });
        }
      } else {
        for(var key in context) {
          if(context.hasOwnProperty(key)) {
            if(data) { data.key = key; }
            ret = ret + fn(context[key], {data: data});
            i++;
          }
        }
      }
    }

    if(i === 0){
      ret = inverse(this);
    }

    return ret;
  });

  exports.registerHelper('if', function(conditional, options) {
    var type = toString.call(conditional);
    if(type === functionType) { conditional = conditional.call(this); }

    if(!conditional || Handlebars.Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  exports.registerHelper('unless', function(conditional, options) {
    return Handlebars.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn});
  });

  exports.registerHelper('with', function(context, options) {
    var type = toString.call(context);
    if(type === functionType) { context = context.call(this); }

    if (!Handlebars.Utils.isEmpty(context)) return options.fn(context);
  });

  exports.registerHelper('log', function(context, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    Handlebars.log(level, context);
  });

  return Handlebars;
}

var levels = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3
}

var methodMap = { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' };

export logger = {
  // can be overridden in the host environment
  log: function(level, obj) {
    if (Handlebars.logger.level <= level) {
      var method = Handlebars.logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};

export function log(level, obj) { logger.log(level, obj); };

export createFrame = Object.create || function(object) {
  K.prototype = object;
  var obj = new K();
  K.prototype = null;
  return obj;
};
