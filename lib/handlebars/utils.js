var Handlebars = {};

// BEGIN(BROWSER)
Handlebars.Exception = function(message) {
  this.message = message;
};

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

Handlebars.Utils = {
  escapeExpression: function(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof Handlebars.SafeString) {
      return string.toString();
    }
    else if (string === null) {
      string = "";
    }

    return string.toString().replace(/&(?!\w+;)|["\\<>]/g, function(str) {
      switch(str) {
        case "&":
          return "&amp;";
        case '"':
          return "\"";
        case "\\":
          return "\\\\";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        default:
          return str;
      }
    });
  },
  isEmpty: function(value) {
    if (typeof value === "undefined") {
      return true;
    } else if (value === null) {
      return true;
		} else if (value === false) {
			return true;
    } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }
};
// END(BROWSER)

exports.Utils = Handlebars.Utils;
exports.SafeString = Handlebars.SafeString;
exports.Exception = Handlebars.Exception;
