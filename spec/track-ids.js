describe('track ids', function() {
  var context;
  beforeEach(function() {
    context = { is: { a: 'foo' }, slave: { driver: 'bar' } };
  });

  it('should not include anything without the flag', function() {
    var string = '{{wycats is.a slave.driver}}';

    var helpers = {
      wycats: function(passiveVoice, noun, options) {
        equal(options.ids, undefined);
        equal(options.hashIds, undefined);

        return 'success';
      }
    };

    expectTemplate(string)
      .withHelpers(helpers)
      .toCompileTo('success');
  });
  it('should include argument ids', function() {
    var string = '{{wycats is.a slave.driver}}';
    var compileOptions = { trackIds: true };

    var helpers = {
      wycats: function(passiveVoice, noun, options) {
        equal(options.ids[0], 'is.a');
        equal(options.ids[1], 'slave.driver');

        return (
          'HELP ME MY BOSS ' +
          options.ids[0] +
          ':' +
          passiveVoice +
          ' ' +
          options.ids[1] +
          ':' +
          noun
        );
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(context)
      .toCompileTo('HELP ME MY BOSS is.a:foo slave.driver:bar');
  });
  it('should include hash ids', function() {
    var string = '{{wycats bat=is.a baz=slave.driver}}';
    var compileOptions = { trackIds: true };

    var helpers = {
      wycats: function(options) {
        equal(options.hashIds.bat, 'is.a');
        equal(options.hashIds.baz, 'slave.driver');

        return (
          'HELP ME MY BOSS ' +
          options.hashIds.bat +
          ':' +
          options.hash.bat +
          ' ' +
          options.hashIds.baz +
          ':' +
          options.hash.baz
        );
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(context)
      .toCompileTo('HELP ME MY BOSS is.a:foo slave.driver:bar');
  });
  it('should note ../ and ./ references', function() {
    var string = '{{wycats ./is.a ../slave.driver this.is.a this}}';
    var compileOptions = { trackIds: true };

    var helpers = {
      wycats: function(passiveVoice, noun, thiz, thiz2, options) {
        equal(options.ids[0], 'is.a');
        equal(options.ids[1], '../slave.driver');
        equal(options.ids[2], 'is.a');
        equal(options.ids[3], '');

        return (
          'HELP ME MY BOSS ' +
          options.ids[0] +
          ':' +
          passiveVoice +
          ' ' +
          options.ids[1] +
          ':' +
          noun
        );
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(context)
      .toCompileTo('HELP ME MY BOSS is.a:foo ../slave.driver:undefined');
  });
  it('should note @data references', function() {
    var string = '{{wycats @is.a @slave.driver}}';
    var compileOptions = { trackIds: true };

    var helpers = {
      wycats: function(passiveVoice, noun, options) {
        equal(options.ids[0], '@is.a');
        equal(options.ids[1], '@slave.driver');

        return (
          'HELP ME MY BOSS ' +
          options.ids[0] +
          ':' +
          passiveVoice +
          ' ' +
          options.ids[1] +
          ':' +
          noun
        );
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withRuntimeOptions({ data: context })
      .toCompileTo('HELP ME MY BOSS @is.a:foo @slave.driver:bar');
  });

  it('should return null for constants', function() {
    var string = '{{wycats 1 "foo" key=false}}';
    var compileOptions = { trackIds: true };

    var helpers = {
      wycats: function(passiveVoice, noun, options) {
        equal(options.ids[0], null);
        equal(options.ids[1], null);
        equal(options.hashIds.key, null);

        return (
          'HELP ME MY BOSS ' +
          passiveVoice +
          ' ' +
          noun +
          ' ' +
          options.hash.key
        );
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(context)
      .toCompileTo('HELP ME MY BOSS 1 foo false');
  });
  it('should return true for subexpressions', function() {
    var string = '{{wycats (sub)}}';
    var compileOptions = { trackIds: true };

    var helpers = {
      sub: function() {
        return 1;
      },
      wycats: function(passiveVoice, options) {
        equal(options.ids[0], true);

        return 'HELP ME MY BOSS ' + passiveVoice;
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(context)
      .toCompileTo('HELP ME MY BOSS 1');
  });

  it('should use block param paths', function() {
    var string = '{{#doIt as |is|}}{{wycats is.a slave.driver is}}{{/doIt}}';
    var compileOptions = { trackIds: true };

    var helpers = {
      doIt: function(options) {
        var blockParams = [this.is];
        blockParams.path = ['zomg'];
        return options.fn(this, { blockParams: blockParams });
      },
      wycats: function(passiveVoice, noun, blah, options) {
        equal(options.ids[0], 'zomg.a');
        equal(options.ids[1], 'slave.driver');
        equal(options.ids[2], 'zomg');

        return (
          'HELP ME MY BOSS ' +
          options.ids[0] +
          ':' +
          passiveVoice +
          ' ' +
          options.ids[1] +
          ':' +
          noun
        );
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(context)
      .toCompileTo('HELP ME MY BOSS zomg.a:foo slave.driver:bar');
  });

  describe('builtin helpers', function() {
    var helpers = {
      blockParams: function(name, options) {
        return name + ':' + options.ids[0] + '\n';
      },
      wycats: function(name, options) {
        return name + ':' + options.data.contextPath + '\n';
      }
    };

    describe('#each', function() {
      it('should track contextPath for arrays', function() {
        var string = '{{#each array}}{{wycats name}}{{/each}}';
        var compileOptions = { trackIds: true };

        var input = { array: [{ name: 'foo' }, { name: 'bar' }] };
        expectTemplate(string)
          .withCompileOptions(compileOptions)
          .withHelpers(helpers)
          .withInput(input)
          .toCompileTo('foo:array.0\nbar:array.1\n');
      });
      it('should track contextPath for keys', function() {
        var string = '{{#each object}}{{wycats name}}{{/each}}';
        var compileOptions = { trackIds: true };

        var input = { object: { foo: { name: 'foo' }, bar: { name: 'bar' } } };
        expectTemplate(string)
          .withCompileOptions(compileOptions)
          .withHelpers(helpers)
          .withInput(input)
          .toCompileTo('foo:object.foo\nbar:object.bar\n');
      });
      it('should handle nesting', function() {
        var string = '{{#each .}}{{#each .}}{{wycats name}}{{/each}}{{/each}}';
        var compileOptions = { trackIds: true };

        var input = { array: [{ name: 'foo' }, { name: 'bar' }] };
        expectTemplate(string)
          .withCompileOptions(compileOptions)
          .withHelpers(helpers)
          .withInput(input)
          .toCompileTo('foo:.array..0\nbar:.array..1\n');
      });
      it('should handle block params', function() {
        var string =
          '{{#each array as |value|}}{{blockParams value.name}}{{/each}}';
        var compileOptions = { trackIds: true };

        var input = { array: [{ name: 'foo' }, { name: 'bar' }] };
        expectTemplate(string)
          .withCompileOptions(compileOptions)
          .withHelpers(helpers)
          .withInput(input)
          .toCompileTo('foo:array.0.name\nbar:array.1.name\n');
      });
    });
    describe('#with', function() {
      it('should track contextPath', function() {
        var string = '{{#with field}}{{wycats name}}{{/with}}';
        var compileOptions = { trackIds: true };

        var input = { field: { name: 'foo' } };
        expectTemplate(string)
          .withCompileOptions(compileOptions)
          .withHelpers(helpers)
          .withInput(input)
          .toCompileTo('foo:field\n');
      });
      it('should handle nesting', function() {
        var string =
          '{{#with bat}}{{#with field}}{{wycats name}}{{/with}}{{/with}}';
        var compileOptions = { trackIds: true };

        var input = { bat: { field: { name: 'foo' } } };
        expectTemplate(string)
          .withCompileOptions(compileOptions)
          .withHelpers(helpers)
          .withInput(input)
          .toCompileTo('foo:bat.field\n');
      });
    });
    describe('#blockHelperMissing', function() {
      it('should track contextPath for arrays', function() {
        var string = '{{#field}}{{wycats name}}{{/field}}';
        var compileOptions = { trackIds: true };

        var input = { field: [{ name: 'foo' }] };
        expectTemplate(string)
          .withCompileOptions(compileOptions)
          .withHelpers(helpers)
          .withInput(input)
          .toCompileTo('foo:field.0\n');
      });
      it('should track contextPath for keys', function() {
        var string = '{{#field}}{{wycats name}}{{/field}}';
        var compileOptions = { trackIds: true };

        var input = { field: { name: 'foo' } };
        expectTemplate(string)
          .withCompileOptions(compileOptions)
          .withHelpers(helpers)
          .withInput(input)
          .toCompileTo('foo:field\n');
      });
      it('should handle nesting', function() {
        var string = '{{#bat}}{{#field}}{{wycats name}}{{/field}}{{/bat}}';
        var compileOptions = { trackIds: true };

        var input = { bat: { field: { name: 'foo' } } };
        expectTemplate(string)
          .withCompileOptions(compileOptions)
          .withHelpers(helpers)
          .withInput(input)
          .toCompileTo('foo:bat.field\n');
      });
    });
  });

  describe('partials', function() {
    var helpers = {
      blockParams: function(name, options) {
        return name + ':' + options.ids[0] + '\n';
      },
      wycats: function(name, options) {
        return name + ':' + options.data.contextPath + '\n';
      }
    };

    it('should pass track id for basic partial', function() {
      var template = CompilerContext.compile(
          'Dudes: {{#dudes}}{{> dude}}{{/dudes}}',
          { trackIds: true }
        ),
        hash = {
          dudes: [
            { name: 'Yehuda', url: 'http://yehuda' },
            { name: 'Alan', url: 'http://alan' }
          ]
        };

      var partials = {
        dude: CompilerContext.compile('{{wycats name}}', { trackIds: true })
      };

      equals(
        template(hash, { helpers: helpers, partials: partials }),
        'Dudes: Yehuda:dudes.0\nAlan:dudes.1\n'
      );
    });

    it('should pass track id for context partial', function() {
      var template = CompilerContext.compile('Dudes: {{> dude dudes}}', {
          trackIds: true
        }),
        hash = {
          dudes: [
            { name: 'Yehuda', url: 'http://yehuda' },
            { name: 'Alan', url: 'http://alan' }
          ]
        };

      var partials = {
        dude: CompilerContext.compile(
          '{{#each this}}{{wycats name}}{{/each}}',
          { trackIds: true }
        )
      };

      equals(
        template(hash, { helpers: helpers, partials: partials }),
        'Dudes: Yehuda:dudes..0\nAlan:dudes..1\n'
      );
    });

    it('should invalidate context for partials with parameters', function() {
      var template = CompilerContext.compile(
          'Dudes: {{#dudes}}{{> dude . bar="foo"}}{{/dudes}}',
          { trackIds: true }
        ),
        hash = {
          dudes: [
            { name: 'Yehuda', url: 'http://yehuda' },
            { name: 'Alan', url: 'http://alan' }
          ]
        };

      var partials = {
        dude: CompilerContext.compile('{{wycats name}}', { trackIds: true })
      };

      equals(
        template(hash, { helpers: helpers, partials: partials }),
        'Dudes: Yehuda:true\nAlan:true\n'
      );
    });
  });
});
