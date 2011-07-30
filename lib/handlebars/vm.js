var Handlebars = require("./base");

// BEGIN(BROWSER)
Handlebars.VM = {
  generateContainer: function(template) {
    // Setup all children
    for (var i = 0, len = template.children.length; i < len; i++) {
      template.children[i] = this.generateContainer(template.children[i]);
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
    container.render = template.fn;
    container.children = template.children;

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
  compile: function(string, options) {
    var ast = Handlebars.parse(string);
    var environment = new Handlebars.Compiler().compile(ast, options);
    // Yes this is evil. Work in progress for the best way to handle runtime comp vs. cached comp.
    var logic = eval('(' + new Handlebars.JavaScriptCompiler().compile(environment, options) + ')');
    return Handlebars.VM.generateContainer(logic);
  },
  invokePartial: function(partial, name, context, helpers, partials) {
    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, {helpers: helpers, partials: partials});
    } else {
      partials[name] = Handlebars.VM.compile(partial);
      return partials[name](context, {helpers: helpers, partials: partials});
    }
  }
};

Handlebars.compile = Handlebars.VM.compile;
// END(BROWSER)

