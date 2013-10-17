(function(e){if("function"==typeof bootstrap)bootstrap("should",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeShould=e}else"undefined"!=typeof window?window.should=e():global.should=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Taken from node's assert module, because it sucks
// and exposes next to nothing useful.
var util = require('./util');

module.exports = _deepEqual;

var pSlice = Array.prototype.slice;

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}


function objEquiv (a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (util.isArguments(a)) {
    if (!util.isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try{
    var ka = Object.keys(a),
      kb = Object.keys(b),
      key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

},{"./util":4}],2:[function(require,module,exports){
//copy of node http module status codes
//https://github.com/joyent/node/blob/master/lib/_http_server.js

var STATUS_CODES = exports.STATUS_CODES = {
  100 : 'Continue',
  101 : 'Switching Protocols',
  102 : 'Processing',                 // RFC 2518, obsoleted by RFC 4918
  200 : 'OK',
  201 : 'Created',
  202 : 'Accepted',
  203 : 'Non-Authoritative Information',
  204 : 'No Content',
  205 : 'Reset Content',
  206 : 'Partial Content',
  207 : 'Multi-Status',               // RFC 4918
  300 : 'Multiple Choices',
  301 : 'Moved Permanently',
  302 : 'Moved Temporarily',
  303 : 'See Other',
  304 : 'Not Modified',
  305 : 'Use Proxy',
  307 : 'Temporary Redirect',
  400 : 'Bad Request',
  401 : 'Unauthorized',
  402 : 'Payment Required',
  403 : 'Forbidden',
  404 : 'Not Found',
  405 : 'Method Not Allowed',
  406 : 'Not Acceptable',
  407 : 'Proxy Authentication Required',
  408 : 'Request Time-out',
  409 : 'Conflict',
  410 : 'Gone',
  411 : 'Length Required',
  412 : 'Precondition Failed',
  413 : 'Request Entity Too Large',
  414 : 'Request-URI Too Large',
  415 : 'Unsupported Media Type',
  416 : 'Requested Range Not Satisfiable',
  417 : 'Expectation Failed',
  418 : 'I\'m a teapot',              // RFC 2324
  422 : 'Unprocessable Entity',       // RFC 4918
  423 : 'Locked',                     // RFC 4918
  424 : 'Failed Dependency',          // RFC 4918
  425 : 'Unordered Collection',       // RFC 4918
  426 : 'Upgrade Required',           // RFC 2817
  428 : 'Precondition Required',      // RFC 6585
  429 : 'Too Many Requests',          // RFC 6585
  431 : 'Request Header Fields Too Large',// RFC 6585
  500 : 'Internal Server Error',
  501 : 'Not Implemented',
  502 : 'Bad Gateway',
  503 : 'Service Unavailable',
  504 : 'Gateway Time-out',
  505 : 'HTTP Version Not Supported',
  506 : 'Variant Also Negotiates',    // RFC 2295
  507 : 'Insufficient Storage',       // RFC 4918
  509 : 'Bandwidth Limit Exceeded',
  510 : 'Not Extended',               // RFC 2774
  511 : 'Network Authentication Required' // RFC 6585
};

module.exports.STATUS_CODES = STATUS_CODES;
},{}],3:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var util = require('./util')
  , assert = require('assert')
  , AssertionError = assert.AssertionError
  , statusCodes = require('./http').STATUS_CODES
  , eql = require('./eql')
  , inspect = require('util').inspect;

/**
 * Our function should
 * @param obj
 * @returns {Assertion}
 */
var should = function(obj) {
  return new Assertion(util.isWrapperType(obj) ? obj.valueOf(): obj);
};

should.inspect = inspect;

/**
 * Expose assert to should
 *
 * This allows you to do things like below
 * without require()ing the assert module.
 *
 *    should.equal(foo.bar, undefined);
 *
 */
util.merge(should, assert);


/**
 * Assert _obj_ exists, with optional message.
 *
 * @param {*} obj
 * @param {String} [msg]
 * @api public
 */
should.exist = should.exists = function(obj, msg) {
  if(null == obj) {
    throw new AssertionError({
      message: msg || ('expected ' + should.inspect(obj) + ' to exist')
      , stackStartFunction: should.exist
    });
  }
};

/**
 * Asserts _obj_ does not exist, with optional message.
 *
 * @param {*} obj
 * @param {String} [msg]
 * @api public
 */

should.not = {};
should.not.exist = should.not.exists = function(obj, msg){
  if (null != obj) {
    throw new AssertionError({
      message: msg || ('expected ' + should.inspect(obj) + ' to not exist')
      , stackStartFunction: should.not.exist
    });
  }
};

/**
 * Expose should to external world.
 */
exports = module.exports = should;


/**
 * Expose api via `Object#should`.
 *
 * @api public
 */

Object.defineProperty(Object.prototype, 'should', {
  set: function(){},
  get: function(){
    return should(this);
  },
  configurable: true
});

/**
 * Initialize a new `Assertion` with the given _obj_.
 *
 * @param {*} obj
 * @api private
 */

var Assertion = should.Assertion = function Assertion(obj) {
  this.obj = obj;
};

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Prototype.
 */

Assertion.prototype = {

  /**
   * Assert _expr_ with the given _msg_ and _negatedMsg_.
   *
   * @param {Boolean} expr
   * @param {function} msg
   * @param {function} negatedMsg
   * @param {Object} [expected]
   * @param {Boolean} [showDiff]
   * @param {String} [description]
   * @api private
   */

  assert: function(expr, msg, negatedMsg, expected, showDiff, description){
    msg = this.negate ? negatedMsg : msg

    var ok = this.negate ? !expr : expr
      , obj = this.obj;

    if (ok) return;

    var err = new AssertionError({
        message: msg.call(this)
      , actual: obj
      , expected: expected
      , stackStartFunction: this.assert
      , negated: this.negate
    });

    err.showDiff = showDiff;
    err.description = description

    throw err;
  },

  /**
   * Dummy getter.
   *
   * @api public
   */

  get an() {
    return this;
  },

  /**
   * Dummy getter.
   *
   * @api public
   */

  get of() {
    return this;
  },

  /**
   * Dummy getter.
   *
   * @api public
   */

  get a() {
    return this;
  },

  /**
   * Dummy getter.
   *
   * @api public
   */

  get and() {
    return this;
  },

  /**
   * Dummy getter.
   *
   * @api public
   */

  get be() {
    return this;
  },

  /**
   * Dummy getter.
   *
   * @api public
   */

  get have() {
    return this;
  },

  /**
   * Dummy getter.
   *
   * @api public
   */

  get with() {
    return this;
  },

  /**
   * Negation modifier.
   *
   * @api public
   */

  get not() {
    this.negate = true;
    return this;
  },

  /**
   * Get object inspection string.
   *
   * @return {String}
   * @api private
   */

  get inspect() {
    return should.inspect(this.obj);
  },

  /**
   * Assert instanceof `Arguments`.
   *
   * @api public
   */

  get arguments() {
    this.assert(
        util.isArguments(this.obj)
      , function(){ return 'expected ' + this.inspect + ' to be arguments' }
      , function(){ return 'expected ' + this.inspect + ' to not be arguments' });
    return this;
  },

  /**
   * Assert that object is empty.
   *
   * @api public
   */

  get empty() {
    var length = this.obj.length;

    if(util.isString(this.obj) || Array.isArray(this.obj) || util.isArguments(this.obj)) {
      this.assert(
        0 === length
        , function(){ return 'expected ' + this.inspect + ' to be empty' }
        , function(){ return 'expected ' + this.inspect + ' not to be empty' });
    } else {
      var ok = true;
      for (var prop in this.obj) {
        if(hasOwnProperty.call(this.obj, prop)) {
          ok = false;
          break;
        }
      }

      this.assert(
        ok
        , function(){ return 'expected ' + this.inspect + ' to be empty' }
        , function(){ return 'expected ' + this.inspect + ' not to be empty' });

    }
    return this;
  },

  /**
   * Assert ok.
   *
   * @api public
   */

  get ok() {
    this.assert(
        this.obj
      , function(){ return 'expected ' + this.inspect + ' to be truthy' }
      , function(){ return 'expected ' + this.inspect + ' to be falsey' });
    return this;
  },

  /**
   * Assert true.
   *
   * @api public
   */

  get true() {
    this.assert(
        true === this.obj
      , function(){ return 'expected ' + this.inspect + ' to be true' }
      , function(){ return 'expected ' + this.inspect + ' not to be true' });
    return this;
  },

  /**
   * Assert false.
   *
   * @api public
   */

  get false() {
    this.assert(
        false === this.obj
      , function(){ return 'expected ' + this.inspect + ' to be false' }
      , function(){ return 'expected ' + this.inspect + ' not to be false' });
    return this;
  },

  /**
   * Assert NaN.
   *
   * @api public
   */

  get NaN() {
    this.assert(
        util.isNumber(this.obj) && isNaN(this.obj)
      , function(){ return 'expected ' + this.inspect + ' to be NaN' }
      , function(){ return 'expected ' + this.inspect + ' not to be NaN' });
    return this;
  },

  /**
   * Assert Infinity.
   *
   * @api public
   */

  get Infinity() {
    this.assert(
      util.isNumber(this.obj) && !isNaN(this.obj) && !isFinite(this.obj)
      , function(){ return 'expected ' + this.inspect + ' to be Infinity' }
      , function(){ return 'expected ' + this.inspect + ' not to be Infinity' });
    return this;
  },

  /**
   * Assert equal.
   *
   * @param {*} val
   * @param {String} description
   * @api public
   */

  eql: function(val, description){
    this.assert(
        eql(val, this.obj)
      , function(){ return 'expected ' + this.inspect + ' to equal ' + should.inspect(val) + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' to not equal ' + should.inspect(val) + (description ? " | " + description : "") }
      , val
      , true
      , description);
    return this;
  },

  /**
   * Assert strict equal.
   *
   * @param {*} val
   * @param {String} description
   * @api public
   */

  equal: function(val, description){
    this.assert(
        val === this.obj
      , function(){ return 'expected ' + this.inspect + ' to equal ' + should.inspect(val) + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' to not equal ' + should.inspect(val) + (description ? " | " + description : "") }
      , val
      , void 0
      , description);
    return this;
  },

  /**
   * Assert within start to finish (inclusive).
   *
   * @param {Number} start
   * @param {Number} finish
   * @param {String} description
   * @api public
   */

  within: function(start, finish, description){
    var range = start + '..' + finish;
    this.assert(
        this.obj >= start && this.obj <= finish
      , function(){ return 'expected ' + this.inspect + ' to be within ' + range + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' to not be within ' + range + (description ? " | " + description : "") }
      , void 0
      , void 0
      , description);
    return this;
  },

  /**
   * Assert within value +- delta (inclusive).
   *
   * @param {Number} value
   * @param {Number} delta
   * @param {String} description
   * @api public
   */

  approximately: function(value, delta, description) {
    this.assert(
      Math.abs(this.obj - value) <= delta
      , function(){ return 'expected ' + this.inspect + ' to be approximately ' + value + " +- " + delta + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' to not be approximately ' + value + " +- " + delta + (description ? " | " + description : "") }
      , void 0
      , void 0
      , description);
    return this;
  },

  /**
   * Assert typeof.
   *
   * @param {*} type
   * @param {String} description
   * @api public
   */
  type: function(type, description){
    this.assert(
        type == typeof this.obj
      , function(){ return 'expected ' + this.inspect + ' to have type ' + type + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' not to have type ' + type  + (description ? " | " + description : "") }
      , void 0
      , void 0
      , description);
    return this;
  },

  /**
   * Assert instanceof.
   *
   * @param {Function} constructor
   * @param {String} description
   * @api public
   */

  instanceof: function(constructor, description){
    var name = constructor.name;
    this.assert(
        this.obj instanceof constructor
      , function(){ return 'expected ' + this.inspect + ' to be an instance of ' + name + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' not to be an instance of ' + name + (description ? " | " + description : "") }
      , void 0
      , void 0
      , description);
    return this;
  },

  /**
   * Assert if given object is a function.
   */
  get Function(){
    this.assert(
      util.isFunction(this.obj)
      , function(){ return 'expected ' + this.inspect + ' to be a function' }
      , function(){ return 'expected ' + this.inspect + ' not to be a function' });
    return this;
  },

  /**
   * Assert given object is an object.
   */
  get Object(){
    this.assert(
      util.isObject(this.obj) && !Array.isArray(this.obj)
      , function(){ return 'expected ' + this.inspect + ' to be an object' }
      , function(){ return 'expected ' + this.inspect + ' not to be an object' });
    return this;
  },

  /**
   * Assert given object is a string
   */
  get String(){
    this.assert(
      util.isString(this.obj)
      , function(){ return 'expected ' + this.inspect + ' to be a string' }
      , function(){ return 'expected ' + this.inspect + ' not to be a string' });
    return this;
  },

  /**
   * Assert given object is an array
   */
  get Array(){
    this.assert(
      Array.isArray(this.obj)
      , function(){ return 'expected ' + this.inspect + ' to be an array' }
      , function(){ return 'expected ' + this.inspect + ' not to be an array' });
    return this;
  },

  /**
   * Assert given object is a number. NaN and Infinity are not numbers.
   */
  get Number(){
    this.assert(
      util.isNumber(this.obj) && isFinite(this.obj) && !isNaN(this.obj)
      , function(){ return 'expected ' + this.inspect + ' to be a number' }
      , function(){ return 'expected ' + this.inspect + ' not to be a number' });
    return this;
  },

  /**
   * Assert given object is a boolean
   */
  get Boolean(){
    this.assert(
      util.isBoolean(this.obj)
      , function(){ return 'expected ' + this.inspect + ' to be a boolean' }
      , function(){ return 'expected ' + this.inspect + ' not to be a boolean' });
    return this;
  },

  /**
   * Assert given object is an error
   */
  get Error() {
    this.assert(
      util.isError(this.obj)
      , function(){ return 'expected ' + this.inspect + ' to be an error' }
      , function(){ return 'expected ' + this.inspect + ' not to be an error' });
    return this;
  },
  /**
   * Assert numeric value above _n_.
   *
   * @param {Number} n
   * @param {String} description
   * @api public
   */

  above: function(n, description){
    this.assert(
        this.obj > n
      , function(){ return 'expected ' + this.inspect + ' to be above ' + n + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' to be below ' + n + (description ? " | " + description : "") }
      , void 0
      , void 0
      , description);
    return this;
  },

  /**
   * Assert numeric value below _n_.
   *
   * @param {Number} n
   * @param {String} description
   * @api public
   */

  below: function(n, description){
    this.assert(
        this.obj < n
      , function(){ return 'expected ' + this.inspect + ' to be below ' + n + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' to be above ' + n + (description ? " | " + description : "") }
      , void 0
      , void 0
      , description);
    return this;
  },

  /**
   * Assert string value matches _regexp_.
   *
   * @param {RegExp} regexp
   * @param {String} description
   * @api public
   */

  match: function(regexp, description){
    this.assert(
        regexp.exec(this.obj)
      , function(){ return 'expected ' + this.inspect + ' to match ' + regexp + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' not to match ' + regexp + (description ? " | " + description : "") }
      , void 0
      , void 0
      , description);
    return this;
  },

  /**
   * Assert property "length" exists and has value of _n_.
   *
   * @param {Number} n
   * @param {String} description
   * @api public
   */

  length: function(n, description){
    this.obj.should.have.property('length');
    var len = this.obj.length;
    this.assert(
        n == len
      , function(){ return 'expected ' + this.inspect + ' to have a length of ' + n + ' but got ' + len + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' to not have a length of ' + len + (description ? " | " + description : "") }
      , void 0
      , void 0
      , description);
    return this;
  },

  /**
   * Assert property _name_ exists, with optional _val_.
   *
   * @param {String} name
   * @param {*} [val]
   * @param {String} description
   * @api public
   */

  property: function(name, val, description){
    if (this.negate && undefined !== val) {
      if (undefined === this.obj[name]) {
        throw new Error(this.inspect + ' has no property ' + should.inspect(name) + (description ? " | " + description : ""));
      }
    } else {
      this.assert(
          undefined !== this.obj[name]
        , function(){ return 'expected ' + this.inspect + ' to have a property ' + should.inspect(name) + (description ? " | " + description : "") }
        , function(){ return 'expected ' + this.inspect + ' to not have a property ' + should.inspect(name) + (description ? " | " + description : "") }
        , void 0
        , void 0
        , description);
    }

    if (undefined !== val) {
      this.assert(
          val === this.obj[name]
        , function(){ return 'expected ' + this.inspect + ' to have a property ' + should.inspect(name)
          + ' of ' + should.inspect(val) + ', but got ' + should.inspect(this.obj[name]) + (description ? " | " + description : "") }
        , function(){ return 'expected ' + this.inspect + ' to not have a property ' + should.inspect(name) + ' of ' + should.inspect(val) + (description ? " | " + description : "") }
        , void 0
        , void 0
        , description);
    }

    this.obj = this.obj[name];
    return this;
  },
  /**
   * Asset have given properties
   * @param {Array|String ...} names
   * @api public
   */
  properties: function(names) {
    var str
      , ok = true;

    names = names instanceof Array
      ? names
      : Array.prototype.slice.call(arguments);

    var len = names.length;

    if (!len) throw new Error('names required');

    // make sure they're all present
    ok = names.every(function(name){
      return this.obj[name] !== undefined;
    }, this);

    // key string
    if (len > 1) {
      names = names.map(function(name){
        return should.inspect(name);
      });
      var last = names.pop();
      str = names.join(', ') + ', and ' + last;
    } else {
      str = should.inspect(names[0]);
    }

    // message
    str = 'have ' + (len > 1 ? 'properties ' : 'a property ') + str;

    this.assert(
      ok
      , function(){ return 'expected ' + this.inspect + ' to ' + str }
      , function(){ return 'expected ' + this.inspect + ' to not ' + str });

    return this;
  },

  /**
   * Assert own property _name_ exists.
   *
   * @param {String} name
   * @param {String} description
   * @api public
   */

  ownProperty: function(name, description){
    this.assert(
      hasOwnProperty.call(this.obj, name)
      , function(){ return 'expected ' + this.inspect + ' to have own property ' + should.inspect(name) + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' to not have own property ' + should.inspect(name) + (description ? " | " + description : "") }
      , void 0
      , void 0
      , description);
    this.obj = this.obj[name];
    return this;
  },

  /**
   * Assert that string starts with `str`.
   * @param {String} str
   * @param {String} description
   * @api public
   */

  startWith: function(str, description) {
    this.assert(0 === this.obj.indexOf(str)
    , function() { return 'expected ' + this.inspect + ' to start with ' + should.inspect(str) + (description ? " | " + description : "") }
    , function() { return 'expected ' + this.inspect + ' to not start with ' + should.inspect(str) + (description ? " | " + description : "") }
    , void 0
    , void 0
    , description);
    return this;
  },

  /**
   * Assert that string ends with `str`.
   * @param {String} str
   * @param {String} description
   * @api public
   */

  endWith: function(str, description) {
    this.assert(-1 !== this.obj.indexOf(str, this.obj.length - str.length)
    , function() { return 'expected ' + this.inspect + ' to end with ' + should.inspect(str) + (description ? " | " + description : "") }
    , function() { return 'expected ' + this.inspect + ' to not end with ' + should.inspect(str) + (description ? " | " + description : "") }
    , void 0
    , void 0
    , description);
    return this;
  },

  /**
   * Assert that `obj` is present via `.indexOf()` or that `obj` contains some sub-object.
   *
   * @param {*} obj
   * @param {String} description
   * @api public
   */

  include: function(obj, description){
    if (!Array.isArray(this.obj) && !util.isString(this.obj)){
      var cmp = {};
      for (var key in obj) cmp[key] = this.obj[key];
      this.assert(
          eql(cmp, obj)
        , function(){ return 'expected ' + this.inspect + ' to include an object equal to ' + should.inspect(obj) + (description ? " | " + description : "") }
        , function(){ return 'expected ' + this.inspect + ' to not include an object equal to ' + should.inspect(obj) + (description ? " | " + description : "") }
        , void 0
        , void 0
        , description);
    } else {
      this.assert(
          ~this.obj.indexOf(obj)
        , function(){ return 'expected ' + this.inspect + ' to include ' + should.inspect(obj) + (description ? " | " + description : "") }
        , function(){ return 'expected ' + this.inspect + ' to not include ' + should.inspect(obj) + (description ? " | " + description : "") }
        , void 0
        , void 0
        , description);
    }
    return this;
  },

  /**
   * Assert that an object equal to `obj` is present.
   *
   * @param {Array} obj
   * @param {String} description
   * @api public
   */

  includeEql: function(obj, description){
    this.assert(
      this.obj.some(function(item) { return eql(obj, item); })
      , function(){ return 'expected ' + this.inspect + ' to include an object equal to ' + should.inspect(obj) + (description ? " | " + description : "") }
      , function(){ return 'expected ' + this.inspect + ' to not include an object equal to ' + should.inspect(obj) + (description ? " | " + description : "") }
      , void 0
      , void 0
      , description);
    return this;
  },

  /**
   * Assert exact keys or inclusion of keys by using
   * the `.include` modifier.
   *
   * @param {Array|String ...} keys
   * @api public
   */

  keys: function(keys){
    var str
      , ok = true;

    keys = keys instanceof Array
      ? keys
      : Array.prototype.slice.call(arguments);

    if (!keys.length) throw new Error('keys required');

    var actual = Object.keys(this.obj)
      , len = keys.length;

    // make sure they're all present
    ok = keys.every(function(key){
      return ~actual.indexOf(key);
    });

    // matching length
    ok = ok && keys.length == actual.length;

    // key string
    if (len > 1) {
      keys = keys.map(function(key){
        return should.inspect(key);
      });
      var last = keys.pop();
      str = keys.join(', ') + ', and ' + last;
    } else {
      str = should.inspect(keys[0]);
    }

    // message
    str = 'have ' + (len > 1 ? 'keys ' : 'key ') + str;

    this.assert(
        ok
      , function(){ return 'expected ' + this.inspect + ' to ' + str }
      , function(){ return 'expected ' + this.inspect + ' to not ' + str });

    return this;
  },

  /**
   * Assert that header `field` has the given `val`.
   *
   * @param {String} field
   * @param {String} val
   * @return {Assertion} for chaining
   * @api public
   */

  header: function(field, val){
    this.obj.should
      .have.property('headers').and
      .have.property(field.toLowerCase(), val);
    return this;
  },

  /**
   * Assert `.statusCode` of `code`.
   *
   * @param {Number} code
   * @return {Assertion} for chaining
   * @api public
   */

  status:  function(code){
    this.obj.should.have.property('statusCode');
    var status = this.obj.statusCode;

    this.assert(
        code == status
      , function(){ return 'expected response code of ' + code + ' ' + should.inspect(statusCodes[code])
        + ', but got ' + status + ' ' + should.inspect(statusCodes[status]) }
      , function(){ return 'expected to not respond with ' + code + ' ' + should.inspect(statusCodes[code]) });

    return this;
  },

  /**
   * Assert that this response has content-type: application/json.
   *
   * @return {Assertion} for chaining
   * @api public
   */

  get json() {
    this.obj.should.have.property('headers');
    this.obj.headers.should.have.property('content-type');
    this.obj.headers['content-type'].should.include('application/json');
    return this;
  },

  /**
   * Assert that this response has content-type: text/html.
   *
   * @return {Assertion} for chaining
   * @api public
   */

  get html() {
    this.obj.should.have.property('headers');
    this.obj.headers.should.have.property('content-type');
    this.obj.headers['content-type'].should.include('text/html');
    return this;
  },

  /**
   * Assert that this function will or will not
   * throw an exception.
   *
   * @return {Assertion} for chaining
   * @api public
   */

  throw: function(message){
    var fn = this.obj
      , err = {}
      , errorInfo = ''
      , ok = true;

    try {
      fn();
      ok = false;
    } catch (e) {
      err = e;
    }

    if (ok) {
      if ('string' == typeof message) {
        ok = message == err.message;
      } else if (message instanceof RegExp) {
        ok = message.test(err.message);
      } else if ('function' == typeof message) {
        ok = err instanceof message;
      }

      if (message && !ok) {
        if ('string' == typeof message) {
          errorInfo = " with a message matching '" + message + "', but got '" + err.message + "'";
        } else if (message instanceof RegExp) {
          errorInfo = " with a message matching " + message + ", but got '" + err.message + "'";
        } else if ('function' == typeof message) {
          errorInfo = " of type " + message.name + ", but got " + err.constructor.name;
        }
      }
    }

    this.assert(
        ok
      , function(){ return 'expected an exception to be thrown' + errorInfo }
      , function(){ return 'expected no exception to be thrown, got "' + err.message + '"' });

    return this;
  }
};

/**
 * Aliases.
 */

(function alias(name, as){
  Assertion.prototype[as] = Assertion.prototype[name];
  return alias;
})
('instanceof', 'instanceOf')
('throw', 'throwError')
('length', 'lengthOf')
('keys', 'key')
('ownProperty', 'haveOwnProperty')
('above', 'greaterThan')
('below', 'lessThan')
('include', 'contain')
('equal', 'exactly');


},{"./eql":1,"./http":2,"./util":4,"assert":6,"util":7}],4:[function(require,module,exports){
/**
 * Check if given obj just a primitive type wrapper
 * @param {Object} obj
 * @returns {boolean}
 * @api private
 */
exports.isWrapperType = function(obj) {
    return isNumber(obj) || isString(obj) || isBoolean(obj);
}

/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar' }
 *       , b = { bar: 'baz' };
 *
 *     utils.merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api private
 */

exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

function isNumber(arg) {
  return typeof arg === 'number' || arg instanceof Number;
}

exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string' || arg instanceof String;
}

function isBoolean(arg) {
  return typeof arg === 'boolean' || arg instanceof Boolean;
}
exports.isBoolean = isBoolean;

exports.isString = isString;

function isBuffer(arg) {
  return typeof Buffer !== 'undefined' && arg instanceof Buffer;
}

exports.isBuffer = isBuffer;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}

exports.isDate = isDate;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

exports.isObject = isObject;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}

exports.isRegExp = isRegExp;

function isNullOrUndefined(arg) {
  return arg == null;
}

exports.isNullOrUndefined = isNullOrUndefined;

function isArguments(object) {
  return objectToString(object) === '[object Arguments]';
}

exports.isArguments = isArguments;

exports.isFunction = function(arg) {
  return typeof arg === 'function' || arg instanceof Function;
};

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;
},{}],5:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// UTILITY
var util = require('util');
var shims = require('_shims');
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  this.message = options.message || getMessage(this);
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = shims.keys(a),
        kb = shims.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};
},{"_shims":5,"util":7}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg instanceof Buffer;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":5}]},{},[3])
(3)
});
;