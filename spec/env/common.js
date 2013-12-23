global.shouldCompileTo = function(string, hashOrArray, expected, message) {
  shouldCompileToWithPartials(string, hashOrArray, false, expected, message);
};

global.shouldCompileToWithPartials = function(string, hashOrArray, partials, expected, message) {
  var result = compileWithPartials(string, hashOrArray, partials);
  if (result !== expected) {
    throw new Error("'" + expected + "' should === '" + result + "': " + message);
  }
};

global.compileWithPartials = function(string, hashOrArray, partials) {
  var template = CompilerContext[partials ? 'compileWithPartial' : 'compile'](string), ary;
  if(Object.prototype.toString.call(hashOrArray) === "[object Array]") {
    ary = [];
    ary.push(hashOrArray[0]);
    ary.push({ helpers: hashOrArray[1], partials: hashOrArray[2] });
  } else {
    ary = [hashOrArray];
  }

  return template.apply(this, ary);
};


global.equals = global.equal = function(a, b, msg) {
  if (a !== b) {
    throw new Error("'" + b + "' should === '" + a + "'" + (msg ? ": " + msg : ''));
  }
};

global.shouldThrow = function(callback, type, msg) {
  var failed;
  try {
    callback();
    failed = true;
  } catch (err) {
    if (type && !(err instanceof type)) {
      throw new Error('Type failure');
    }
    if (msg && !(msg.test ? msg.test(err.message) : msg === err.message)) {
      throw new Error('Message failure');
    }
  }
  if (failed) {
    throw new Error('It failed to throw');
  }
};
