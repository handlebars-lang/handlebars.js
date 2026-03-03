var global = globalThis;

global.expectTemplate = function (templateAsString) {
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

HandlebarsTestBench.prototype.withInput = function (input) {
  this.input = input;
  return this;
};

HandlebarsTestBench.prototype.withHelper = function (name, helperFunction) {
  this.helpers[name] = helperFunction;
  return this;
};

HandlebarsTestBench.prototype.withHelpers = function (helperFunctions) {
  var self = this;
  Object.keys(helperFunctions).forEach(function (name) {
    self.withHelper(name, helperFunctions[name]);
  });
  return this;
};

HandlebarsTestBench.prototype.withPartial = function (name, partialAsString) {
  this.partials[name] = partialAsString;
  return this;
};

HandlebarsTestBench.prototype.withPartials = function (partials) {
  var self = this;
  Object.keys(partials).forEach(function (name) {
    self.withPartial(name, partials[name]);
  });
  return this;
};

HandlebarsTestBench.prototype.withDecorator = function (
  name,
  decoratorFunction
) {
  this.decorators[name] = decoratorFunction;
  return this;
};

HandlebarsTestBench.prototype.withDecorators = function (decorators) {
  var self = this;
  Object.keys(decorators).forEach(function (name) {
    self.withDecorator(name, decorators[name]);
  });
  return this;
};

HandlebarsTestBench.prototype.withCompileOptions = function (compileOptions) {
  this.compileOptions = compileOptions;
  return this;
};

HandlebarsTestBench.prototype.withRuntimeOptions = function (runtimeOptions) {
  this.runtimeOptions = runtimeOptions;
  return this;
};

HandlebarsTestBench.prototype.withMessage = function (message) {
  this.message = message;
  return this;
};

HandlebarsTestBench.prototype.toCompileTo = function (expectedOutputAsString) {
  expect(this._compileAndExecute()).toBe(expectedOutputAsString);
};

HandlebarsTestBench.prototype.toThrow = function (errorLike, errMsgMatcher) {
  var self = this;
  var caught;
  try {
    self._compileAndExecute();
  } catch (e) {
    caught = e;
  }

  expect(caught).toBeDefined();

  if (typeof errorLike === 'function') {
    expect(caught).toBeInstanceOf(errorLike);
    if (errMsgMatcher) {
      expect(caught.message).toMatch(errMsgMatcher);
    }
  } else if (errorLike) {
    // errorLike is a string or regex message matcher (single-argument form)
    expect(caught.message).toMatch(errorLike);
  }
};

HandlebarsTestBench.prototype._compileAndExecute = function () {
  var compile =
    Object.keys(this.partials).length > 0
      ? CompilerContext.compileWithPartial
      : CompilerContext.compile;

  var combinedRuntimeOptions = this._combineRuntimeOptions();

  var template = compile(this.templateAsString, this.compileOptions);
  return template(this.input, combinedRuntimeOptions);
};

HandlebarsTestBench.prototype._combineRuntimeOptions = function () {
  var self = this;
  var combinedRuntimeOptions = {};
  Object.keys(this.runtimeOptions).forEach(function (key) {
    combinedRuntimeOptions[key] = self.runtimeOptions[key];
  });
  combinedRuntimeOptions.helpers = this.helpers;
  combinedRuntimeOptions.partials = this.partials;
  combinedRuntimeOptions.decorators = this.decorators;
  return combinedRuntimeOptions;
};

beforeEach(function () {
  global.handlebarsEnv = Handlebars.create();
});
