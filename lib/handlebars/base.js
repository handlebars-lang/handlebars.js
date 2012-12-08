// BEGIN(BROWSER)

/*jshint eqnull:true*/
this.Handlebars = {};

(function(Handlebars) {

Handlebars.VERSION = "1.0.rc.1";

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

var toString = Object.prototype.toString, functionType = "[object Function]";

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;


  var ret = "";
  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      return Handlebars.helpers.each(context, options);
    } else {
      return inverse(this);
    }
  } else {
    return fn(context);
  }
});

Handlebars.K = function() {};

Handlebars.createFrame = Object.create || function(object) {
  Handlebars.K.prototype = object;
  var obj = new Handlebars.K();
  Handlebars.K.prototype = null;
  return obj;
};

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var i = 0, ret = "", data;

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if(context && typeof context === 'object') {
    if(context instanceof Array){
      for(var j = context.length; i<j; i++) {
        if (data) { data.index = i; }
        ret = ret + fn(context[i], { data: data });
      }
    } else {
      for(var key in context) {
        if(context.hasOwnProperty(key)) {
          if(data) { data.key = key; }
          ret = ret + fn(context[key], {data: data});
          i++;
        }
      }
    }
  }

  if(i === 0){
    ret = inverse(this);
  }

  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if(!context || Handlebars.Utils.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers['if'].call(this, context, options);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('log', function(context) {
  Handlebars.log(context);
});

Handlebars.registerHelper('eachIncludeParent', function (context, options) {

  function _each (obj, callback, args) {
    var name,
      i = 0,
      length = obj.length,
      isObj = length === undefined;

    if(args) {
      if(isObj) {
        for(name in obj) {
          if(callback.apply(obj[name], args) === false) {
            break;
          }
        }
      } else {
        for(; i < length;) {
          if (callback.apply(obj[i++], args) === false) {
            break;
          }
        }
      }
    } else {
      if (isObj) {
        for (name in obj) {
          if (callback.call(obj[name], name, obj[name]) === false) {
            break;
          }
        }
      } else {
        for (; i < length;) {
          if (callback.call(obj[i], i, obj[i++]) === false) {
            break;
          }
        }
      }
    }

    return obj;
  };
  
  var fn = options.fn,
  inverse = options.inverse,
  ret = "",
  _context = [];

  _each(context, function(index, object) {
    var _object = {};
    for (var key in object) if (object.hasOwnProperty(key)) _object[key] = object[key];
    _context.push(_object);
  });

  if (_context && _context.length > 0) {
    for (var i = 0, j = _context.length; i < j; i++) {
      _context[i]["parentContext"] = options.hash.parent;
      ret = ret + fn(_context[i]);
    }
  } else {
    ret = inverse(this);
  }

  return ret;
});

}(this.Handlebars));

// END(BROWSER)

module.exports = this.Handlebars;

