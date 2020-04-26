describe('helpers', function() {
  it('helper with complex lookup$', function() {
    var string = '{{#goodbyes}}{{{link ../prefix}}}{{/goodbyes}}';
    var hash = {
      prefix: '/root',
      goodbyes: [{ text: 'Goodbye', url: 'goodbye' }]
    };
    var helpers = {
      link: function(prefix) {
        return (
          '<a href="' + prefix + '/' + this.url + '">' + this.text + '</a>'
        );
      }
    };
    expectTemplate(string)
      .withInput(hash)
      .withHelpers(helpers)
      .toCompileTo('<a href="/root/goodbye">Goodbye</a>');
  });

  it('helper for raw block gets raw content', function() {
    var string = '{{{{raw}}}} {{test}} {{{{/raw}}}}';
    var hash = { test: 'hello' };
    var helpers = {
      raw: function(options) {
        return options.fn();
      }
    };
    expectTemplate(string)
      .withInput(hash)
      .withHelpers(helpers)
      .withMessage('raw block helper gets raw content')
      .toCompileTo(' {{test}} ');
  });

  it('helper for raw block gets parameters', function() {
    var string = '{{{{raw 1 2 3}}}} {{test}} {{{{/raw}}}}';
    var hash = { test: 'hello' };
    var helpers = {
      raw: function(a, b, c, options) {
        return options.fn() + a + b + c;
      }
    };
    expectTemplate(string)
      .withInput(hash)
      .withHelpers(helpers)
      .withMessage('raw block helper gets raw content')
      .toCompileTo(' {{test}} 123');
  });

  describe('raw block parsing (with identity helper-function)', function() {
    function runWithIdentityHelper(template, expected) {
      var helpers = {
        identity: function(options) {
          return options.fn();
        }
      };
      expectTemplate(template)
        .withHelpers(helpers)
        .toCompileTo(expected);
    }

    it('helper for nested raw block gets raw content', function() {
      runWithIdentityHelper(
        '{{{{identity}}}} {{{{b}}}} {{{{/b}}}} {{{{/identity}}}}',
        ' {{{{b}}}} {{{{/b}}}} '
      );
    });

    it('helper for nested raw block works with empty content', function() {
      runWithIdentityHelper('{{{{identity}}}}{{{{/identity}}}}', '');
    });

    xit('helper for nested raw block works if nested raw blocks are broken', function() {
      // This test was introduced in 4.4.4, but it was not the actual problem that lead to the patch release
      // The test is deactivated, because in 3.x this template cases an exception and it also does not work in 4.4.3
      // If anyone can make this template work without breaking everything else, then go for it,
      // but for now, this is just a known bug, that will be documented.
      runWithIdentityHelper(
        '{{{{identity}}}} {{{{a}}}} {{{{ {{{{/ }}}} }}}} {{{{/identity}}}}',
        ' {{{{a}}}} {{{{ {{{{/ }}}} }}}} '
      );
    });

    it('helper for nested raw block closes after first matching close', function() {
      runWithIdentityHelper(
        '{{{{identity}}}}abc{{{{/identity}}}} {{{{identity}}}}abc{{{{/identity}}}}',
        'abc abc'
      );
    });

    it('helper for nested raw block throw exception when with missing closing braces', function() {
      var string = '{{{{a}}}} {{{{/a';
      expectTemplate(string).toThrow();
    });
  });

  it('helper block with identical context', function() {
    var string = '{{#goodbyes}}{{name}}{{/goodbyes}}';
    var hash = { name: 'Alan' };
    var helpers = {
      goodbyes: function(options) {
        var out = '';
        var byes = ['Goodbye', 'goodbye', 'GOODBYE'];
        for (var i = 0, j = byes.length; i < j; i++) {
          out += byes[i] + ' ' + options.fn(this) + '! ';
        }
        return out;
      }
    };
    expectTemplate(string)
      .withInput(hash)
      .withHelpers(helpers)
      .toCompileTo('Goodbye Alan! goodbye Alan! GOODBYE Alan! ');
  });
  it('helper block with complex lookup expression', function() {
    var string = '{{#goodbyes}}{{../name}}{{/goodbyes}}';
    var hash = { name: 'Alan' };
    var helpers = {
      goodbyes: function(options) {
        var out = '';
        var byes = ['Goodbye', 'goodbye', 'GOODBYE'];
        for (var i = 0, j = byes.length; i < j; i++) {
          out += byes[i] + ' ' + options.fn({}) + '! ';
        }
        return out;
      }
    };
    expectTemplate(string)
      .withInput(hash)
      .withHelpers(helpers)
      .toCompileTo('Goodbye Alan! goodbye Alan! GOODBYE Alan! ');
  });

  it('helper with complex lookup and nested template', function() {
    var string =
      '{{#goodbyes}}{{#link ../prefix}}{{text}}{{/link}}{{/goodbyes}}';
    var hash = {
      prefix: '/root',
      goodbyes: [{ text: 'Goodbye', url: 'goodbye' }]
    };
    var helpers = {
      link: function(prefix, options) {
        return (
          '<a href="' +
          prefix +
          '/' +
          this.url +
          '">' +
          options.fn(this) +
          '</a>'
        );
      }
    };
    expectTemplate(string)
      .withInput(hash)
      .withHelpers(helpers)
      .toCompileTo('<a href="/root/goodbye">Goodbye</a>');
  });

  it('helper with complex lookup and nested template in VM+Compiler', function() {
    var string =
      '{{#goodbyes}}{{#link ../prefix}}{{text}}{{/link}}{{/goodbyes}}';
    var hash = {
      prefix: '/root',
      goodbyes: [{ text: 'Goodbye', url: 'goodbye' }]
    };
    var helpers = {
      link: function(prefix, options) {
        return (
          '<a href="' +
          prefix +
          '/' +
          this.url +
          '">' +
          options.fn(this) +
          '</a>'
        );
      }
    };
    expectTemplate(string)
      .withInput(hash)
      .withHelpers(helpers)
      .toCompileTo('<a href="/root/goodbye">Goodbye</a>');
  });
  it('helper returning undefined value', function() {
    expectTemplate(' {{nothere}}')
      .withHelpers({
        nothere: function() {}
      })
      .toCompileTo(' ');
    expectTemplate(' {{#nothere}}{{/nothere}}')
      .withHelpers({
        nothere: function() {}
      })
      .toCompileTo(' ');
  });

  it('block helper', function() {
    var string = '{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!';

    var input = { world: 'world' };
    var helpers = {
      goodbyes: function(options) {
        return options.fn({ text: 'GOODBYE' });
      }
    };

    expectTemplate(string)
      .withInput(input)
      .withHelpers(helpers)
      .withMessage('Block helper executed')
      .toCompileTo('GOODBYE! cruel world!');
  });

  it('block helper staying in the same context', function() {
    var string = '{{#form}}<p>{{name}}</p>{{/form}}';

    var input = { name: 'Yehuda' };
    var helpers = {
      form: function(options) {
        return '<form>' + options.fn(this) + '</form>';
      }
    };

    expectTemplate(string)
      .withInput(input)
      .withHelpers(helpers)
      .withMessage('Block helper executed with current context')
      .toCompileTo('<form><p>Yehuda</p></form>');
  });

  it('block helper should have context in this', function() {
    var source =
      '<ul>{{#people}}<li>{{#link}}{{name}}{{/link}}</li>{{/people}}</ul>';
    function link(options) {
      return '<a href="/people/' + this.id + '">' + options.fn(this) + '</a>';
    }
    var data = {
      people: [
        { name: 'Alan', id: 1 },
        { name: 'Yehuda', id: 2 }
      ]
    };

    expectTemplate(source)
      .withInput(data)
      .withHelpers({ link: link })
      .toCompileTo(
        '<ul><li><a href="/people/1">Alan</a></li><li><a href="/people/2">Yehuda</a></li></ul>'
      );
  });

  it('block helper for undefined value', function() {
    expectTemplate("{{#empty}}shouldn't render{{/empty}}").toCompileTo('');
  });

  it('block helper passing a new context', function() {
    var string = '{{#form yehuda}}<p>{{name}}</p>{{/form}}';

    var input = { yehuda: { name: 'Yehuda' } };
    var helpers = {
      form: function(context, options) {
        return '<form>' + options.fn(context) + '</form>';
      }
    };

    expectTemplate(string)
      .withInput(input)
      .withHelpers(helpers)
      .withMessage('Context variable resolved')
      .toCompileTo('<form><p>Yehuda</p></form>');
  });

  it('block helper passing a complex path context', function() {
    var string = '{{#form yehuda/cat}}<p>{{name}}</p>{{/form}}';

    var input = { yehuda: { name: 'Yehuda', cat: { name: 'Harold' } } };
    var helpers = {
      form: function(context, options) {
        return '<form>' + options.fn(context) + '</form>';
      }
    };

    expectTemplate(string)
      .withInput(input)
      .withHelpers(helpers)
      .withMessage('Complex path variable resolved')
      .toCompileTo('<form><p>Harold</p></form>');
  });

  it('nested block helpers', function() {
    var string =
      '{{#form yehuda}}<p>{{name}}</p>{{#link}}Hello{{/link}}{{/form}}';

    var input = {
      yehuda: { name: 'Yehuda' }
    };
    var helpers = {
      link: function(options) {
        return '<a href="' + this.name + '">' + options.fn(this) + '</a>';
      },
      form: function(context, options) {
        return '<form>' + options.fn(context) + '</form>';
      }
    };

    expectTemplate(string)
      .withInput(input)
      .withHelpers(helpers)
      .withMessage('Both blocks executed')
      .toCompileTo('<form><p>Yehuda</p><a href="Yehuda">Hello</a></form>');
  });

  it('block helper inverted sections', function() {
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

    var hash = { people: [{ name: 'Alan' }, { name: 'Yehuda' }] };
    var empty = { people: [] };
    var rootMessage = {
      people: [],
      message: "Nobody's here"
    };

    var messageString = '{{#list people}}Hello{{^}}{{message}}{{/list}}';

    // the meaning here may be kind of hard to catch, but list.not is always called,
    // so we should see the output of both
    expectTemplate(string)
      .withInput(hash)
      .withHelpers({ list: list })
      .withMessage('an inverse wrapper is passed in as a new context')
      .toCompileTo('<ul><li>Alan</li><li>Yehuda</li></ul>');
    expectTemplate(string)
      .withInput(empty)
      .withHelpers({ list: list })
      .withMessage('an inverse wrapper can be optionally called')
      .toCompileTo("<p><em>Nobody's here</em></p>");
    expectTemplate(messageString)
      .withInput(rootMessage)
      .withHelpers({ list: list })
      .withMessage('the context of an inverse is the parent of the block')
      .toCompileTo('<p>Nobody&#x27;s here</p>');
  });

  it('pathed lambas with parameters', function() {
    var hash = {
      helper: function() {
        return 'winning';
      }
    };
    hash.hash = hash;
    var helpers = {
      './helper': function() {
        return 'fail';
      }
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

  describe('helpers hash', function() {
    it('providing a helpers hash', function() {
      expectTemplate('Goodbye {{cruel}} {{world}}!')
        .withInput({ cruel: 'cruel' })
        .withHelpers({
          world: function() {
            return 'world';
          }
        })
        .withMessage('helpers hash is available')
        .toCompileTo('Goodbye cruel world!');

      expectTemplate('Goodbye {{#iter}}{{cruel}} {{world}}{{/iter}}!')
        .withInput({ iter: [{ cruel: 'cruel' }] })
        .withHelpers({
          world: function() {
            return 'world';
          }
        })
        .withMessage('helpers hash is available inside other blocks')
        .toCompileTo('Goodbye cruel world!');
    });

    it('in cases of conflict, helpers win', function() {
      expectTemplate('{{{lookup}}}')
        .withInput({ lookup: 'Explicit' })
        .withHelpers({
          lookup: function() {
            return 'helpers';
          }
        })
        .withMessage('helpers hash has precedence escaped expansion')
        .toCompileTo('helpers');
      expectTemplate('{{lookup}}')
        .withInput({ lookup: 'Explicit' })
        .withHelpers({
          lookup: function() {
            return 'helpers';
          }
        })
        .withMessage('helpers hash has precedence simple expansion')
        .toCompileTo('helpers');
    });

    it('the helpers hash is available is nested contexts', function() {
      expectTemplate('{{#outer}}{{#inner}}{{helper}}{{/inner}}{{/outer}}')
        .withInput({ outer: { inner: { unused: [] } } })
        .withHelpers({
          helper: function() {
            return 'helper';
          }
        })
        .withMessage('helpers hash is available in nested contexts.')
        .toCompileTo('helper');
    });

    it('the helper hash should augment the global hash', function() {
      handlebarsEnv.registerHelper('test_helper', function() {
        return 'found it!';
      });

      expectTemplate(
        '{{test_helper}} {{#if cruel}}Goodbye {{cruel}} {{world}}!{{/if}}'
      )
        .withInput({ cruel: 'cruel' })
        .withHelpers({
          world: function() {
            return 'world!';
          }
        })
        .toCompileTo('found it! Goodbye cruel world!!');
    });
  });

  describe('registration', function() {
    it('unregisters', function() {
      handlebarsEnv.helpers = {};

      handlebarsEnv.registerHelper('foo', function() {
        return 'fail';
      });
      handlebarsEnv.unregisterHelper('foo');
      equals(handlebarsEnv.helpers.foo, undefined);
    });

    it('allows multiple globals', function() {
      var helpers = handlebarsEnv.helpers;
      handlebarsEnv.helpers = {};

      handlebarsEnv.registerHelper({
        if: helpers['if'],
        world: function() {
          return 'world!';
        },
        testHelper: function() {
          return 'found it!';
        }
      });

      expectTemplate(
        '{{testHelper}} {{#if cruel}}Goodbye {{cruel}} {{world}}!{{/if}}'
      )
        .withInput({ cruel: 'cruel' })
        .toCompileTo('found it! Goodbye cruel world!!');
    });
    it('fails with multiple and args', function() {
      shouldThrow(
        function() {
          handlebarsEnv.registerHelper(
            {
              world: function() {
                return 'world!';
              },
              testHelper: function() {
                return 'found it!';
              }
            },
            {}
          );
        },
        Error,
        'Arg not supported with multiple helpers'
      );
    });
  });

  it('decimal number literals work', function() {
    var string = 'Message: {{hello -1.2 1.2}}';
    var helpers = {
      hello: function(times, times2) {
        if (typeof times !== 'number') {
          times = 'NaN';
        }
        if (typeof times2 !== 'number') {
          times2 = 'NaN';
        }
        return 'Hello ' + times + ' ' + times2 + ' times';
      }
    };
    expectTemplate(string)
      .withHelpers(helpers)
      .withMessage('template with a negative integer literal')
      .toCompileTo('Message: Hello -1.2 1.2 times');
  });

  it('negative number literals work', function() {
    var string = 'Message: {{hello -12}}';
    var helpers = {
      hello: function(times) {
        if (typeof times !== 'number') {
          times = 'NaN';
        }
        return 'Hello ' + times + ' times';
      }
    };
    expectTemplate(string)
      .withHelpers(helpers)
      .withMessage('template with a negative integer literal')
      .toCompileTo('Message: Hello -12 times');
  });

  describe('String literal parameters', function() {
    it('simple literals work', function() {
      var string = 'Message: {{hello "world" 12 true false}}';
      var helpers = {
        hello: function(param, times, bool1, bool2) {
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
        }
      };
      expectTemplate(string)
        .withHelpers(helpers)
        .withMessage('template with a simple String literal')
        .toCompileTo('Message: Hello world 12 times: true false');
    });

    it('using a quote in the middle of a parameter raises an error', function() {
      var string = 'Message: {{hello wo"rld"}}';
      expectTemplate(string).toThrow(Error);
    });

    it('escaping a String is possible', function() {
      var string = 'Message: {{{hello "\\"world\\""}}}';
      var helpers = {
        hello: function(param) {
          return 'Hello ' + param;
        }
      };
      expectTemplate(string)
        .withHelpers(helpers)
        .withMessage('template with an escaped String literal')
        .toCompileTo('Message: Hello "world"');
    });

    it("it works with ' marks", function() {
      var string = 'Message: {{{hello "Alan\'s world"}}}';
      var helpers = {
        hello: function(param) {
          return 'Hello ' + param;
        }
      };
      expectTemplate(string)
        .withHelpers(helpers)
        .withMessage("template with a ' mark")
        .toCompileTo("Message: Hello Alan's world");
    });
  });

  it('negative number literals work', function() {
    var string = 'Message: {{hello -12}}';
    var helpers = {
      hello: function(times) {
        if (typeof times !== 'number') {
          times = 'NaN';
        }
        return 'Hello ' + times + ' times';
      }
    };
    expectTemplate(string)
      .withHelpers(helpers)
      .withMessage('template with a negative integer literal')
      .toCompileTo('Message: Hello -12 times');
  });

  describe('multiple parameters', function() {
    it('simple multi-params work', function() {
      var string = 'Message: {{goodbye cruel world}}';
      var hash = { cruel: 'cruel', world: 'world' };
      var helpers = {
        goodbye: function(cruel, world) {
          return 'Goodbye ' + cruel + ' ' + world;
        }
      };
      expectTemplate(string)
        .withInput(hash)
        .withHelpers(helpers)
        .withMessage('regular helpers with multiple params')
        .toCompileTo('Message: Goodbye cruel world');
    });

    it('block multi-params work', function() {
      var string =
        'Message: {{#goodbye cruel world}}{{greeting}} {{adj}} {{noun}}{{/goodbye}}';
      var hash = { cruel: 'cruel', world: 'world' };
      var helpers = {
        goodbye: function(cruel, world, options) {
          return options.fn({ greeting: 'Goodbye', adj: cruel, noun: world });
        }
      };
      expectTemplate(string)
        .withInput(hash)
        .withHelpers(helpers)
        .withMessage('block helpers with multiple params')
        .toCompileTo('Message: Goodbye cruel world');
    });
  });

  describe('hash', function() {
    it('helpers can take an optional hash', function() {
      var string = '{{goodbye cruel="CRUEL" world="WORLD" times=12}}';

      var helpers = {
        goodbye: function(options) {
          return (
            'GOODBYE ' +
            options.hash.cruel +
            ' ' +
            options.hash.world +
            ' ' +
            options.hash.times +
            ' TIMES'
          );
        }
      };

      var context = {};

      expectTemplate(string)
        .withInput(context)
        .withHelpers(helpers)
        .withMessage('Helper output hash')
        .toCompileTo('GOODBYE CRUEL WORLD 12 TIMES');
    });

    it('helpers can take an optional hash with booleans', function() {
      var helpers = {
        goodbye: function(options) {
          if (options.hash.print === true) {
            return 'GOODBYE ' + options.hash.cruel + ' ' + options.hash.world;
          } else if (options.hash.print === false) {
            return 'NOT PRINTING';
          } else {
            return 'THIS SHOULD NOT HAPPEN';
          }
        }
      };

      var context = {};

      expectTemplate('{{goodbye cruel="CRUEL" world="WORLD" print=true}}')
        .withHelpers(helpers)
        .withInput(context)
        .withMessage('Helper output hash')
        .toCompileTo('GOODBYE CRUEL WORLD');

      expectTemplate('{{goodbye cruel="CRUEL" world="WORLD" print=false}}')
        .withHelpers(helpers)
        .withInput(context)
        .withMessage('Boolean helper parameter honored')
        .toCompileTo('NOT PRINTING');
    });

    it('block helpers can take an optional hash', function() {
      var string = '{{#goodbye cruel="CRUEL" times=12}}world{{/goodbye}}';

      var helpers = {
        goodbye: function(options) {
          return (
            'GOODBYE ' +
            options.hash.cruel +
            ' ' +
            options.fn(this) +
            ' ' +
            options.hash.times +
            ' TIMES'
          );
        }
      };

      expectTemplate(string)
        .withHelpers(helpers)
        .withMessage('Hash parameters output')
        .toCompileTo('GOODBYE CRUEL world 12 TIMES');
    });

    it('block helpers can take an optional hash with single quoted stings', function() {
      var string = '{{#goodbye cruel="CRUEL" times=12}}world{{/goodbye}}';

      var helpers = {
        goodbye: function(options) {
          return (
            'GOODBYE ' +
            options.hash.cruel +
            ' ' +
            options.fn(this) +
            ' ' +
            options.hash.times +
            ' TIMES'
          );
        }
      };

      expectTemplate(string)
        .withHelpers(helpers)
        .withMessage('Hash parameters output')
        .toCompileTo('GOODBYE CRUEL world 12 TIMES');
    });

    it('block helpers can take an optional hash with booleans', function() {
      var helpers = {
        goodbye: function(options) {
          if (options.hash.print === true) {
            return 'GOODBYE ' + options.hash.cruel + ' ' + options.fn(this);
          } else if (options.hash.print === false) {
            return 'NOT PRINTING';
          } else {
            return 'THIS SHOULD NOT HAPPEN';
          }
        }
      };

      expectTemplate('{{#goodbye cruel="CRUEL" print=true}}world{{/goodbye}}')
        .withHelpers(helpers)
        .withMessage('Boolean hash parameter honored')
        .toCompileTo('GOODBYE CRUEL world');

      expectTemplate('{{#goodbye cruel="CRUEL" print=false}}world{{/goodbye}}')
        .withHelpers(helpers)
        .withMessage('Boolean hash parameter honored')
        .toCompileTo('NOT PRINTING');
    });
  });

  describe('helperMissing', function() {
    it('if a context is not found, helperMissing is used', function() {
      expectTemplate('{{hello}} {{link_to world}}').toThrow(
        /Missing helper: "link_to"/
      );
    });

    it('if a context is not found, custom helperMissing is used', function() {
      var string = '{{hello}} {{link_to world}}';
      var context = { hello: 'Hello', world: 'world' };

      var helpers = {
        helperMissing: function(mesg, options) {
          if (options.name === 'link_to') {
            return new Handlebars.SafeString('<a>' + mesg + '</a>');
          }
        }
      };

      expectTemplate(string)
        .withInput(context)
        .withHelpers(helpers)
        .toCompileTo('Hello <a>world</a>');
    });

    it('if a value is not found, custom helperMissing is used', function() {
      var string = '{{hello}} {{link_to}}';
      var context = { hello: 'Hello', world: 'world' };

      var helpers = {
        helperMissing: function(options) {
          if (options.name === 'link_to') {
            return new Handlebars.SafeString('<a>winning</a>');
          }
        }
      };

      expectTemplate(string)
        .withInput(context)
        .withHelpers(helpers)
        .toCompileTo('Hello <a>winning</a>');
    });
  });

  describe('knownHelpers', function() {
    it('Known helper should render helper', function() {
      var string = '{{hello}}';
      var compileOptions = {
        knownHelpers: { hello: true }
      };

      var helpers = {
        hello: function() {
          return 'foo';
        }
      };

      expectTemplate(string)
        .withCompileOptions(compileOptions)
        .withHelpers(helpers)
        .toCompileTo('foo');
    });

    it('Unknown helper in knownHelpers only mode should be passed as undefined', function() {
      var string = '{{typeof hello}}';
      var compileOptions = {
        knownHelpers: { typeof: true },
        knownHelpersOnly: true
      };

      var helpers = {
        typeof: function(arg) {
          return typeof arg;
        },
        hello: function() {
          return 'foo';
        }
      };

      expectTemplate(string)
        .withCompileOptions(compileOptions)
        .withHelpers(helpers)
        .toCompileTo('undefined');
    });
    it('Builtin helpers available in knownHelpers only mode', function() {
      var string = '{{#unless foo}}bar{{/unless}}';
      var compileOptions = {
        knownHelpersOnly: true
      };

      expectTemplate(string)
        .withCompileOptions(compileOptions)
        .toCompileTo('bar');
    });
    it('Field lookup works in knownHelpers only mode', function() {
      var string = '{{foo}}';
      var compileOptions = {
        knownHelpersOnly: true
      };

      var input = { foo: 'bar' };
      expectTemplate(string)
        .withCompileOptions(compileOptions)
        .withInput(input)
        .toCompileTo('bar');
    });
    it('Conditional blocks work in knownHelpers only mode', function() {
      var string = '{{#foo}}bar{{/foo}}';
      var compileOptions = {
        knownHelpersOnly: true
      };

      var input = { foo: 'baz' };
      expectTemplate(string)
        .withCompileOptions(compileOptions)
        .withInput(input)
        .toCompileTo('bar');
    });
    it('Invert blocks work in knownHelpers only mode', function() {
      var string = '{{^foo}}bar{{/foo}}';
      var compileOptions = {
        knownHelpersOnly: true
      };

      var input = { foo: false };
      expectTemplate(string)
        .withCompileOptions(compileOptions)
        .withInput(input)
        .toCompileTo('bar');
    });
    it('Functions are bound to the context in knownHelpers only mode', function() {
      var string = '{{foo}}';
      var compileOptions = {
        knownHelpersOnly: true
      };
      var input = {
        foo: function() {
          return this.bar;
        },
        bar: 'bar'
      };
      expectTemplate(string)
        .withCompileOptions(compileOptions)
        .withInput(input)
        .toCompileTo('bar');
    });
    it('Unknown helper call in knownHelpers only mode should throw', function() {
      expectTemplate('{{typeof hello}}')
        .withCompileOptions({ knownHelpersOnly: true })
        .toThrow(Error);
    });
  });

  describe('blockHelperMissing', function() {
    it('lambdas are resolved by blockHelperMissing, not handlebars proper', function() {
      var string = '{{#truthy}}yep{{/truthy}}';
      var data = {
        truthy: function() {
          return true;
        }
      };
      expectTemplate(string)
        .withInput(data)
        .toCompileTo('yep');
    });
    it('lambdas resolved by blockHelperMissing are bound to the context', function() {
      var string = '{{#truthy}}yep{{/truthy}}';
      var boundData = {
        truthy: function() {
          return this.truthiness();
        },
        truthiness: function() {
          return false;
        }
      };
      expectTemplate(string)
        .withInput(boundData)
        .toCompileTo('');
    });
  });

  describe('name field', function() {
    var context = {};
    var helpers = {
      blockHelperMissing: function() {
        return 'missing: ' + arguments[arguments.length - 1].name;
      },
      helperMissing: function() {
        return 'helper missing: ' + arguments[arguments.length - 1].name;
      },
      helper: function() {
        return 'ran: ' + arguments[arguments.length - 1].name;
      }
    };

    it('should include in ambiguous mustache calls', function() {
      expectTemplate('{{helper}}')
        .withInput(context)
        .withHelpers(helpers)
        .toCompileTo('ran: helper');
    });
    it('should include in helper mustache calls', function() {
      expectTemplate('{{helper 1}}')
        .withInput(context)
        .withHelpers(helpers)
        .toCompileTo('ran: helper');
    });
    it('should include in ambiguous block calls', function() {
      expectTemplate('{{#helper}}{{/helper}}')
        .withInput(context)
        .withHelpers(helpers)
        .toCompileTo('ran: helper');
    });
    it('should include in simple block calls', function() {
      expectTemplate('{{#./helper}}{{/./helper}}')
        .withInput(context)
        .withHelpers(helpers)
        .toCompileTo('missing: ./helper');
    });
    it('should include in helper block calls', function() {
      expectTemplate('{{#helper 1}}{{/helper}}')
        .withInput(context)
        .withHelpers(helpers)
        .toCompileTo('ran: helper');
    });
    it('should include in known helper calls', function() {
      var string = '{{helper}}';
      var compileOptions = {
        knownHelpers: { helper: true },
        knownHelpersOnly: true
      };

      expectTemplate(string)
        .withCompileOptions(compileOptions)
        .withHelpers(helpers)
        .toCompileTo('ran: helper');
    });

    it('should include full id', function() {
      expectTemplate('{{#foo.helper}}{{/foo.helper}}')
        .withInput({ foo: {} })
        .withHelpers(helpers)
        .toCompileTo('missing: foo.helper');
    });

    it('should include full id if a hash is passed', function() {
      expectTemplate('{{#foo.helper bar=baz}}{{/foo.helper}}')
        .withInput({ foo: {} })
        .withHelpers(helpers)
        .toCompileTo('helper missing: foo.helper');
    });
  });

  describe('name conflicts', function() {
    it('helpers take precedence over same-named context properties', function() {
      var string = '{{goodbye}} {{cruel world}}';

      var helpers = {
        goodbye: function() {
          return this.goodbye.toUpperCase();
        },

        cruel: function(world) {
          return 'cruel ' + world.toUpperCase();
        }
      };

      var context = {
        goodbye: 'goodbye',
        world: 'world'
      };

      expectTemplate(string)
        .withHelpers(helpers)
        .withInput(context)
        .withMessage('Helper executed')
        .toCompileTo('GOODBYE cruel WORLD');
    });

    it('helpers take precedence over same-named context properties$', function() {
      var string = '{{#goodbye}} {{cruel world}}{{/goodbye}}';

      var helpers = {
        goodbye: function(options) {
          return this.goodbye.toUpperCase() + options.fn(this);
        },

        cruel: function(world) {
          return 'cruel ' + world.toUpperCase();
        }
      };

      var context = {
        goodbye: 'goodbye',
        world: 'world'
      };

      expectTemplate(string)
        .withHelpers(helpers)
        .withInput(context)
        .withMessage('Helper executed')
        .toCompileTo('GOODBYE cruel WORLD');
    });

    it('Scoped names take precedence over helpers', function() {
      var string = '{{this.goodbye}} {{cruel world}} {{cruel this.goodbye}}';

      var helpers = {
        goodbye: function() {
          return this.goodbye.toUpperCase();
        },

        cruel: function(world) {
          return 'cruel ' + world.toUpperCase();
        }
      };

      var context = {
        goodbye: 'goodbye',
        world: 'world'
      };

      expectTemplate(string)
        .withHelpers(helpers)
        .withInput(context)
        .withMessage('Helper not executed')
        .toCompileTo('goodbye cruel WORLD cruel GOODBYE');
    });

    it('Scoped names take precedence over block helpers', function() {
      var string = '{{#goodbye}} {{cruel world}}{{/goodbye}} {{this.goodbye}}';

      var helpers = {
        goodbye: function(options) {
          return this.goodbye.toUpperCase() + options.fn(this);
        },

        cruel: function(world) {
          return 'cruel ' + world.toUpperCase();
        }
      };

      var context = {
        goodbye: 'goodbye',
        world: 'world'
      };

      expectTemplate(string)
        .withHelpers(helpers)
        .withInput(context)
        .withMessage('Helper executed')
        .toCompileTo('GOODBYE cruel WORLD goodbye');
    });
  });

  describe('block params', function() {
    it('should take presedence over context values', function() {
      var hash = { value: 'foo' };
      var helpers = {
        goodbyes: function(options) {
          equals(options.fn.blockParams, 1);
          return options.fn({ value: 'bar' }, { blockParams: [1, 2] });
        }
      };
      expectTemplate('{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{value}}')
        .withInput(hash)
        .withHelpers(helpers)
        .toCompileTo('1foo');
    });
    it('should take presedence over helper values', function() {
      var hash = {};
      var helpers = {
        value: function() {
          return 'foo';
        },
        goodbyes: function(options) {
          equals(options.fn.blockParams, 1);
          return options.fn({}, { blockParams: [1, 2] });
        }
      };
      expectTemplate('{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{value}}')
        .withInput(hash)
        .withHelpers(helpers)
        .toCompileTo('1foo');
    });
    it('should not take presedence over pathed values', function() {
      var hash = { value: 'bar' };
      var helpers = {
        value: function() {
          return 'foo';
        },
        goodbyes: function(options) {
          equals(options.fn.blockParams, 1);
          return options.fn(this, { blockParams: [1, 2] });
        }
      };
      expectTemplate(
        '{{#goodbyes as |value|}}{{./value}}{{/goodbyes}}{{value}}'
      )
        .withInput(hash)
        .withHelpers(helpers)
        .toCompileTo('barfoo');
    });
    it('should take presednece over parent block params', function() {
      var hash = { value: 'foo' },
        value = 1;
      var helpers = {
        goodbyes: function(options) {
          return options.fn(
            { value: 'bar' },
            {
              blockParams:
                options.fn.blockParams === 1 ? [value++, value++] : undefined
            }
          );
        }
      };
      expectTemplate(
        '{{#goodbyes as |value|}}{{#goodbyes}}{{value}}{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{/goodbyes}}{{/goodbyes}}{{value}}'
      )
        .withInput(hash)
        .withHelpers(helpers)
        .toCompileTo('13foo');
    });

    it('should allow block params on chained helpers', function() {
      var hash = { value: 'foo' };
      var helpers = {
        goodbyes: function(options) {
          equals(options.fn.blockParams, 1);
          return options.fn({ value: 'bar' }, { blockParams: [1, 2] });
        }
      };
      expectTemplate(
        '{{#if bar}}{{else goodbyes as |value|}}{{value}}{{/if}}{{value}}'
      )
        .withInput(hash)
        .withHelpers(helpers)
        .toCompileTo('1foo');
    });
  });

  describe('built-in helpers malformed arguments ', function() {
    it('if helper - too few arguments', function() {
      var string = '{{#if}}{{/if}}';
      expectTemplate(string).toThrow(/#if requires exactly one argument/);
    });

    it('if helper - too many arguments, string', function() {
      var string = '{{#if test "string"}}{{/if}}';
      expectTemplate(string).toThrow(/#if requires exactly one argument/);
    });

    it('if helper - too many arguments, undefined', function() {
      var string = '{{#if test undefined}}{{/if}}';
      expectTemplate(string).toThrow(/#if requires exactly one argument/);
    });

    it('if helper - too many arguments, null', function() {
      var string = '{{#if test null}}{{/if}}';
      expectTemplate(string).toThrow(/#if requires exactly one argument/);
    });

    it('unless helper - too few arguments', function() {
      var string = '{{#unless}}{{/unless}}';
      expectTemplate(string).toThrow(/#unless requires exactly one argument/);
    });

    it('unless helper - too many arguments', function() {
      var string = '{{#unless test null}}{{/unless}}';
      expectTemplate(string).toThrow(/#unless requires exactly one argument/);
    });

    it('with helper - too few arguments', function() {
      var string = '{{#with}}{{/with}}';
      expectTemplate(string).toThrow(/#with requires exactly one argument/);
    });

    it('with helper - too many arguments', function() {
      var string = '{{#with test "string"}}{{/with}}';
      expectTemplate(string).toThrow(/#with requires exactly one argument/);
    });
  });

  describe('the lookupProperty-option', function() {
    it('should be passed to custom helpers', function() {
      expectTemplate('{{testHelper}}')
        .withHelper('testHelper', function testHelper(options) {
          return options.lookupProperty(this, 'testProperty');
        })
        .withInput({ testProperty: 'abc' })
        .toCompileTo('abc');
    });
  });
});
