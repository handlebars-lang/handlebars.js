describe('Regressions', function() {
  it('GH-94: Cannot read property of undefined', function() {
    var data = {
      books: [
        {
          title: 'The origin of species',
          author: {
            name: 'Charles Darwin'
          }
        },
        {
          title: 'Lazarillo de Tormes'
        }
      ]
    };
    var string = '{{#books}}{{title}}{{author.name}}{{/books}}';
    shouldCompileTo(
      string,
      data,
      'The origin of speciesCharles DarwinLazarillo de Tormes',
      'Renders without an undefined property error'
    );
  });

  it("GH-150: Inverted sections print when they shouldn't", function() {
    var string = '{{^set}}not set{{/set}} :: {{#set}}set{{/set}}';

    shouldCompileTo(
      string,
      {},
      'not set :: ',
      "inverted sections run when property isn't present in context"
    );
    shouldCompileTo(
      string,
      { set: undefined },
      'not set :: ',
      'inverted sections run when property is undefined'
    );
    shouldCompileTo(
      string,
      { set: false },
      'not set :: ',
      'inverted sections run when property is false'
    );
    shouldCompileTo(
      string,
      { set: true },
      ' :: set',
      "inverted sections don't run when property is true"
    );
  });

  it('GH-158: Using array index twice, breaks the template', function() {
    var string = '{{arr.[0]}}, {{arr.[1]}}';
    var data = { arr: [1, 2] };

    shouldCompileTo(string, data, '1, 2', 'it works as expected');
  });

  it("bug reported by @fat where lambdas weren't being properly resolved", function() {
    var string =
      '<strong>This is a slightly more complicated {{thing}}.</strong>.\n' +
      '{{! Just ignore this business. }}\n' +
      'Check this out:\n' +
      '{{#hasThings}}\n' +
      '<ul>\n' +
      '{{#things}}\n' +
      '<li class={{className}}>{{word}}</li>\n' +
      '{{/things}}</ul>.\n' +
      '{{/hasThings}}\n' +
      '{{^hasThings}}\n' +
      '\n' +
      '<small>Nothing to check out...</small>\n' +
      '{{/hasThings}}';
    var data = {
      thing: function() {
        return 'blah';
      },
      things: [
        { className: 'one', word: '@fat' },
        { className: 'two', word: '@dhg' },
        { className: 'three', word: '@sayrer' }
      ],
      hasThings: function() {
        return true;
      }
    };

    var output =
      '<strong>This is a slightly more complicated blah.</strong>.\n' +
      'Check this out:\n' +
      '<ul>\n' +
      '<li class=one>@fat</li>\n' +
      '<li class=two>@dhg</li>\n' +
      '<li class=three>@sayrer</li>\n' +
      '</ul>.\n';
    shouldCompileTo(string, data, output);
  });

  it('GH-408: Multiple loops fail', function() {
    var context = [
      { name: 'John Doe', location: { city: 'Chicago' } },
      { name: 'Jane Doe', location: { city: 'New York' } }
    ];

    var string = '{{#.}}{{name}}{{/.}}{{#.}}{{name}}{{/.}}{{#.}}{{name}}{{/.}}';

    expectTemplate(string)
      .withInput(context)
      .withMessage('It should output multiple times')
      .toCompileTo('John DoeJane DoeJohn DoeJane DoeJohn DoeJane Doe');
  });

  it('GS-428: Nested if else rendering', function() {
    var succeedingTemplate =
      '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}}  {{#blk}} Expected {{/blk}} {{/inverse}}';
    var failingTemplate =
      '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}} {{#blk}} Expected {{/blk}} {{/inverse}}';

    var helpers = {
      blk: function(block) {
        return block.fn('');
      },
      inverse: function(block) {
        return block.inverse('');
      }
    };

    shouldCompileTo(succeedingTemplate, [{}, helpers], '   Expected  ');
    shouldCompileTo(failingTemplate, [{}, helpers], '  Expected  ');
  });

  it('GH-458: Scoped this identifier', function() {
    shouldCompileTo('{{./foo}}', { foo: 'bar' }, 'bar');
  });

  it('GH-375: Unicode line terminators', function() {
    shouldCompileTo('\u2028', {}, '\u2028');
  });

  it('GH-534: Object prototype aliases', function() {
    /* eslint-disable no-extend-native */
    Object.prototype[0xd834] = true;

    shouldCompileTo('{{foo}}', { foo: 'bar' }, 'bar');

    delete Object.prototype[0xd834];
    /* eslint-enable no-extend-native */
  });

  it('GH-437: Matching escaping', function() {
    expectTemplate('{{{a}}').toThrow(Error, /Parse error on/);
    expectTemplate('{{a}}}').toThrow(Error, /Parse error on/);
  });

  it('GH-676: Using array in escaping mustache fails', function() {
    var string = '{{arr}}';
    var data = { arr: [1, 2] };

    shouldCompileTo(string, data, data.arr.toString(), 'it works as expected');
  });

  it('Mustache man page', function() {
    var string =
      'Hello {{name}}. You have just won ${{value}}!{{#in_ca}} Well, ${{taxed_value}}, after taxes.{{/in_ca}}';
    var data = {
      name: 'Chris',
      value: 10000,
      taxed_value: 10000 - 10000 * 0.4,
      in_ca: true
    };

    shouldCompileTo(
      string,
      data,
      'Hello Chris. You have just won $10000! Well, $6000, after taxes.',
      'the hello world mustache example works'
    );
  });

  it('GH-731: zero context rendering', function() {
    shouldCompileTo(
      '{{#foo}} This is {{bar}} ~ {{/foo}}',
      { foo: 0, bar: 'OK' },
      ' This is  ~ '
    );
  });

  it('GH-820: zero pathed rendering', function() {
    shouldCompileTo('{{foo.bar}}', { foo: 0 }, '');
  });

  it('GH-837: undefined values for helpers', function() {
    var helpers = {
      str: function(value) {
        return value + '';
      }
    };

    shouldCompileTo('{{str bar.baz}}', [{}, helpers], 'undefined');
  });

  it('GH-926: Depths and de-dupe', function() {
    var context = {
      name: 'foo',
      data: [1],
      notData: [1]
    };

    var string =
      '{{#if dater}}{{#each data}}{{../name}}{{/each}}{{else}}{{#each notData}}{{../name}}{{/each}}{{/if}}';

    expectTemplate(string)
      .withInput(context)
      .toCompileTo('foo');
  });

  it('GH-1021: Each empty string key', function() {
    var data = {
      '': 'foo',
      name: 'Chris',
      value: 10000
    };

    shouldCompileTo(
      '{{#each data}}Key: {{@key}}\n{{/each}}',
      { data: data },
      'Key: \nKey: name\nKey: value\n'
    );
  });

  it('GH-1054: Should handle simple safe string responses', function() {
    var root = '{{#wrap}}{{>partial}}{{/wrap}}';
    var partials = {
      partial: '{{#wrap}}<partial>{{/wrap}}'
    };
    var helpers = {
      wrap: function(options) {
        return new Handlebars.SafeString(options.fn());
      }
    };

    shouldCompileToWithPartials(
      root,
      [{}, helpers, partials],
      true,
      '<partial>'
    );
  });

  it('GH-1065: Sparse arrays', function() {
    var array = [];
    array[1] = 'foo';
    array[3] = 'bar';
    shouldCompileTo(
      '{{#each array}}{{@index}}{{.}}{{/each}}',
      { array: array },
      '1foo3bar'
    );
  });

  it('GH-1093: Undefined helper context', function() {
    var obj = { foo: undefined, bar: 'bat' };
    var helpers = {
      helper: function() {
        // It's valid to execute a block against an undefined context, but
        // helpers can not do so, so we expect to have an empty object here;
        for (var name in this) {
          if (Object.prototype.hasOwnProperty.call(this, name)) {
            return 'found';
          }
        }
        // And to make IE happy, check for the known string as length is not enumerated.
        return this === 'bat' ? 'found' : 'not';
      }
    };

    shouldCompileTo(
      '{{#each obj}}{{{helper}}}{{.}}{{/each}}',
      [{ obj: obj }, helpers],
      'notfoundbat'
    );
  });

  it('should support multiple levels of inline partials', function() {
    var string =
      '{{#> layout}}{{#*inline "subcontent"}}subcontent{{/inline}}{{/layout}}';
    var partials = {
      doctype: 'doctype{{> content}}',
      layout:
        '{{#> doctype}}{{#*inline "content"}}layout{{> subcontent}}{{/inline}}{{/doctype}}'
    };
    shouldCompileToWithPartials(
      string,
      [{}, {}, partials],
      true,
      'doctypelayoutsubcontent'
    );
  });
  it('GH-1089: should support failover content in multiple levels of inline partials', function() {
    var string = '{{#> layout}}{{/layout}}';
    var partials = {
      doctype: 'doctype{{> content}}',
      layout:
        '{{#> doctype}}{{#*inline "content"}}layout{{#> subcontent}}subcontent{{/subcontent}}{{/inline}}{{/doctype}}'
    };
    shouldCompileToWithPartials(
      string,
      [{}, {}, partials],
      true,
      'doctypelayoutsubcontent'
    );
  });
  it('GH-1099: should support greater than 3 nested levels of inline partials', function() {
    var string = '{{#> layout}}Outer{{/layout}}';
    var partials = {
      layout: '{{#> inner}}Inner{{/inner}}{{> @partial-block }}',
      inner: ''
    };
    shouldCompileToWithPartials(string, [{}, {}, partials], true, 'Outer');
  });

  it('GH-1135 : Context handling within each iteration', function() {
    var obj = { array: [1], name: 'John' };
    var helpers = {
      myif: function(conditional, options) {
        if (conditional) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      }
    };

    shouldCompileTo(
      '{{#each array}}\n' +
        ' 1. IF: {{#if true}}{{../name}}-{{../../name}}-{{../../../name}}{{/if}}\n' +
        ' 2. MYIF: {{#myif true}}{{../name}}={{../../name}}={{../../../name}}{{/myif}}\n' +
        '{{/each}}',
      [obj, helpers],
      ' 1. IF: John--\n' + ' 2. MYIF: John==\n'
    );
  });

  it('GH-1186: Support block params for existing programs', function() {
    var string =
      '{{#*inline "test"}}{{> @partial-block }}{{/inline}}' +
      '{{#>test }}{{#each listOne as |item|}}{{ item }}{{/each}}{{/test}}' +
      '{{#>test }}{{#each listTwo as |item|}}{{ item }}{{/each}}{{/test}}';

    shouldCompileTo(string, { listOne: ['a'], listTwo: ['b'] }, 'ab', '');
  });

  it('GH-1319: "unless" breaks when "each" value equals "null"', function() {
    var string =
      '{{#each list}}{{#unless ./prop}}parent={{../value}} {{/unless}}{{/each}}';
    shouldCompileTo(
      string,
      { value: 'parent', list: [null, 'a'] },
      'parent=parent parent=parent ',
      ''
    );
  });

  it('GH-1341: 4.0.7 release breaks {{#if @partial-block}} usage', function() {
    var string = 'template {{>partial}} template';
    var partials = {
      partialWithBlock:
        '{{#if @partial-block}} block {{> @partial-block}} block {{/if}}',
      partial: '{{#> partialWithBlock}} partial {{/partialWithBlock}}'
    };
    shouldCompileToWithPartials(
      string,
      [{}, {}, partials],
      true,
      'template  block  partial  block  template'
    );
  });

  describe('GH-1561: 4.3.x should still work with precompiled templates from 4.0.0 <= x < 4.3.0', function() {
    it('should compile and execute templates', function() {
      var newHandlebarsInstance = Handlebars.create();

      registerTemplate(newHandlebarsInstance, compiledTemplateVersion7());
      newHandlebarsInstance.registerHelper('loud', function(value) {
        return value.toUpperCase();
      });
      var result = newHandlebarsInstance.templates['test.hbs']({
        name: 'yehuda'
      });
      equals(result.trim(), 'YEHUDA');
    });

    it('should call "helperMissing" if a helper is missing', function() {
      var newHandlebarsInstance = Handlebars.create();

      shouldThrow(
        function() {
          registerTemplate(newHandlebarsInstance, compiledTemplateVersion7());
          newHandlebarsInstance.templates['test.hbs']({});
        },
        Handlebars.Exception,
        'Missing helper: "loud"'
      );
    });

    it('should pass "options.lookupProperty" to "lookup"-helper, even with old templates', function() {
      var newHandlebarsInstance = Handlebars.create();
      registerTemplate(
        newHandlebarsInstance,
        compiledTemplateVersion7_usingLookupHelper()
      );

      newHandlebarsInstance.templates['test.hbs']({});

      expect(
        newHandlebarsInstance.templates['test.hbs']({
          property: 'a',
          test: { a: 'b' }
        })
      ).to.equal('b');
    });

    function registerTemplate(Handlebars, compileTemplate) {
      var template = Handlebars.template,
        templates = (Handlebars.templates = Handlebars.templates || {});
      templates['test.hbs'] = template(compileTemplate);
    }

    function compiledTemplateVersion7() {
      return {
        compiler: [7, '>= 4.0.0'],
        main: function(container, depth0, helpers, partials, data) {
          return (
            container.escapeExpression(
              (
                helpers.loud ||
                (depth0 && depth0.loud) ||
                helpers.helperMissing
              ).call(
                depth0 != null ? depth0 : container.nullContext || {},
                depth0 != null ? depth0.name : depth0,
                { name: 'loud', hash: {}, data: data }
              )
            ) + '\n\n'
          );
        },
        useData: true
      };
    }

    function compiledTemplateVersion7_usingLookupHelper() {
      // This is the compiled version of "{{lookup test property}}"
      return {
        compiler: [7, '>= 4.0.0'],
        main: function(container, depth0, helpers, partials, data) {
          return container.escapeExpression(
            helpers.lookup.call(
              depth0 != null ? depth0 : container.nullContext || {},
              depth0 != null ? depth0.test : depth0,
              depth0 != null ? depth0.property : depth0,
              {
                name: 'lookup',
                hash: {},
                data: data
              }
            )
          );
        },
        useData: true
      };
    }
  });

  it('should allow hash with protected array names', function() {
    var obj = { array: [1], name: 'John' };
    var helpers = {
      helpa: function(options) {
        return options.hash.length;
      }
    };

    shouldCompileTo('{{helpa length="foo"}}', [obj, helpers], 'foo');
  });

  describe('GH-1598: Performance degradation for partials since v4.3.0', function() {
    // Do not run test for runs without compiler
    if (!Handlebars.compile) {
      return;
    }

    var newHandlebarsInstance;
    beforeEach(function() {
      newHandlebarsInstance = Handlebars.create();
    });
    afterEach(function() {
      sinon.restore();
    });

    it('should only compile global partials once', function() {
      var templateSpy = sinon.spy(newHandlebarsInstance, 'template');
      newHandlebarsInstance.registerPartial({
        dude: 'I am a partial'
      });
      var string = 'Dudes: {{> dude}} {{> dude}}';
      newHandlebarsInstance.compile(string)(); // This should compile template + partial once
      newHandlebarsInstance.compile(string)(); // This should only compile template
      equal(templateSpy.callCount, 3);
      sinon.restore();
    });
  });

  describe("GH-1639: TypeError: Cannot read property 'apply' of undefined\" when handlebars version > 4.6.0 (undocumented, deprecated usage)", function() {
    it('should treat undefined helpers like non-existing helpers', function() {
      expectTemplate('{{foo}}')
        .withHelper('foo', undefined)
        .withInput({ foo: 'bar' })
        .toCompileTo('bar');
    });
  });
});
