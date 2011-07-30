var Handlebars = require("./base");

// BEGIN(BROWSER)
Handlebars.VM = {
  template: function(templateSpec) {
    // Setup all children
    for (var i = 0, len = templateSpec.children.length; i < len; i++) {
      templateSpec.children[i] = Handlebars.VM.template(templateSpec.children[i]);
    }

    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, helpers, partials, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(this.children[i], helpers, partials, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(this.children[i], helpers, partials);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop
    };
    container.render = templateSpec.fn;
    container.children = templateSpec.children;

    return function(context, options, $depth) {
      options = options || {};
      var args = [Handlebars, context, options.helpers, options.partials, options.data];
      var depth = Array.prototype.slice.call(arguments, 2);
      args = args.concat(depth);
      return container.render.apply(container, args);
    };
  },

  programWithDepth: function(fn, helpers, partials, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 4);

    return function(context, options) {
      options = options || {};

      options = {
        helpers: options.helpers || helpers,
        partials: options.partials || partials,
        data: options.data || data
      };

      return fn.apply(this, [context, options].concat(args));
    };
  },
  program: function(fn, helpers, partials, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, {
        helpers: options.helpers || helpers,
        partials: options.partials || partials,
        data: options.data || data
      });
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials) {
    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, {helpers: helpers, partials: partials});
    } else if (false && !Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in vm mode");
    } else {
      partials[name] = Handlebars.compile(partial);
      return partials[name](context, {helpers: helpers, partials: partials});
    }
  }
};

Handlebars.template = Handlebars.VM.template;

// END(BROWSER)

