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

global.shouldCompileToWithPartials = function shouldCompileToWithPartials(string, hashOrArray, partials, expected, message) {
  var result = compileWithPartials(string, hashOrArray, partials);
  if (result !== expected) {
    throw new AssertError("'" + result + "' should === '" + expected + "': " + message, shouldCompileToWithPartials);
  }
};

global.compileWithPartials = function(string, hashOrArray, partials) {
  var template,
      ary,
      options;
  if (hashOrArray && hashOrArray.hash) {
    ary = [hashOrArray.hash, hashOrArray];
    delete hashOrArray.hash;
  } else if (Object.prototype.toString.call(hashOrArray) === '[object Array]') {
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


global.equals = global.equal = function equals(a, b, msg) {
  if (a !== b) {
    throw new AssertError("'" + a + "' should === '" + b + "'" + (msg ? ': ' + msg : ''), equals);
  }
};

global.shouldThrow = function(callback, type, msg) {
  var failed;
  try {
    callback();
    failed = true;
  } catch (caught) {
    if (type && !(caught instanceof type)) {
      throw new AssertError('Type failure: ' + caught);
    }
    if (msg && !(msg.test ? msg.test(caught.message) : msg === caught.message)) {
      throw new AssertError('Throw mismatch: Expected ' + caught.message + ' to match ' + msg + '\n\n' + caught.stack, shouldThrow);
    }
  }
  if (failed) {
    throw new AssertError('It failed to throw', shouldThrow);
  }
};
