module.exports = { createRegisterAsyncTaskFn };

function createRegisterAsyncTaskFn(grunt) {
  return function registerAsyncTask(name, asyncFunction) {
    grunt.registerTask(name, function() {
      asyncFunction()
        .catch(error => {
          grunt.fatal(error);
        })
        .finally(this.async());
    });
  };
}
