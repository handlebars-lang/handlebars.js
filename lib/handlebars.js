var Handlebars = require("./handlebars/base");
module.exports = Handlebars;

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
require("./handlebars/utils");

require("./handlebars/compiler");
require("./handlebars/runtime");

//new feature required
//I think we should make "{{else}}" block more useful
//
//{{#if isActive}}
//  <img src="star.gif" alt="Active">
//{{else}}
//  <img src="cry.gif" alt="Inactive">
//{{/if}}
//Handlebars.registerHelper('if', function(conditional, options) {
//    if(conditional) {
//      return options.fn(this);
//    } else {
//      return options.inverse(this);
//    }
//});
//
//We can use `options.inverse` to receive the `{{else}}` block defined in `{{#if}}` block helper.
//But I found that the compiler only handle `{{else}}` block.
//Why couldn't we expand this to a new level, let us to define custom inline block?
//Something like:
//
//{{#for items}}
//  <img src="star.gif" alt="Active">
//{{step}}
//  <span>|</span>
//{{header}}
//  <h3>Rate this</h3>
//{{footer}}
//  <div class='clearfix' />
//{{/for}}
//
//We can use these custom block definitions in helper function
//
//Handlebars.registerHelper('for', function(items, options) {
//  var r = "";
//    if(items && items.length) {
//	    r += options.header(this);
//        for(var i=items.length;i < items.length;i++){
//	        r += options.fn(items[i]);
//	        if(i!==items.length-1){
//		        r += options.step(items[i]);
//	        }
//        }
//	    r += options.header(this);
//    }
//	return r;
//});
//
//What do you think?
// BEGIN(BROWSER)

// END(BROWSER)

