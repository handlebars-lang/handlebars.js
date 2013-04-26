// common.js
if (typeof module === 'object' && module.exports) { module.exports = Handlebars; } else

// AMD modules
if (typeof define === "function" && define.amd) { define(function() { return Handlebars; }); } else
  
// browser
if (typeof window === 'object') { window.Handlebars = Handlebars; } else

// node.js
if (typeof global === 'object') { global.Handlebars = Handlebars; }

})()
;
