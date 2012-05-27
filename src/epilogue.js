// Once all defintions are ready, exports them as an AMD module.
if (detectedAmd) {
  define('Handlebars', function() {
    return Handlebars;
  });
}

}).call(this);