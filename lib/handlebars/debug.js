var Handlebars = require("./base");

// BEGIN(BROWSER)
(function() {
  var classes = ["Lexer", "PrintVisitor", "Context", "Runtime", "Exception"];
  var prop;

  for(var i=0, l=classes.length; i<l; i++) {
    var className = classes[i], klass = Handlebars[className];
    klass.displayName = "new Handlebars." + className;

    for(prop in klass) {
      if(klass.hasOwnProperty(prop)) {
        klass[prop].displayName = "Handlebars." + className + "#" + prop;
      }
    }
  }

  for(prop in Handlebars.Utils) {
    if(Handlebars.Utils.hasOwnProperty(prop)) {
      Handlebars.Utils[prop].displayName = "Handlebars.Utils." + prop;
    }
  }

  Handlebars.parse.displayName   = "Handlebars.parse";
  Handlebars.print.displayName   = "Handlebars.print";
  Handlebars.compile.displayName = "Handlebars.compile";
})();
// END(BROWSER)
