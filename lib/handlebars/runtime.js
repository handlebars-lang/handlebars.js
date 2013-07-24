import { escapeExpression, extend, Exception } from "./utils";
import { COMPILER_REVISION, REVISION_CHANGES } from "./base";

// TODO: Remove this line and break up compilePartial

export function template(templateSpec, Hbars) {
  // TODO: Make this less global
  Hbars = Hbars || Handlebars;

  if (Hbars.compile) {
    var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
      var result = invokePartial.apply(this, arguments);
      if (result) { return result; }

      var options = { helpers: helpers, partials: partials, data: data };
      partials[name] = Hbars.compile(partial, { data: data !== undefined });
      return partials[name](context, options);
    };
  } else {
    var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
      var result = invokePartial.apply(this, arguments);
      if (result) { return result; }
      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    };
  }

  // Just add water
  var container = {
    escapeExpression: escapeExpression,
    invokePartial: invokePartialWrapper,
    programs: [],
    program: function(i, fn, data) {
      var programWrapper = this.programs[i];
      if(data) {
        programWrapper = program(i, fn, data);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = program(i, fn);
      }
      return programWrapper;
    },
    merge: function(param, common) {
      var ret = param || common;

      if (param && common) {
        ret = {};
        extend(ret, common);
        extend(ret, param);
      }
      return ret;
    },
    programWithDepth: programWithDepth,
    noop: noop,
    compilerInfo: null
  };

  return function(context, options) {
    options = options || {};

    Hbars = Hbars || require("handlebars");

    // TODO: Why does templateSpec require a reference to the global Handlebars?
    var result = templateSpec.call(container, Hbars, context, options.helpers, options.partials, options.data);

    var compilerInfo = container.compilerInfo || [],
        compilerRevision = compilerInfo[0] || 1,
        currentRevision = COMPILER_REVISION;

    if (compilerRevision !== currentRevision) {
      if (compilerRevision < currentRevision) {
        var runtimeVersions = REVISION_CHANGES[currentRevision],
            compilerVersions = REVISION_CHANGES[compilerRevision];
        throw "Template was precompiled with an older version of Handlebars than the current runtime. "+
              "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").";
      } else {
        // Use the embedded version info since the runtime doesn't know about this revision yet
        throw "Template was precompiled with a newer version of Handlebars than the current runtime. "+
              "Please update your runtime to a newer version ("+compilerInfo[1]+").";
      }
    }

    return result;
  };
}

export function programWithDepth(i, fn, data /*, $depth */) {
  var args = Array.prototype.slice.call(arguments, 3);

  var program = function(context, options) {
    options = options || {};

    return fn.apply(this, [context, options.data || data].concat(args));
  };
  program.program = i;
  program.depth = args.length;
  return program;
}

export function program(i, fn, data) {
  var program = function(context, options) {
    options = options || {};

    return fn(context, options.data || data);
  };
  program.program = i;
  program.depth = 0;
  return program;
}

export function invokePartial(partial, name, context, helpers, partials, data) {
  var options = { helpers: helpers, partials: partials, data: data };

  if(partial === undefined) {
    throw new Exception("The partial " + name + " could not be found");
  } else if(partial instanceof Function) {
    return partial(context, options);
  }
}

export function noop() { return ""; }
