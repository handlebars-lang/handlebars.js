var Handlebars = {};
Handlebars.parse = require("handlebars/compiler").Handlebars.parse;

// BEGIN(BROWSER)
Handlebars.Compiler = function() {};
Handlebars.JavaScriptCompiler = function() {};

(function(Compiler, JavaScriptCompiler) {
  Compiler.OPCODE_MAP = {
    invokeContent: 1,
    getContext: 2,
    lookupWithFallback: 3,
    lookup: 4,
    append: 5,
    invokeMustache: 6,
    escape: 7,
    pushString: 8,
    truthyOrFallback: 9,
    functionOrFallback: 10,
    invokeProgram: 11,
    invokePartial: 12,
    push: 13,
    invokeInverse: 14
  };

  Compiler.MULTI_PARAM_OPCODES = {
    invokeContent: 1,
    getContext: 1,
    lookupWithFallback: 1,
    lookup: 1,
    invokeMustache: 2,
    pushString: 1,
    truthyOrFallback: 1,
    functionOrFallback: 1,
    invokeProgram: 2,
    invokePartial: 1,
    push: 1,
    invokeInverse: 1
  };

  Compiler.DISASSEMBLE_MAP = {}

  for(prop in Compiler.OPCODE_MAP) {
    var value = Compiler.OPCODE_MAP[prop];
    Compiler.DISASSEMBLE_MAP[value] = prop;
  }

  Compiler.multiParamSize = function(code) {
    return Compiler.MULTI_PARAM_OPCODES[Compiler.DISASSEMBLE_MAP[code]];
  };

  Compiler.prototype = {
    disassemble: function() {
      var opcodes = this.opcodes, opcode, nextCode;
      var out = [], str, name, value;

      for(var i=0, l=opcodes.length; i<l; i++) {
        opcode = opcodes[i];

        if(opcode === 'DECLARE') {
          name = opcodes[++i];
          value = opcodes[++i];
          out.push("DECLARE " + name + " = " + value);
        } else {
          str = Compiler.DISASSEMBLE_MAP[opcode];

          var extraParams = Compiler.multiParamSize(opcode);
          var codes = [];

          for(var j=0; j<extraParams; j++) {
            nextCode = opcodes[++i];

            if(typeof nextCode === "string") {
              nextCode = "\"" + nextCode.replace("\n", "\\n") + "\"";
            }

            codes.push(nextCode);
          }

          str = str + " " + codes.join(" ");

          out.push(str);
        }
      }

      return out.join("\n")
    },

    guid: 0,

    compile: function(program) {
      this.children = [];
      this.depths = {list: []};
      return this.program(program);
    },

    accept: function(node) {
      return this[node.type](node);
    },

    program: function(program) {
      var statements = program.statements, statement;
      this.opcodes = [];

      for(var i=0, l=statements.length; i<l; i++) {
        statement = statements[i];
        this[statement.type](statement);
      }

      this.depths.list = this.depths.list.sort(function(a, b) {
        return a - b;
      });

      return this;
    },

    compileProgram: function(program) {
      var result = new Compiler().compile(program);
      var guid = this.guid++;

      this.children[guid] = result;

      for(var i=0, l=result.depths.list.length; i<l; i++) {
        depth = result.depths.list[i];

        if(depth < 2) { continue; }
        else { this.addDepth(depth - 1); }
      }

      return guid;
    },

    block: function(block) {
      var mustache = block.mustache;
      var params = mustache.params, depth, child, inverse;

      this.pushParams(params);

      // ID lookup is now on the stack
      this.ID(mustache.id);

      var programGuid = this.compileProgram(block.program);

      if(block.program.inverse) {
        var inverseGuid = this.compileProgram(block.program.inverse);
      }

      if(block.program.inverse) {
        this.declare('inverse', inverseGuid);
      }

      this.opcode('invokeProgram', programGuid, params.length);
      this.declare('inverse', null);
      this.opcode('append');
    },

    inverse: function(block) {
      this.ID(block.mustache.id);
      var programGuid = this.compileProgram(block.program);

      this.opcode('invokeInverse', programGuid);
      this.opcode('append');
    },

    partial: function(partial) {
      var id = partial.id;

      if(partial.context) {
        this.ID(partial.context);
      } else {
        this.opcode('push', 'context');
      }

      this.opcode('invokePartial', id.original);
      this.opcode('append');
    },

    content: function(content) {
      this.opcode('invokeContent', content.string);
    },

    mustache: function(mustache) {
      var params = mustache.params;

      this.pushParams(params);
      this.ID(mustache.id);

      this.opcode('invokeMustache', params.length, mustache.id.original);

      if(mustache.escaped) { this.opcode('escape') }

      this.opcode('append');
    },

    ID: function(id) {
      this.addDepth(id.depth);

      this.opcode('getContext', id.depth);

      this.opcode('lookupWithFallback', id.parts[0] || null);

      for(var i=1, l=id.parts.length; i<l; i++) {
        this.opcode('lookup', id.parts[i]);
      }
    },

    STRING: function(string) {
      this.opcode('pushString', string.string);
    },

    comment: function() {},

    pushParams: function(params) {
      var i = params.length, param;

      while(i--) {
        param = params[i];
        this[param.type](param);
      }
    },

    opcode: function(name, val1, val2) {
      this.opcodes.push(Compiler.OPCODE_MAP[name]);
      if(val1 !== undefined) { this.opcodes.push(val1); }
      if(val2 !== undefined) { this.opcodes.push(val2); }
    },

    declare: function(name, value) {
      this.opcodes.push('DECLARE');
      this.opcodes.push(name);
      this.opcodes.push(value);
    },

    addDepth: function(depth) {
      if(depth === 0) { return; }

      if(!this.depths[depth]) {
        this.depths[depth] = true;
        this.depths.list.push(depth);
      }
    }
  }

  JavaScriptCompiler.prototype = {
    compile: function(environment) {
      this.preamble();
      this.stackSlot = 0
      this.stackVars = [];
      this.environment = environment;

      this.compileChildren(environment);

      //puts(environment.disassemble());
      //puts("")

      var opcodes = environment.opcodes;
      var opcode, name;
      var declareName, declareVal;

      for(var i=0, l=opcodes.length; i<l; i++) {
        opcode = opcodes[i];

        if(opcode === 'DECLARE') {
          declareName = opcodes[++i];
          declareVal  = opcodes[++i];
          this[declareName] = declareVal;
        } else {
          name = Compiler.DISASSEMBLE_MAP[opcode];

          var extraParams = Compiler.multiParamSize(opcode);
          var codes = [];

          for(var j=0; j<extraParams; j++) {
            codes.push(opcodes[++i]);
          }

          this[name].apply(this, codes);
        }
      }

      return this.createFunction();
    },

    preamble: function() {
      var out = [];
      out.push("var buffer = '';");
      out.push("var currentContext = context, tmp1, tmp2;");
      out.push("helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;");
      out.push("");

      // track the last context pushed into place to allow skipping the
      // getContext opcode when it would be a noop
      this.lastContext = 0;
      this.locals = 3;
      this.source = out;
    },

    createFunction: function() {
      var container = {};

      if(this.stackVars.length > 0) {
        this.source[this.locals] = "var " + this.stackVars.join(", ") + ";";
      }

      this.source.push("return buffer;")

      var params = ["context", "helpers", "partials"];

      for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
        params.push("depth" + this.environment.depths.list[i]);
      }

      params.push(this.source.join("\n"));

      var fn = Function.apply(this, params);
      fn.displayName = "Handlebars.js"

      //puts(fn.toString())
      //puts("")

      container.render = fn;

      container.children = this.environment.children;

      return function(context, helpers, partials, depth) {
        try {
          return container.render.apply(container, arguments)
        } catch(e) {
          throw e;
        }
      }
    },

    invokeContent: function(content) {
      this.source.push("buffer = buffer + " + this.quotedString(content) + ";");
    },

    append: function() {
      var local = this.popStack();
      this.source.push("buffer = buffer + ((" + local + " || " + local + " === 0) ? " + local + " : '');");
    },

    getContext: function(depth) {
      if(this.lastContext !== depth) {
        this.lastContext = depth;

        if(depth === 0) {
          this.source.push("currentContext = context;");
        } else {
          this.source.push("currentContext = depth" + depth + ";");
        }
        // TODO: handle depths other than 0
      }
    },

    nameLookup: function(parent, name) {
      if(JavaScriptCompiler.RESERVED_WORDS[name]) {
        return parent + "['" + name + "']";
      } else {
        return parent + "." + name;
      }
    },

    lookupWithFallback: function(name) {
      if(name) {
        this.pushStack(this.nameLookup('currentContext', name));
        var topStack = this.topStack();
        this.source.push("if(" + topStack + " == null) { " + topStack + " = " + this.nameLookup('helpers', name) + "; }");
      } else {
        this.pushStack("currentContext");
      }
    },

    lookup: function(name) {
      var topStack = this.topStack();
      this.source.push(topStack + " = " + this.nameLookup(topStack, name) + ";");
    },

    pushString: function(string) {
      this.pushStack(this.quotedString(string));
    },

    push: function(name) {
      this.pushStack(name);
    },

    invokeMustache: function(paramSize, original) {
      this.source.push("tmp1 = " + this.popStack() + ";");
      this.source.push("tmp2 = (typeof tmp1 === 'function');");

      var params = ["context"];

      for(var i=0; i<paramSize; i++) {
        params.push(this.popStack());
      }

      var slot = "stack" + ++this.stackSlot;

      var paramString = params.join(", ");
      var helperMissing = ["context"].concat(this.quotedString(original)).concat(params.slice(1));

      if(paramSize === 0) {
        this.source.push("if(tmp2) { " + slot + " = tmp1.call(" + paramString + "); } else { " + slot + " = tmp1; }");
      } else {
        this.source.push("if(tmp2) { " + slot + " = tmp1.call(" + paramString + "); } else { " + slot + " = helpers.helperMissing.call(" + helperMissing + ") }");
      }
    },

    invokeProgram: function(guid, paramSize) {
      var inverse = this.inverse;

      if(inverse != null) {
        var programParams = ["this.children[" + inverse + "]", "helpers", "partials"];

        var depths = this.environment.rawChildren[guid + 1].depths.list;

        for(var i=0, l = depths.length; i<l; i++) {
          depth = depths[i];

          if(depth === 1) { programParams.push("context"); }
          else { programParams.push("depth" + (depth - 1)); }
        }

        this.source.push("tmp2 = Handlebars.VM.program(" + programParams.join(", ") + ");");
      } else {
        this.source.push("tmp2 = Handlebars.VM.noop;");
      }

      var id = this.topStack();
      var fn = this.popStack();

      var params = ["context"];
      var blockMissingParams = ["context", id];

      for(var i=0; i<paramSize; i++) {
        var param = this.popStack();
        params.push(param);
        blockMissingParams.push(param);
      }

      programParams = ["this.children[" + guid + "]", "helpers", "partials"];
      var depths = this.environment.rawChildren[guid].depths.list, depth;

      for(var i=0, l= depths.length; i<l; i++) {
        depth = depths[i];

        if(depth === 1) { programParams.push("context"); }
        else { programParams.push("depth" + (depth - 1)); }
      }

      if(depths.length === 0) {
        this.source.push("tmp1 = Handlebars.VM.program(" + programParams.join(", ") + ")");
      } else {
        this.source.push("tmp1 = Handlebars.VM.programWithDepth(" + programParams.join(", ") + ")");
      }

      params.push("tmp1");
      params.push("tmp2");
      blockMissingParams.push("tmp1");
      blockMissingParams.push("tmp2");

      var nextStack = this.nextStack();

      this.source.push("if(typeof " + id + " === 'function') { " + nextStack + " = " + id + ".call(" + params.join(", ") + "); }")
      this.source.push("else { " + nextStack + " = helpers.blockHelperMissing.call(" + blockMissingParams.join(", ") + "); }");
    },

    invokeInverse: function(guid) {
      var depths = this.environment.rawChildren[guid].depths.list;

      programParams = ["this.children[" + guid + "]", "helpers", "partials"];

      for(var i=0, l = depths.length; i<l; i++) {
        depth = depths[i];

        if(depth === 1) { programParams.push("context"); }
        else { programParams.push("depth" + (depth - 1)); }
      }

      if(depths.length === 0) {
        this.source.push("tmp1 = Handlebars.VM.program(" + programParams.join(", ") + ")");
      } else {
        this.source.push("tmp1 = Handlebars.VM.programWithDepth(" + programParams.join(", ") + ")");
      }

      var blockMissingParams = ["context", this.topStack(), "Handlebars.VM.noop", "tmp1"];
      this.pushStack("helpers.blockHelperMissing.call(" + blockMissingParams.join(", ") + ")");
    },

    invokePartial: function(context) {
      this.pushStack("Handlebars.VM.invokePartial(" + this.nameLookup('partials', context) + ", '" + context + "', " + this.popStack() + ", helpers, partials);");
    },

    escape: function() {
      this.source.push(this.topStack() + " = Handlebars.Utils.escapeExpression(" + this.topStack() + ");");
      // TODO: Escaping
    },

    // HELPERS

    compileChildren: function(environment) {
      var children = environment.children, child, compiler;
      var compiled = [];

      for(var i=0, l=children.length; i<l; i++) {
        child = children[i];
        compiler = new JavaScriptCompiler();

        compiled[i] = compiler.compile(child);
      }

      environment.rawChildren = children;
      environment.children = compiled;
    },

    pushStack: function(item) {
      this.source.push(this.nextStack() + " = " + item + ";");
      return "stack" + this.stackSlot;
    },

    nextStack: function() {
      this.stackSlot++;
      if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
      return "stack" + this.stackSlot;
    },

    popStack: function() {
      return "stack" + this.stackSlot--;
    },

    topStack: function() {
      return "stack" + this.stackSlot;
    },

    quotedString: function(str) {
      return '"' + str
        .replace(/\\/, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r') + '"';
    }
  }

  var reservedWords = ("break case catch continue default delete do else finally " +
                       "for function if in instanceof new return switch this throw " + 
                       "try typeof var void while with null true false").split(" ");

  compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for(var i=0, l=reservedWords.length; i<l; i++) {
    compilerWords[reservedWords[i]] = true;
  }

})(Handlebars.Compiler, Handlebars.JavaScriptCompiler)

Handlebars.VM = {
  programWithDepth: function(fn, helpers, partials, depth) {
    var args = [].slice.call(arguments, 1);
    return function(context) {
      return fn.apply(this, [context].concat(args));
    }
  },
  program: function(fn, helpers, partials) {
    return function(context) {
      return fn(context, helpers, partials);
    }
  },
  noop: function() {},
  compile: function(string) {
    var ast = Handlebars.parse(string);
    var environment = new Handlebars.Compiler().compile(ast);
    return new Handlebars.JavaScriptCompiler().compile(environment);
  },
  invokePartial: function(partial, name, context, helpers, partials) {
    if(partial instanceof Function) {
      return partial(context, helpers, partials)
    } else {
      partials[name] = Handlebars.VM.compile(partial);
      return partials[name](context, helpers, partials);
    }
  }
};
// END(BROWSER)

exports.Compiler = Handlebars.Compiler;
exports.JavaScriptCompiler = Handlebars.JavaScriptCompiler;
exports.VM = Handlebars.VM;
