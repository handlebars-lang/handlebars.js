require('./handlebars');
var fs = require('fs');

process.argv.slice(2).forEach(function(val, index, array) {
  var parts = val.split("=", 2);

  var tmpl = fs.readFileSync(parts[1], 'utf8');

  console.log(parts[0] + " =  " + Handlebars.compileToString(tmpl).toString()); 
});

