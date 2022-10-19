describe('helpers', function () {
  it('helper with complex lookup$', function () {
    expectTemplate('{{#goodbyes}}{{{link ../prefix}}}{{/goodbyes}}')
      .withInput({
        prefix: '/root',
        goodbyes: [{ text: 'Goodbye', url: 'goodbye' }],
      })
      .withHelper('link', function (prefix) {
        return (
          '<a href="' + prefix + '/' + this.url + '">' + this.text + '</a>'
        );
      })
      .toCompileTo('<a href="/root/goodbye">Goodbye</a>');
  });

  it('helper for raw block gets raw content', function () {
    expectTemplate('{{{{raw}}}} {{test}} {{{{/raw}}}}')
      .withInput({ test: 'hello' })
      .withHelper('raw', function (options) {
        return options.fn();
      })
      .withMessage('raw block helper gets raw content')
      .toCompileTo(' {{test}} ');
  });

  it('helper for raw block gets parameters', function () {
    expectTemplate('{{{{raw 1 2 3}}}} {{test}} {{{{/raw}}}}')
      .withInput({ test: 'hello' })
      .withHelper('raw', function (a, b, c, options) {
        return options.fn() + a + b + c;
      })
      .withMessage('raw block helper gets raw content')
      .toCompileTo(' {{test}} 123');
  });

  describe('raw block parsing (with identity helper-function)', function () {
    function runWithIdentityHelper(template, expected) {
      expectTemplate(template)
        .withHelper('identity', function (options) {
          return options.fn();
        })
        .toCompileTo(expected);
    }

    it('helper for nested raw block gets raw content', function () {
      runWithIdentityHelper(
        '{{{{identity}}}} {{{{b}}}} {{{{/b}}}} {{{{/identity}}}}',
        ' {{{{b}}}} {{{{/b}}}} '
      );
    });

    it('helper for nested raw block works with empty content', function () {
      runWithIdentityHelper('{{{{identity}}}}{{{{/identity}}}}', '');
    });

    xit('helper for nested raw block works if nested raw blocks are broken', function () {
      // This test was introduced in 4.4.4, but it was not the actual problem that lead to the patch release
      // The test is deactivated, because in 3.x this template cases an exception and it also does not work in 4.4.3
      // If anyone can make this template work without breaking everything else, then go for it,
      // but for now, this is just a known bug, that will be documented.
      runWithIdentityHelper(
        '{{{{identity}}}} {{{{a}}}} {{{{ {{{{/ }}}} }}}} {{{{/identity}}}}',
        ' {{{{a}}}} {{{{ {{{{/ }}}} }}}} '
      );
    });

    it('helper for nested raw block closes after first matching close', function () {
      runWithIdentityHelper(
        '{{{{identity}}}}abc{{{{/identity}}}} {{{{identity}}}}abc{{{{/identity}}}}',
        'abc abc'
      );
    });

    it('helper for nested raw block throw exception when with missing closing braces', function () {
      var string = '{{{{a}}}} {{{{/a';
      expectTemplate(string).toThrow();
    });
  });

  it('helper block with identical context', function () {
    expectTemplate('{{#goodbyes}}{{name}}{{/goodbyes}}')
      .withInput({ name: 'Alan' })
      .withHelper('goodbyes', function (options) {
        var out = '';
        var byes = ['Goodbye', 'goodbye', 'GOODBYE'];
        for (var i = 0, j = byes.length; i < j; i++) {
          out += byes[i] + ' ' + options.fn(this) + '! ';
        }
        return out;
      })
      .toCompileTo('Goodbye Alan! goodbye Alan! GOODBYE Alan! ');
  });

  it('helper block with complex lookup expression', function () {
    expectTemplate('{{#goodbyes}}{{../name}}{{/goodbyes}}')
      .withInput({ name: 'Alan' })
      .withHelper('goodbyes', function (options) {
        var out = '';
        var byes = ['Goodbye', 'goodbye', 'GOODBYE'];
        for (var i = 0, j = byes.length; i < j; i++) {
          out += byes[i] + ' ' + options.fn({}) + '! ';
        }
        return out;
      })
      .toCompileTo('Goodbye Alan! goodbye Alan! GOODBYE Alan! ');
  });

  it('helper with complex lookup and nested template', function () {
    expectTemplate(
      '{{#goodbyes}}{{#link ../prefix}}{{text}}{{/link}}{{/goodbyes}}'
    )
      .withInput({
        prefix: '/root',
        goodbyes: [{ text: 'Goodbye', url: 'goodbye' }],
      })
      .withHelper('link', function (prefix, options) {
        return (
          '<a href="' +
          prefix +
          '/' +
          this.url +
          '">' +
          options.fn(this) +
          '</a>'
        );
      })
      .toCompileTo('<a href="/root/goodbye">Goodbye</a>');
  });

  it('helper with complex lookup and nested template in VM+Compiler', function () {
    expectTemplate(
      '{{#goodbyes}}{{#link ../prefix}}{{text}}{{/link}}{{/goodbyes}}'
    )
      .withInput({
        prefix: '/root',
        goodbyes: [{ text: 'Goodbye', url: 'goodbye' }],
      })
      .withHelper('link', function (prefix, options) {
        return (
          '<a href="' +
          prefix +
          '/' +
          this.url +
          '">' +
          options.fn(this) +
          '</a>'
        );
      })
      .toCompileTo('<a href="/root/goodbye">Goodbye</a>');
  });

  it('helper returning undefined value', function () {
    expectTemplate(' {{nothere}}')
      .withHelpers({
        nothere: function () {},
      })
      .toCompileTo(' ');

    expectTemplate(' {{#nothere}}{{/nothere}}')
      .withHelpers({
        nothere: function () {},
      })
      .toCompileTo(' ');
  });

  it('block helper', function () {
    expectTemplate('{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!')
      .withInput({ world: 'world' })
      .withHelper('goodbyes', function (options) {
        return options.fn({ text: 'GOODBYE' });
      })
      .withMessage('Block helper executed')
      .toCompileTo('GOODBYE! cruel world!');
  });

  it('block helper staying in the same context', function () {
    expectTemplate('{{#form}}<p>{{name}}</p>{{/form}}')
      .withInput({ name: 'Yehuda' })
      .withHelper('form', function (options) {
        return '<form>' + options.fn(this) + '</form>';
      })
      .withMessage('Block helper executed with current context')
      .toCompileTo('<form><p>Yehuda</p></form>');
  });

  it('block helper should have context in this', function () {
    function link(options) {
      return '<a href="/people/' + this.id + '">' + options.fn(this) + '</a>';
    }

    expectTemplate(
      '<ul>{{#people}}<li>{{#link}}{{name}}{{/link}}</li>{{/people}}</ul>'
    )
      .withInput({
        people: [
          { name: 'Alan', id: 1 },
          { name: 'Yehuda', id: 2 },
        ],
      })
      .withHelper('link', link)
      .toCompileTo(
        '<ul><li><a href="/people/1">Alan</a></li><li><a href="/people/2">Yehuda</a></li></ul>'
      );
  });

  it('block helper for undefined value', function () {
    expectTemplate("{{#empty}}shouldn't render{{/empty}}").toCompileTo('');
  });

  it('block helper passing a new context', function () {
    expectTemplate('{{#form yehuda}}<p>{{name}}</p>{{/form}}')
      .withInput({ yehuda: { name: 'Yehuda' } })
      .withHelper('form', function (context, options) {
        return '<form>' + options.fn(context) + '</form>';
      })
      .withMessage('Context variable resolved')
      .toCompileTo('<form><p>Yehuda</p></form>');
  });

  it('block helper passing a complex path context', function () {
    expectTemplate('{{#form yehuda/cat}}<p>{{name}}</p>{{/form}}')
      .withInput({ yehuda: { name: 'Yehuda', cat: { name: 'Harold' } } })
      .withHelper('form', function (context, options) {
        return '<form>' + options.fn(context) + '</form>';
      })
      .withMessage('Complex path variable resolved')
      .toCompileTo('<form><p>Harold</p></form>');
  });

  it('nested block helpers', function () {
    expectTemplate(
      '{{#form yehuda}}<p>{{name}}</p>{{#link}}Hello{{/link}}{{/form}}'
    )
      .withInput({
        yehuda: { name: 'Yehuda' },
      })
      .withHelper('link', function (options) {
        return '<a href="' + this.name + '">' + options.fn(this) + '</a>';
      })
      .withHelper('form', function (context, options) {
        return '<form>' + options.fn(context) + '</form>';
      })
      .withMessage('Both blocks executed')
      .toCompileTo('<form><p>Yehuda</p><a href="Yehuda">Hello</a></form>');
  });

  it('block helper inverted sections', function () {
    var string = "{{#list people}}{{name}}{{^}}<em>Nobody's here</em>{{/list}}";
    function list(context, options) {
      if (context.length > 0) {
        var out = '<ul>';
        for (var i = 0, j = context.length; i < j; i++) {
          out += '<li>';
          out += options.fn(context[i]);
          out += '</li>';
        }
        out += '</ul>';
        return out;
      } else {
        return '<p>' + options.inverse(this) + '</p>';
      }
    }

    // the meaning here may be kind of hard to catch, but list.not is always called,
    // so we should see the output of both
    expectTemplate(string)
      .withInput({ people: [{ name: 'Alan' }, { name: 'Yehuda' }] })
      .withHelpers({ list: list })
      .withMessage('an inverse wrapper is passed in as a new context')
      .toCompileTo('<ul><li>Alan</li><li>Yehuda</li></ul>');

    expectTemplate(string)
      .withInput({ people: [] })
      .withHelpers({ list: list })
      .withMessage('an inverse wrapper can be optionally called')
      .toCompileTo("<p><em>Nobody's here</em></p>");

    expectTemplate('{{#list people}}Hello{{^}}{{message}}{{/list}}')
      .withInput({
        people: [],
        message: "Nobody's here",
      })
      .withHelpers({ list: list })
      .withMessage('the context of an inverse is the parent of the block')
      .toCompileTo('<p>Nobody&#x27;s here</p>');
  });

  it('pathed lambas with parameters', function () {
    var hash = {
      helper: function () {
        return 'winning';
      },
    };
    hash.hash = hash;
    var helpers = {
      './helper': function () {
        return 'fail';
      },
    };

    expectTemplate('{{./helper 1}}')
      .withInput(hash)
      .withHelpers(helpers)
      .toCompileTo('winning');

    expectTemplate('{{hash/helper 1}}')
      .withInput(hash)
      .withHelpers(helpers)
      .toCompileTo('winning');
  });

  describe('helpers hash', function () {
    it('providing a helpers hash', function () {
      expectTemplate('Goodbye {{cruel}} {{world}}!')
        .withInput({ cruel: 'cruel' })
        .withHelpers({
          world: function () {
            return 'world';
          },
        })
        .withMessage('helpers hash is available')
        .toCompileTo('Goodbye cruel world!');

      expectTemplate('Goodbye {{#iter}}{{cruel}} {{world}}{{/iter}}!')
        .withInput({ iter: [{ cruel: 'cruel' }] })
        .withHelpers({
          world: function () {
            return 'world';
          },
        })
        .withMessage('helpers hash is available inside other blocks')
        .toCompileTo('Goodbye cruel world!');
    });

    it('in cases of conflict, helpers win', function () {
      expectTemplate('{{{lookup}}}')
        .withInput({ lookup: 'Explicit' })
        .withHelpers({
          lookup: function () {
            return 'helpers';
          },
        })
        .withMessage('helpers hash has precedence escaped expansion')
        .toCompileTo('helpers');

      expectTemplate('{{lookup}}')
        .withInput({ lookup: 'Explicit' })
        .withHelpers({
          lookup: function () {
            return 'helpers';
          },
        })
        .withMessage('helpers hash has precedence simple expansion')
        .toCompileTo('helpers');
    });

    it('the helpers hash is available is nested contexts', function () {
      expectTemplate('{{#outer}}{{#inner}}{{helper}}{{/inner}}{{/outer}}')
        .withInput({ outer: { inner: { unused: [] } } })
        .withHelpers({
          helper: function () {
            return 'helper';
          },
        })
        .withMessage('helpers hash is available in nested contexts.')
        .toCompileTo('helper');
    });

    it('the helper hash should augment the global hash', function () {
      handlebarsEnv.registerHelper('test_helper', function () {
        return 'found it!';
      });

      expectTemplate(
        '{{test_helper}} {{#if cruel}}Goodbye {{cruel}} {{world}}!{{/if}}'
      )
        .withInput({ cruel: 'cruel' })
        .withHelpers({
          world: function () {
            return 'world!';
          },
        })
        .toCompileTo('found it! Goodbye cruel world!!');
    });
  });

  describe('registration', function () {
    it('unregisters', function () {
      handlebarsEnv.helpers = {};

      handlebarsEnv.registerHelper('foo', function () {
        return 'fail';
      });
      handlebarsEnv.unregisterHelper('foo');
      equals(handlebarsEnv.helpers.foo, undefined);
    });

    it('allows multiple globals', function () {
      var helpers = handlebarsEnv.helpers;
      handlebarsEnv.helpers = {};

      handlebarsEnv.registerHelper({
        if: helpers['if'],
        world: function () {
          return 'world!';
        },
        testHelper: function () {
          return 'found it!';
        },
      });

      expectTemplate(
        '{{testHelper}} {{#if cruel}}Goodbye {{cruel}} {{world}}!{{/if}}'
      )
        .withInput({ cruel: 'cruel' })
        .toCompileTo('found it! Goodbye cruel world!!');
    });

    it('fails with multiple and args', function () {
      shouldThrow(
        function () {
          handlebarsEnv.registerHelper(
            {
              world: function () {
                return 'world!';
              },
              testHelper: function () {
                return 'found it!';
              },
            },
            {}
          );
        },
        Error,
        'Arg not supported with multiple helpers'
      );
    });
  });

  it('decimal number literals work', function () {
    expectTemplate('Message: {{hello -1.2 1.2}}')
      .withHelper('hello', function (times, times2) {
        if (typeof times !== 'number') {
          times = 'NaN';
        }
        if (typeof times2 !== 'number') {
          times2 = 'NaN';
        }
        return 'Hello ' + times + ' ' + times2 + ' times';
      })
      .withMessage('template with a negative integer literal')
      .toCompileTo('Message: Hello -1.2 1.2 times');
  });

  it('negative number literals work', function () {
    expectTemplate('Message: {{hello -12}}')
      .withHelper('hello', function (times) {
        if (typeof times !== 'number') {
          times = 'NaN';
        }
        return 'Hello ' + times + ' times';
      })
      .withMessage('template with a negative integer literal')
      .toCompileTo('Message: Hello -12 times');
  });

  describe('String literal parameters', function () {
    it('simple literals work', function () {
      expectTemplate('Message: {{hello "world" 12 true false}}')
        .withHelper('hello', function (param, times, bool1, bool2) {
          if (typeof times !== 'number') {
            times = 'NaN';
          }
          if (typeof bool1 !== 'boolean') {
            bool1 = 'NaB';
          }
          if (typeof bool2 !== 'boolean') {
            bool2 = 'NaB';
          }
          return (
            'Hello ' + param + ' ' + times + ' times: ' + bool1 + ' ' + bool2
          );
        })
        .withMessage('template with a simple String literal')
        .toCompileTo('Message: Hello world 12 times: true false');
    });

    it('using a quote in the middle of a parameter raises an error', function () {
      expectTemplate('Message: {{hello wo"rld"}}').toThrow(Error);
    });

    it('escaping a String is possible', function () {
      expectTemplate('Message: {{{hello "\\"world\\""}}}')
        .withHelper('hello', function (param) {
          return 'Hello ' + param;
        })
        .withMessage('template with an escaped String literal')
        .toCompileTo('Message: Hello "world"');
    });

    it("it works with ' marks", function () {
      expectTemplate('Message: {{{hello "Alan\'s world"}}}')
        .withHelper('hello', function (param) {
          return 'Hello ' + param;
        })
        .withMessage("template with a ' mark")
        .toCompileTo("Message: Hello Alan's world");
    });
  });

  it('negative number literals work', function () {
    expectTemplate('Message: {{hello -12}}')
      .withHelper('hello', function (times) {
        if (typeof times !== 'number') {
          times = 'NaN';
        }
        return 'Hello ' + times + ' times';
      })
      .withMessage('template with a negative integer literal')
      .toCompileTo('Message: Hello -12 times');
  });

  describe('multiple parameters', function () {
    it('simple multi-params work', function () {
      expectTemplate('Message: {{goodbye cruel world}}')
        .withInput({ cruel: 'cruel', world: 'world' })
        .withHelper('goodbye', function (cruel, world) {
          return 'Goodbye ' + cruel + ' ' + world;
        })
        .withMessage('regular helpers with multiple params')
        .toCompileTo('Message: Goodbye cruel world');
    });

    it('block multi-params work', function () {
      expectTemplate(
        'Message: {{#goodbye cruel world}}{{greeting}} {{adj}} {{noun}}{{/goodbye}}'
      )
        .withInput({ cruel: 'cruel', world: 'world' })
        .withHelper('goodbye', function (cruel, world, options) {
          return options.fn({ greeting: 'Goodbye', adj: cruel, noun: world });
        })
        .withMessage('block helpers with multiple params')
        .toCompileTo('Message: Goodbye cruel world');
    });
  });

  describe('hash', function () {
    it('helpers can take an optional hash', function () {
      expectTemplate('{{goodbye cruel="CRUEL" world="WORLD" times=12}}')
        .withHelper('goodbye', function (options) {
          return (
            'GOODBYE ' +
            options.hash.cruel +
            ' ' +
            options.hash.world +
            ' ' +
            options.hash.times +
            ' TIMES'
          );
        })
        .withMessage('Helper output hash')
        .toCompileTo('GOODBYE CRUEL WORLD 12 TIMES');
    });

    it('helpers can take an optional hash with booleans', function () {
      function goodbye(options) {
        if (options.hash.print === true) {
          return 'GOODBYE ' + options.hash.cruel + ' ' + options.hash.world;
        } else if (options.hash.print === false) {
          return 'NOT PRINTING';
        } else {
          return 'THIS SHOULD NOT HAPPEN';
        }
      }

      expectTemplate('{{goodbye cruel="CRUEL" world="WORLD" print=true}}')
        .withHelper('goodbye', goodbye)
        .withMessage('Helper output hash')
        .toCompileTo('GOODBYE CRUEL WORLD');

      expectTemplate('{{goodbye cruel="CRUEL" world="WORLD" print=false}}')
        .withHelper('goodbye', goodbye)
        .withMessage('Boolean helper parameter honored')
        .toCompileTo('NOT PRINTING');
    });

    it('block helpers can take an optional hash', function () {
      expectTemplate('{{#goodbye cruel="CRUEL" times=12}}world{{/goodbye}}')
        .withHelper('goodbye', function (options) {
          return (
            'GOODBYE ' +
            options.hash.cruel +
            ' ' +
            options.fn(this) +
            ' ' +
            options.hash.times +
            ' TIMES'
          );
        })
        .withMessage('Hash parameters output')
        .toCompileTo('GOODBYE CRUEL world 12 TIMES');
    });

    it('block helpers can take an optional hash with single quoted stings', function () {
      expectTemplate('{{#goodbye cruel="CRUEL" times=12}}world{{/goodbye}}')
        .withHelper('goodbye', function (options) {
          return (
            'GOODBYE ' +
            options.hash.cruel +
            ' ' +
            options.fn(this) +
            ' ' +
            options.hash.times +
            ' TIMES'
          );
        })
        .withMessage('Hash parameters output')
        .toCompileTo('GOODBYE CRUEL world 12 TIMES');
    });

    it('block helpers can take an optional hash with booleans', function () {
      function goodbye(options) {
        if (options.hash.print === true) {
          return 'GOODBYE ' + options.hash.cruel + ' ' + options.fn(this);
        } else if (options.hash.print === false) {
          return 'NOT PRINTING';
        } else {
          return 'THIS SHOULD NOT HAPPEN';
        }
      }

      expectTemplate('{{#goodbye cruel="CRUEL" print=true}}world{{/goodbye}}')
        .withHelper('goodbye', goodbye)
        .withMessage('Boolean hash parameter honored')
        .toCompileTo('GOODBYE CRUEL world');

      expectTemplate('{{#goodbye cruel="CRUEL" print=false}}world{{/goodbye}}')
        .withHelper('goodbye', goodbye)
        .withMessage('Boolean hash parameter honored')
        .toCompileTo('NOT PRINTING');
    });
  });

  describe('helperMissing', function () {
    it('if a context is not found, helperMissing is used', function () {
      expectTemplate('{{hello}} {{link_to world}}').toThrow(
        /Missing helper: "link_to"/
      );
    });

    it('if a context is not found, custom helperMissing is used', function () {
      expectTemplate('{{hello}} {{link_to world}}')
        .withInput({ hello: 'Hello', world: 'world' })
        .withHelper('helperMissing', function (mesg, options) {
          if (options.name === 'link_to') {
            return new Handlebars.SafeString('<a>' + mesg + '</a>');
          }
        })
        .toCompileTo('Hello <a>world</a>');
    });

    it('if a value is not found, custom helperMissing is used', function () {
      expectTemplate('{{hello}} {{link_to}}')
        .withInput({ hello: 'Hello', world: 'world' })
        .withHelper('helperMissing', function (options) {
          if (options.name === 'link_to') {
            return new Handlebars.SafeString('<a>winning</a>');
          }
        })
        .toCompileTo('Hello <a>winning</a>');
    });
  });

  describe('knownHelpers', function () {
    it('Known helper should render helper', function () {
      expectTemplate('{{hello}}')
        .withCompileOptions({
          knownHelpers: { hello: true },
        })
        .withHelper('hello', function () {
          return 'foo';
        })
        .toCompileTo('foo');
    });

    it('Unknown helper in knownHelpers only mode should be passed as undefined', function () {
      expectTemplate('{{typeof hello}}')
        .withCompileOptions({
          knownHelpers: { typeof: true },
          knownHelpersOnly: true,
        })
        .withHelper('typeof', function (arg) {
          return typeof arg;
        })
        .withHelper('hello', function () {
          return 'foo';
        })
        .toCompileTo('undefined');
    });

    it('Builtin helpers available in knownHelpers only mode', function () {
      expectTemplate('{{#unless foo}}bar{{/unless}}')
        .withCompileOptions({
          knownHelpersOnly: true,
        })
        .toCompileTo('bar');
    });

    it('Field lookup works in knownHelpers only mode', function () {
      expectTemplate('{{foo}}')
        .withCompileOptions({
          knownHelpersOnly: true,
        })
        .withInput({ foo: 'bar' })
        .toCompileTo('bar');
    });

    it('Conditional blocks work in knownHelpers only mode', function () {
      expectTemplate('{{#foo}}bar{{/foo}}')
        .withCompileOptions({
          knownHelpersOnly: true,
        })
        .withInput({ foo: 'baz' })
        .toCompileTo('bar');
    });

    it('Invert blocks work in knownHelpers only mode', function () {
      expectTemplate('{{^foo}}bar{{/foo}}')
        .withCompileOptions({
          knownHelpersOnly: true,
        })
        .withInput({ foo: false })
        .toCompileTo('bar');
    });

    it('Functions are bound to the context in knownHelpers only mode', function () {
      expectTemplate('{{foo}}')
        .withCompileOptions({
          knownHelpersOnly: true,
        })
        .withInput({
          foo: function () {
            return this.bar;
          },
          bar: 'bar',
        })
        .toCompileTo('bar');
    });

    it('Unknown helper call in knownHelpers only mode should throw', function () {
      expectTemplate('{{typeof hello}}')
        .withCompileOptions({ knownHelpersOnly: true })
        .toThrow(Error);
    });
  });

  describe('blockHelperMissing', function () {
    it('lambdas are resolved by blockHelperMissing, not handlebars proper', function () {
      expectTemplate('{{#truthy}}yep{{/truthy}}')
        .withInput({
          truthy: function () {
            return true;
          },
        })
        .toCompileTo('yep');
    });

    it('lambdas resolved by blockHelperMissing are bound to the context', function () {
      expectTemplate('{{#truthy}}yep{{/truthy}}')
        .withInput({
          truthy: function () {
            return this.truthiness();
          },
          truthiness: function () {
            return false;
          },
        })
        .toCompileTo('');
    });
  });

  describe('name field', function () {
    var helpers = {
      blockHelperMissing: function () {
        return 'missing: ' + arguments[arguments.length - 1].name;
      },
      helperMissing: function () {
        return 'helper missing: ' + arguments[arguments.length - 1].name;
      },
      helper: function () {
        return 'ran: ' + arguments[arguments.length - 1].name;
      },
    };

    it('should include in ambiguous mustache calls', function () {
      expectTemplate('{{helper}}')
        .withHelpers(helpers)
        .toCompileTo('ran: helper');
    });

    it('should include in helper mustache calls', function () {
      expectTemplate('{{helper 1}}')
        .withHelpers(helpers)
        .toCompileTo('ran: helper');
    });

    it('should include in ambiguous block calls', function () {
      expectTemplate('{{#helper}}{{/helper}}')
        .withHelpers(helpers)
        .toCompileTo('ran: helper');
    });

    it('should include in simple block calls', function () {
      expectTemplate('{{#./helper}}{{/./helper}}')
        .withHelpers(helpers)
        .toCompileTo('missing: ./helper');
    });

    it('should include in helper block calls', function () {
      expectTemplate('{{#helper 1}}{{/helper}}')
        .withHelpers(helpers)
        .toCompileTo('ran: helper');
    });

    it('should include in known helper calls', function () {
      expectTemplate('{{helper}}')
        .withCompileOptions({
          knownHelpers: { helper: true },
          knownHelpersOnly: true,
        })
        .withHelpers(helpers)
        .toCompileTo('ran: helper');
    });

    it('should include full id', function () {
      expectTemplate('{{#foo.helper}}{{/foo.helper}}')
        .withInput({ foo: {} })
        .withHelpers(helpers)
        .toCompileTo('missing: foo.helper');
    });

    it('should include full id if a hash is passed', function () {
      expectTemplate('{{#foo.helper bar=baz}}{{/foo.helper}}')
        .withInput({ foo: {} })
        .withHelpers(helpers)
        .toCompileTo('helper missing: foo.helper');
    });
  });

  describe('name conflicts', function () {
    it('helpers take precedence over same-named context properties', function () {
      expectTemplate('{{goodbye}} {{cruel world}}')
        .withHelper('goodbye', function () {
          return this.goodbye.toUpperCase();
        })
        .withHelper('cruel', function (world) {
          return 'cruel ' + world.toUpperCase();
        })
        .withInput({
          goodbye: 'goodbye',
          world: 'world',
        })
        .withMessage('Helper executed')
        .toCompileTo('GOODBYE cruel WORLD');
    });

    it('helpers take precedence over same-named context properties$', function () {
      expectTemplate('{{#goodbye}} {{cruel world}}{{/goodbye}}')
        .withHelper('goodbye', function (options) {
          return this.goodbye.toUpperCase() + options.fn(this);
        })
        .withHelper('cruel', function (world) {
          return 'cruel ' + world.toUpperCase();
        })
        .withInput({
          goodbye: 'goodbye',
          world: 'world',
        })
        .withMessage('Helper executed')
        .toCompileTo('GOODBYE cruel WORLD');
    });

    it('Scoped names take precedence over helpers', function () {
      expectTemplate('{{this.goodbye}} {{cruel world}} {{cruel this.goodbye}}')
        .withHelper('goodbye', function () {
          return this.goodbye.toUpperCase();
        })
        .withHelper('cruel', function (world) {
          return 'cruel ' + world.toUpperCase();
        })
        .withInput({
          goodbye: 'goodbye',
          world: 'world',
        })
        .withMessage('Helper not executed')
        .toCompileTo('goodbye cruel WORLD cruel GOODBYE');
    });

    it('Scoped names take precedence over block helpers', function () {
      expectTemplate(
        '{{#goodbye}} {{cruel world}}{{/goodbye}} {{this.goodbye}}'
      )
        .withHelper('goodbye', function (options) {
          return this.goodbye.toUpperCase() + options.fn(this);
        })
        .withHelper('cruel', function (world) {
          return 'cruel ' + world.toUpperCase();
        })
        .withInput({
          goodbye: 'goodbye',
          world: 'world',
        })
        .withMessage('Helper executed')
        .toCompileTo('GOODBYE cruel WORLD goodbye');
    });
  });

  describe('block params', function () {
    it('should take presedence over context values', function () {
      expectTemplate('{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{value}}')
        .withInput({ value: 'foo' })
        .withHelper('goodbyes', function (options) {
          equals(options.fn.blockParams, 1);
          return options.fn({ value: 'bar' }, { blockParams: [1, 2] });
        })
        .toCompileTo('1foo');
    });

    it('should take presedence over helper values', function () {
      expectTemplate('{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{value}}')
        .withHelper('value', function () {
          return 'foo';
        })
        .withHelper('goodbyes', function (options) {
          equals(options.fn.blockParams, 1);
          return options.fn({}, { blockParams: [1, 2] });
        })
        .toCompileTo('1foo');
    });

    it('should not take presedence over pathed values', function () {
      expectTemplate(
        '{{#goodbyes as |value|}}{{./value}}{{/goodbyes}}{{value}}'
      )
        .withInput({ value: 'bar' })
        .withHelper('value', function () {
          return 'foo';
        })
        .withHelper('goodbyes', function (options) {
          equals(options.fn.blockParams, 1);
          return options.fn(this, { blockParams: [1, 2] });
        })
        .toCompileTo('barfoo');
    });

    it('should take presednece over parent block params', function () {
      var value = 1;
      expectTemplate(
        '{{#goodbyes as |value|}}{{#goodbyes}}{{value}}{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{/goodbyes}}{{/goodbyes}}{{value}}'
      )
        .withInput({ value: 'foo' })
        .withHelper('goodbyes', function (options) {
          return options.fn(
            { value: 'bar' },
            {
              blockParams:
                options.fn.blockParams === 1 ? [value++, value++] : undefined,
            }
          );
        })
        .toCompileTo('13foo');
    });

    it('should allow block params on chained helpers', function () {
      expectTemplate(
        '{{#if bar}}{{else goodbyes as |value|}}{{value}}{{/if}}{{value}}'
      )
        .withInput({ value: 'foo' })
        .withHelper('goodbyes', function (options) {
          equals(options.fn.blockParams, 1);
          return options.fn({ value: 'bar' }, { blockParams: [1, 2] });
        })
        .toCompileTo('1foo');
    });
  });

  describe('built-in helpers malformed arguments ', function () {
    it('if helper - too few arguments', function () {
      expectTemplate('{{#if}}{{/if}}').toThrow(
        /#if requires exactly one argument/
      );
    });

    it('if helper - too many arguments, string', function () {
      expectTemplate('{{#if test "string"}}{{/if}}').toThrow(
        /#if requires exactly one argument/
      );
    });

    it('if helper - too many arguments, undefined', function () {
      expectTemplate('{{#if test undefined}}{{/if}}').toThrow(
        /#if requires exactly one argument/
      );
    });

    it('if helper - too many arguments, null', function () {
      expectTemplate('{{#if test null}}{{/if}}').toThrow(
        /#if requires exactly one argument/
      );
    });

    it('unless helper - too few arguments', function () {
      expectTemplate('{{#unless}}{{/unless}}').toThrow(
        /#unless requires exactly one argument/
      );
    });

    it('unless helper - too many arguments', function () {
      expectTemplate('{{#unless test null}}{{/unless}}').toThrow(
        /#unless requires exactly one argument/
      );
    });

    it('with helper - too few arguments', function () {
      expectTemplate('{{#with}}{{/with}}').toThrow(
        /#with requires exactly one argument/
      );
    });

    it('with helper - too many arguments', function () {
      expectTemplate('{{#with test "string"}}{{/with}}').toThrow(
        /#with requires exactly one argument/
      );
    });
  });

  describe('the lookupProperty-option', function () {
    it('should be passed to custom helpers', function () {
      expectTemplate('{{testHelper}}')
        .withHelper('testHelper', function testHelper(options) {
          return options.lookupProperty(this, 'testProperty');
        })
        .withInput({ testProperty: 'abc' })
        .toCompileTo('abc');
    });
  });
});
