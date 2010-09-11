var handlebars = require('./handlebars');
var fs = require('fs');

if (process.argv.length < 3) {
  console.log("handlebars.js compiler");
  console.log("Tool for compiling handlebars.js template files into javascript functions.");
  console.log("Usage: node compiler.js Function=template.hbs ... > templates.js");
  console.log();
  return;
}

process.argv.slice(2).forEach(function(val, index, array) {
  var parts = val.split("=", 2);

  var tmpl = fs.readFileSync(parts[1], 'utf8');

  console.log(parts[0] + " =  " + handlebars.compileToString(tmpl).toString()); 
});

