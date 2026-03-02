describe('runtime', function () {
  describe('#template', function () {
    it('should throw on invalid templates', function () {
      expect(function () {
        Handlebars.template({});
      }).toThrow('Unknown template object: object');
      expect(function () {
        Handlebars.template();
      }).toThrow('Unknown template object: undefined');
      expect(function () {
        Handlebars.template('');
      }).toThrow('Unknown template object: string');
    });
    it('should throw on version mismatch', function () {
      expect(function () {
        Handlebars.template({
          main: {},
          compiler: [Handlebars.COMPILER_REVISION + 1],
        });
      }).toThrow(
        /Template was precompiled with a newer version of Handlebars than the current runtime/
      );
      expect(function () {
        Handlebars.template({
          main: {},
          compiler: [Handlebars.LAST_COMPATIBLE_COMPILER_REVISION - 1],
        });
      }).toThrow(
        /Template was precompiled with an older version of Handlebars than the current runtime/
      );
      expect(function () {
        Handlebars.template({
          main: {},
        });
      }).toThrow(
        /Template was precompiled with an older version of Handlebars than the current runtime/
      );
    });
  });

  describe('#noConflict', function () {
    it('should reset on no conflict', function () {
      if (!CompilerContext.browser) {
        return;
      }
      var reset = Handlebars;
      Handlebars.noConflict();
      expect(Handlebars).toBe('no-conflict');

      Handlebars = 'really, none';
      reset.noConflict();
      expect(Handlebars).toBe('really, none');

      Handlebars = reset;
    });
  });
});
