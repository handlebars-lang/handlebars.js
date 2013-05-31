  if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = Handlebars;

  } else if (typeof define === "function" && define.amd) {
    // AMD modules
    define(function() { return Handlebars; });

  } else {
    // other, i.e. browser
    this.Handlebars = Handlebars;
  }
}).call(this);
