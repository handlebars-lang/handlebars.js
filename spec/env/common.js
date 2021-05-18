var global = (function() { return this; }());

var AssertError;
if (Error.captureStackTrace) {
  AssertError = function AssertError(message, caller) {
    Error.prototype.constructor.call(this, message);
    this.message = message;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, caller || AssertError);
    }
  };

  AssertError.prototype = new Error();
} else {
  AssertError = Error;
}

global.shouldCompileTo = function(string, hashOrArray, expected, message) {
  shouldCompileToWithPartials(string, hashOrArray, false, expected, message);
};

global.shouldCompileToWithPartials = function(string, hashOrArray, partials, expected, message) {
  var result = compileWithPartials(string, hashOrArray, partials);
  if (result !== expected) {
    throw new Error("'" + result + "' should === '" + expected + "': " + message);
  }
};

global.compileWithPartials = function(string, hashOrArray, partials) {
  var template,
      ary,
      options;
  if (Object.prototype.toString.call(hashOrArray) === '[object Array]') {
    ary = [];
    ary.push(hashOrArray[0]);
    ary.push({ helpers: hashOrArray[1], partials: hashOrArray[2] });
    options = typeof hashOrArray[3] === 'object' ? hashOrArray[3] : {compat: hashOrArray[3]};
    if (hashOrArray[4] != null) {
      options.data = !!hashOrArray[4];
      ary[1].data = hashOrArray[4];
    }
  } else {
    ary = [hashOrArray];
  }

  template = CompilerContext[partials ? 'compileWithPartial' : 'compile'](string, options);
  return template.apply(this, ary);
};


global.equals = global.equal = function(a, b, msg) {
  if (a !== b) {
    throw new Error("'" + a + "' should === '" + b + "'" + (msg ? ': ' + msg : ''));
  }
};

global.shouldThrow = function(callback, type, msg) {
  var failed;
  try {
    callback();
    failed = true;
  } catch (err) {
    if (type && !(err instanceof type)) {
      throw new Error('Type failure: ' + err);
    }
    if (msg && !(msg.test ? msg.test(err.message) : msg === err.message)) {
      equal(msg, err.message);
    }
  }
  if (failed) {
    throw new Error('It failed to throw');
  }
};


global.expectTemplate = function(templateAsString) {
  return new HandlebarsTestBench(templateAsString);
};

function HandlebarsTestBench(templateAsString) {
  this.templateAsString = templateAsString;
  this.helpers = {};
  this.partials = {};
  this.decorators = {};
  this.input = {};
  this.message =
    'Template' + templateAsString + ' does not evaluate to expected output';
  this.compileOptions = {};
  this.runtimeOptions = {};
}

HandlebarsTestBench.prototype.withInput = function(input) {
  this.input = input;
  return this;
};

HandlebarsTestBench.prototype.withHelper = function(name, helperFunction) {
  this.helpers[name] = helperFunction;
  return this;
};

HandlebarsTestBench.prototype.withHelpers = function(helperFunctions) {
  var self = this;
  Object.keys(helperFunctions).forEach(function(name) {
    self.withHelper(name, helperFunctions[name]);
  });
  return this;
};

HandlebarsTestBench.prototype.withPartial = function(name, partialAsString) {
  this.partials[name] = partialAsString;
  return this;
};

HandlebarsTestBench.prototype.withPartials = function(partials) {
  var self = this;
  Object.keys(partials).forEach(function(name) {
    self.withPartial(name, partials[name]);
  });
  return this;
};

HandlebarsTestBench.prototype.withDecorator = function(
  name,
  decoratorFunction
) {
  this.decorators[name] = decoratorFunction;
  return this;
};

HandlebarsTestBench.prototype.withDecorators = function(decorators) {
  var self = this;
  Object.keys(decorators).forEach(function(name) {
    self.withDecorator(name, decorators[name]);
  });
  return this;
};

HandlebarsTestBench.prototype.withCompileOptions = function(compileOptions) {
  this.compileOptions = compileOptions;
  return this;
};

HandlebarsTestBench.prototype.withRuntimeOptions = function(runtimeOptions) {
  this.runtimeOptions = runtimeOptions;
  return this;
};

HandlebarsTestBench.prototype.withMessage = function(message) {
  this.message = message;
  return this;
};

HandlebarsTestBench.prototype.toCompileTo = function(expectedOutputAsString) {
  expect(this._compileAndExecute()).to.equal(
    expectedOutputAsString,
    this.message
  );
};

// see chai "to.throw" (https://www.chaijs.com/api/bdd/#method_throw)
HandlebarsTestBench.prototype.toThrow = function(errorLike, errMsgMatcher) {
  var self = this;
  expect(function() {
    self._compileAndExecute();
  }).to.throw(errorLike, errMsgMatcher, this.message);
};

HandlebarsTestBench.prototype._compileAndExecute = function() {
  var compile =
    Object.keys(this.partials).length > 0
      ? CompilerContext.compileWithPartial
      : CompilerContext.compile;

  var combinedRuntimeOptions = this._combineRuntimeOptions();

  var template = compile(this.templateAsString, this.compileOptions);
  return template(this.input, combinedRuntimeOptions);
};

HandlebarsTestBench.prototype._combineRuntimeOptions = function() {
  var self = this;
  var combinedRuntimeOptions = {};
  Object.keys(this.runtimeOptions).forEach(function(key) {
    combinedRuntimeOptions[key] = self.runtimeOptions[key];
  });
  combinedRuntimeOptions.helpers = this.helpers;
  combinedRuntimeOptions.partials = this.partials;
  combinedRuntimeOptions.decorators = this.decorators;
  return combinedRuntimeOptions;
};
