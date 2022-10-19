describe('runtime', function () {
  describe('#template', function () {
    it('should throw on invalid templates', function () {
      shouldThrow(
        function () {
          Handlebars.template({});
        },
        Error,
        'Unknown template object: object'
      );
      shouldThrow(
        function () {
          Handlebars.template();
        },
        Error,
        'Unknown template object: undefined'
      );
      shouldThrow(
        function () {
          Handlebars.template('');
        },
        Error,
        'Unknown template object: string'
      );
    });
    it('should throw on version mismatch', function () {
      shouldThrow(
        function () {
          Handlebars.template({
            main: {},
            compiler: [Handlebars.COMPILER_REVISION + 1],
          });
        },
        Error,
        /Template was precompiled with a newer version of Handlebars than the current runtime/
      );
      shouldThrow(
        function () {
          Handlebars.template({
            main: {},
            compiler: [Handlebars.LAST_COMPATIBLE_COMPILER_REVISION - 1],
          });
        },
        Error,
        /Template was precompiled with an older version of Handlebars than the current runtime/
      );
      shouldThrow(
        function () {
          Handlebars.template({
            main: {},
          });
        },
        Error,
        /Template was precompiled with an older version of Handlebars than the current runtime/
      );
    });
  });

  describe('#noConflict', function () {
    if (!CompilerContext.browser) {
      return;
    }

    it('should reset on no conflict', function () {
      var reset = Handlebars;
      Handlebars.noConflict();
      equal(Handlebars, 'no-conflict');

      Handlebars = 'really, none';
      reset.noConflict();
      equal(Handlebars, 'really, none');

      Handlebars = reset;
    });
  });
});
