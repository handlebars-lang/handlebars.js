(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals
    root.Handlebars = factory();
  }
}(this, function (undefined) {
	var Handlebars = {};
