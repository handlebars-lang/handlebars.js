/*globals Handlebars, shouldThrow */

describe('runtime', function() {
  describe('#template', function() {
    it('should throw on invalid templates', function() {
      shouldThrow(function() {
        Handlebars.template({});
      }, Error, 'Unknown template object: object');
      shouldThrow(function() {
        Handlebars.template();
      }, Error, 'Unknown template object: undefined');
      shouldThrow(function() {
        Handlebars.template('');
      }, Error, 'Unknown template object: string');
    });
    it('should throw on version mismatch', function() {
      shouldThrow(function() {
        Handlebars.template({
          main: true,
          compiler: [Handlebars.COMPILER_REVISION + 1]
        });
      }, Error, /Template was precompiled with a newer version of Handlebars than the current runtime/);
      shouldThrow(function() {
        Handlebars.template({
          main: true,
          compiler: [Handlebars.COMPILER_REVISION - 1]
        });
      }, Error, /Template was precompiled with an older version of Handlebars than the current runtime/);
      shouldThrow(function() {
        Handlebars.template({
          main: true
        });
      }, Error, /Template was precompiled with an older version of Handlebars than the current runtime/);
    });
  });
});
