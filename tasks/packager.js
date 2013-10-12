module.exports = function(grunt) {
  grunt.registerMultiTask('packager', 'Transpiles scripts written using ES6 to ES5.', function() {
    // Execute in here to prevent traceur private var blowup
    var Packager = require('es6-module-packager').default,
        fs = require('fs');

    var options = this.options();
    this.files.forEach(function(file) {
      var packager = new Packager(file.src[0], {export: options.export});
      fs.writeFileSync(file.dest, packager.toLocals());
    });
  });
};
