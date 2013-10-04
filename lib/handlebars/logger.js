var levels = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3
};

var methodMap = { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' };

export var logger = {
  // can be overridden in the host environment
  level: 0,
  log: function(level, obj) {
    if (logger.level <= level) {
      var method = methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};

export function log(level, obj) { logger.log(level, obj); }

