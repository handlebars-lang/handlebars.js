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
          main: {},
          compiler: [Handlebars.COMPILER_REVISION + 1]
        });
      }, Error, /Template was precompiled with a newer version of Handlebars than the current runtime/);
      shouldThrow(function() {
        Handlebars.template({
          main: {},
          compiler: [Handlebars.COMPILER_REVISION - 1]
        });
      }, Error, /Template was precompiled with an older version of Handlebars than the current runtime/);
      shouldThrow(function() {
        Handlebars.template({
          main: {}
        });
      }, Error, /Template was precompiled with an older version of Handlebars than the current runtime/);
    });
  });

  describe('#child', function() {
    if (!Handlebars.compile) {
      return;
    }

    it('should throw for depthed methods without depths', function() {
      shouldThrow(function() {
        var template = Handlebars.compile('{{#foo}}{{../bar}}{{/foo}}');
        // Calling twice to hit the non-compiled case.
        template._setup({});
        template._setup({});
        template._child(1);
      }, Error, 'must pass parent depths');
    });

    it('should throw for block param methods without params', function() {
      shouldThrow(function() {
        var template = Handlebars.compile('{{#foo as |foo|}}{{foo}}{{/foo}}');
        // Calling twice to hit the non-compiled case.
        template._setup({});
        template._setup({});
        template._child(1);
      }, Error, 'must pass block params');
    });
    it('should expose child template', function() {
      var template = Handlebars.compile('{{#foo}}bar{{/foo}}');
        // Calling twice to hit the non-compiled case.
      equal(template._child(1)(), 'bar');
      equal(template._child(1)(), 'bar');
    });
    it('should render depthed content', function() {
      var template = Handlebars.compile('{{#foo}}{{../bar}}{{/foo}}');
        // Calling twice to hit the non-compiled case.
      equal(template._child(1, undefined, [], [{bar: 'baz'}])(), 'baz');
    });
  });

  describe('#noConflict', function() {
    if (!CompilerContext.browser) {
      return;
    }

    it('should reset on no conflict', function() {
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
