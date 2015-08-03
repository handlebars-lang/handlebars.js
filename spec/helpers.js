describe('helpers', function() {
  it('helper with complex lookup$', function() {
    var string = '{{#goodbyes}}{{{link ../prefix}}}{{/goodbyes}}';
    var hash = {prefix: '/root', goodbyes: [{text: 'Goodbye', url: 'goodbye'}]};
    var helpers = {link: function(prefix) {
      return '<a href="' + prefix + '/' + this.url + '">' + this.text + '</a>';
    }};
    shouldCompileTo(string, [hash, helpers], '<a href="/root/goodbye">Goodbye</a>');
  });

  it('helper for raw block gets raw content', function() {
    var string = '{{{{raw}}}} {{test}} {{{{/raw}}}}';
    var hash = { test: 'hello' };
    var helpers = { raw: function(options) {
        return options.fn();
    } };
    shouldCompileTo(string, [hash, helpers], ' {{test}} ',
                    'raw block helper gets raw content');
  });

  it('helper for raw block gets parameters', function() {
    var string = '{{{{raw 1 2 3}}}} {{test}} {{{{/raw}}}}';
    var hash = { test: 'hello' };
    var helpers = { raw: function(a, b, c, options) {
        return options.fn() + a + b + c;
    } };
    shouldCompileTo(string, [hash, helpers], ' {{test}} 123',
                    'raw block helper gets raw content');
  });

  it('helper for nested raw block gets raw content', function() {
    var string = '{{{{a}}}} {{{{b}}}} {{{{/b}}}} {{{{/a}}}}';
    var helpers = {
        a: function(options) {
          return options.fn();
      }
    };
    shouldCompileTo(string, [{}, helpers], ' {{{{b}}}} {{{{/b}}}} ', 'raw block helper should get nested raw block as raw content');
  });

  it('helper block with identical context', function() {
    var string = '{{#goodbyes}}{{name}}{{/goodbyes}}';
    var hash = {name: 'Alan'};
    var helpers = {goodbyes: function(options) {
      var out = '';
      var byes = ['Goodbye', 'goodbye', 'GOODBYE'];
      for (var i = 0, j = byes.length; i < j; i++) {
        out += byes[i] + ' ' + options.fn(this) + '! ';
      }
      return out;
    }};
    shouldCompileTo(string, [hash, helpers], 'Goodbye Alan! goodbye Alan! GOODBYE Alan! ');
  });
  it('helper block with complex lookup expression', function() {
    var string = '{{#goodbyes}}{{../name}}{{/goodbyes}}';
    var hash = {name: 'Alan'};
    var helpers = {goodbyes: function(options) {
      var out = '';
      var byes = ['Goodbye', 'goodbye', 'GOODBYE'];
      for (var i = 0, j = byes.length; i < j; i++) {
        out += byes[i] + ' ' + options.fn({}) + '! ';
      }
      return out;
    }};
    shouldCompileTo(string, [hash, helpers], 'Goodbye Alan! goodbye Alan! GOODBYE Alan! ');
  });

  it('helper with complex lookup and nested template', function() {
    var string = '{{#goodbyes}}{{#link ../prefix}}{{text}}{{/link}}{{/goodbyes}}';
    var hash = {prefix: '/root', goodbyes: [{text: 'Goodbye', url: 'goodbye'}]};
    var helpers = {link: function(prefix, options) {
        return '<a href="' + prefix + '/' + this.url + '">' + options.fn(this) + '</a>';
    }};
    shouldCompileToWithPartials(string, [hash, helpers], false, '<a href="/root/goodbye">Goodbye</a>');
  });

  it('helper with complex lookup and nested template in VM+Compiler', function() {
    var string = '{{#goodbyes}}{{#link ../prefix}}{{text}}{{/link}}{{/goodbyes}}';
    var hash = {prefix: '/root', goodbyes: [{text: 'Goodbye', url: 'goodbye'}]};
    var helpers = {link: function(prefix, options) {
        return '<a href="' + prefix + '/' + this.url + '">' + options.fn(this) + '</a>';
    }};
    shouldCompileToWithPartials(string, [hash, helpers], true, '<a href="/root/goodbye">Goodbye</a>');
  });
  it('helper returning undefined value', function() {
    shouldCompileTo(' {{nothere}}', [{}, {nothere: function() {}}], ' ');
    shouldCompileTo(' {{#nothere}}{{/nothere}}', [{}, {nothere: function() {}}], ' ');
  });

  it('block helper', function() {
    var string = '{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!';
    var template = CompilerContext.compile(string);

    var result = template({world: 'world'}, { helpers: {goodbyes: function(options) { return options.fn({text: 'GOODBYE'}); }}});
    equal(result, 'GOODBYE! cruel world!', 'Block helper executed');
  });

  it('block helper staying in the same context', function() {
    var string = '{{#form}}<p>{{name}}</p>{{/form}}';
    var template = CompilerContext.compile(string);

    var result = template({name: 'Yehuda'}, {helpers: {form: function(options) { return '<form>' + options.fn(this) + '</form>'; } }});
    equal(result, '<form><p>Yehuda</p></form>', 'Block helper executed with current context');
  });

  it('block helper should have context in this', function() {
    var source = '<ul>{{#people}}<li>{{#link}}{{name}}{{/link}}</li>{{/people}}</ul>';
    function link(options) {
      return '<a href="/people/' + this.id + '">' + options.fn(this) + '</a>';
    }
    var data = { 'people': [
      { 'name': 'Alan', 'id': 1 },
      { 'name': 'Yehuda', 'id': 2 }
    ]};

    shouldCompileTo(source, [data, {link: link}], '<ul><li><a href=\"/people/1\">Alan</a></li><li><a href=\"/people/2\">Yehuda</a></li></ul>');
  });

  it('block helper for undefined value', function() {
    shouldCompileTo("{{#empty}}shouldn't render{{/empty}}", {}, '');
  });

  it('block helper passing a new context', function() {
    var string = '{{#form yehuda}}<p>{{name}}</p>{{/form}}';
    var template = CompilerContext.compile(string);

    var result = template({yehuda: {name: 'Yehuda'}}, { helpers: {form: function(context, options) { return '<form>' + options.fn(context) + '</form>'; }}});
    equal(result, '<form><p>Yehuda</p></form>', 'Context variable resolved');
  });

  it('block helper passing a complex path context', function() {
    var string = '{{#form yehuda/cat}}<p>{{name}}</p>{{/form}}';
    var template = CompilerContext.compile(string);

    var result = template({yehuda: {name: 'Yehuda', cat: {name: 'Harold'}}}, { helpers: {form: function(context, options) { return '<form>' + options.fn(context) + '</form>'; }}});
    equal(result, '<form><p>Harold</p></form>', 'Complex path variable resolved');
  });

  it('nested block helpers', function() {
    var string = '{{#form yehuda}}<p>{{name}}</p>{{#link}}Hello{{/link}}{{/form}}';
    var template = CompilerContext.compile(string);

    var result = template({
      yehuda: {name: 'Yehuda' }
    }, {
      helpers: {
        link: function(options) { return '<a href="' + this.name + '">' + options.fn(this) + '</a>'; },
        form: function(context, options) { return '<form>' + options.fn(context) + '</form>'; }
      }
    });
    equal(result, '<form><p>Yehuda</p><a href="Yehuda">Hello</a></form>', 'Both blocks executed');
  });

  it('block helper inverted sections', function() {
    var string = '{{#list people}}{{name}}{{^}}<em>Nobody\'s here</em>{{/list}}';
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

    var hash = {people: [{name: 'Alan'}, {name: 'Yehuda'}]};
    var empty = {people: []};
    var rootMessage = {
      people: [],
      message: 'Nobody\'s here'
    };

    var messageString = '{{#list people}}Hello{{^}}{{message}}{{/list}}';

    // the meaning here may be kind of hard to catch, but list.not is always called,
    // so we should see the output of both
    shouldCompileTo(string, [hash, { list: list }], '<ul><li>Alan</li><li>Yehuda</li></ul>', 'an inverse wrapper is passed in as a new context');
    shouldCompileTo(string, [empty, { list: list }], '<p><em>Nobody\'s here</em></p>', 'an inverse wrapper can be optionally called');
    shouldCompileTo(messageString, [rootMessage, { list: list }], '<p>Nobody&#x27;s here</p>', 'the context of an inverse is the parent of the block');
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
    shouldCompileTo('{{./helper 1}}', [hash, helpers], 'winning');
    shouldCompileTo('{{hash/helper 1}}', [hash, helpers], 'winning');
  });

  describe('helpers hash', function() {
    it('providing a helpers hash', function() {
      shouldCompileTo('Goodbye {{cruel}} {{world}}!', [{cruel: 'cruel'}, {world: function() { return 'world'; }}], 'Goodbye cruel world!',
                      'helpers hash is available');

      shouldCompileTo('Goodbye {{#iter}}{{cruel}} {{world}}{{/iter}}!', [{iter: [{cruel: 'cruel'}]}, {world: function() { return 'world'; }}],
                      'Goodbye cruel world!', 'helpers hash is available inside other blocks');
    });

    it('in cases of conflict, helpers win', function() {
      shouldCompileTo('{{{lookup}}}', [{lookup: 'Explicit'}, {lookup: function() { return 'helpers'; }}], 'helpers',
                      'helpers hash has precedence escaped expansion');
      shouldCompileTo('{{lookup}}', [{lookup: 'Explicit'}, {lookup: function() { return 'helpers'; }}], 'helpers',
                      'helpers hash has precedence simple expansion');
    });

    it('the helpers hash is available is nested contexts', function() {
      shouldCompileTo(
        '{{#outer}}{{#inner}}{{helper}}{{/inner}}{{/outer}}',
        [
          {'outer': {'inner': {'unused': []}}},
          {'helper': function() { return 'helper'; }}
        ],
        'helper',
        'helpers hash is available in nested contexts.');
    });

    it('the helper hash should augment the global hash', function() {
      handlebarsEnv.registerHelper('test_helper', function() { return 'found it!'; });

      shouldCompileTo(
        '{{test_helper}} {{#if cruel}}Goodbye {{cruel}} {{world}}!{{/if}}', [
          {cruel: 'cruel'},
          {world: function() { return 'world!'; }}
        ],
        'found it! Goodbye cruel world!!');
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
        'if': helpers['if'],
        world: function() { return 'world!'; },
        testHelper: function() { return 'found it!'; }
      });

      shouldCompileTo(
        '{{testHelper}} {{#if cruel}}Goodbye {{cruel}} {{world}}!{{/if}}',
        [{cruel: 'cruel'}],
        'found it! Goodbye cruel world!!');
    });
    it('fails with multiple and args', function() {
      shouldThrow(function() {
        handlebarsEnv.registerHelper({
          world: function() { return 'world!'; },
          testHelper: function() { return 'found it!'; }
        }, {});
      }, Error, 'Arg not supported with multiple helpers');
    });
  });

  it('decimal number literals work', function() {
    var string = 'Message: {{hello -1.2 1.2}}';
    var helpers = {hello: function(times, times2) {
      if (typeof times !== 'number') { times = 'NaN'; }
      if (typeof times2 !== 'number') { times2 = 'NaN'; }
      return 'Hello ' + times + ' ' + times2 + ' times';
    }};
    shouldCompileTo(string, [{}, helpers], 'Message: Hello -1.2 1.2 times', 'template with a negative integer literal');
  });

  it('negative number literals work', function() {
    var string = 'Message: {{hello -12}}';
    var helpers = {hello: function(times) {
      if (typeof times !== 'number') { times = 'NaN'; }
      return 'Hello ' + times + ' times';
    }};
    shouldCompileTo(string, [{}, helpers], 'Message: Hello -12 times', 'template with a negative integer literal');
  });

  describe('String literal parameters', function() {
    it('simple literals work', function() {
      var string = 'Message: {{hello "world" 12 true false}}';
      var helpers = {hello: function(param, times, bool1, bool2) {
        if (typeof times !== 'number') { times = 'NaN'; }
        if (typeof bool1 !== 'boolean') { bool1 = 'NaB'; }
        if (typeof bool2 !== 'boolean') { bool2 = 'NaB'; }
        return 'Hello ' + param + ' ' + times + ' times: ' + bool1 + ' ' + bool2;
      }};
      shouldCompileTo(string, [{}, helpers], 'Message: Hello world 12 times: true false', 'template with a simple String literal');
    });

    it('using a quote in the middle of a parameter raises an error', function() {
      var string = 'Message: {{hello wo"rld"}}';
      shouldThrow(function() {
        CompilerContext.compile(string);
      }, Error);
    });

    it('escaping a String is possible', function() {
      var string = 'Message: {{{hello "\\"world\\""}}}';
      var helpers = {hello: function(param) { return 'Hello ' + param; }};
      shouldCompileTo(string, [{}, helpers], 'Message: Hello "world"', 'template with an escaped String literal');
    });

    it("it works with ' marks", function() {
      var string = 'Message: {{{hello "Alan\'s world"}}}';
      var helpers = {hello: function(param) { return 'Hello ' + param; }};
      shouldCompileTo(string, [{}, helpers], "Message: Hello Alan's world", "template with a ' mark");
    });
  });

  it('negative number literals work', function() {
    var string = 'Message: {{hello -12}}';
    var helpers = {hello: function(times) {
      if (typeof times !== 'number') { times = 'NaN'; }
      return 'Hello ' + times + ' times';
    }};
    shouldCompileTo(string, [{}, helpers], 'Message: Hello -12 times', 'template with a negative integer literal');
  });

  describe('multiple parameters', function() {
    it('simple multi-params work', function() {
      var string = 'Message: {{goodbye cruel world}}';
      var hash = {cruel: 'cruel', world: 'world'};
      var helpers = {goodbye: function(cruel, world) { return 'Goodbye ' + cruel + ' ' + world; }};
      shouldCompileTo(string, [hash, helpers], 'Message: Goodbye cruel world', 'regular helpers with multiple params');
    });

    it('block multi-params work', function() {
      var string = 'Message: {{#goodbye cruel world}}{{greeting}} {{adj}} {{noun}}{{/goodbye}}';
      var hash = {cruel: 'cruel', world: 'world'};
      var helpers = {goodbye: function(cruel, world, options) {
        return options.fn({greeting: 'Goodbye', adj: cruel, noun: world});
      }};
      shouldCompileTo(string, [hash, helpers], 'Message: Goodbye cruel world', 'block helpers with multiple params');
    });
  });

  describe('hash', function() {
    it('helpers can take an optional hash', function() {
      var template = CompilerContext.compile('{{goodbye cruel="CRUEL" world="WORLD" times=12}}');

      var helpers = {
        goodbye: function(options) {
          return 'GOODBYE ' + options.hash.cruel + ' ' + options.hash.world + ' ' + options.hash.times + ' TIMES';
        }
      };

      var context = {};

      var result = template(context, {helpers: helpers});
      equals(result, 'GOODBYE CRUEL WORLD 12 TIMES', 'Helper output hash');
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

      var template = CompilerContext.compile('{{goodbye cruel="CRUEL" world="WORLD" print=true}}');
      var result = template(context, {helpers: helpers});
      equals(result, 'GOODBYE CRUEL WORLD', 'Helper output hash');

      template = CompilerContext.compile('{{goodbye cruel="CRUEL" world="WORLD" print=false}}');
      result = template(context, {helpers: helpers});
      equals(result, 'NOT PRINTING', 'Boolean helper parameter honored');
    });

    it('block helpers can take an optional hash', function() {
      var template = CompilerContext.compile('{{#goodbye cruel="CRUEL" times=12}}world{{/goodbye}}');

      var helpers = {
        goodbye: function(options) {
          return 'GOODBYE ' + options.hash.cruel + ' ' + options.fn(this) + ' ' + options.hash.times + ' TIMES';
        }
      };

      var result = template({}, {helpers: helpers});
      equals(result, 'GOODBYE CRUEL world 12 TIMES', 'Hash parameters output');
    });

    it('block helpers can take an optional hash with single quoted stings', function() {
      var template = CompilerContext.compile('{{#goodbye cruel="CRUEL" times=12}}world{{/goodbye}}');

      var helpers = {
        goodbye: function(options) {
          return 'GOODBYE ' + options.hash.cruel + ' ' + options.fn(this) + ' ' + options.hash.times + ' TIMES';
        }
      };

      var result = template({}, {helpers: helpers});
      equals(result, 'GOODBYE CRUEL world 12 TIMES', 'Hash parameters output');
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

      var template = CompilerContext.compile('{{#goodbye cruel="CRUEL" print=true}}world{{/goodbye}}');
      var result = template({}, {helpers: helpers});
      equals(result, 'GOODBYE CRUEL world', 'Boolean hash parameter honored');

      template = CompilerContext.compile('{{#goodbye cruel="CRUEL" print=false}}world{{/goodbye}}');
      result = template({}, {helpers: helpers});
      equals(result, 'NOT PRINTING', 'Boolean hash parameter honored');
    });
  });

  describe('helperMissing', function() {
    it('if a context is not found, helperMissing is used', function() {
      shouldThrow(function() {
          var template = CompilerContext.compile('{{hello}} {{link_to world}}');
          template({});
      }, undefined, /Missing helper: "link_to"/);
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

      shouldCompileTo(string, [context, helpers], 'Hello <a>world</a>');
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

      shouldCompileTo(string, [context, helpers], 'Hello <a>winning</a>');
    });
  });

  describe('knownHelpers', function() {
    it('Known helper should render helper', function() {
      var template = CompilerContext.compile('{{hello}}', {knownHelpers: {hello: true}});

      var result = template({}, {helpers: {hello: function() { return 'foo'; }}});
      equal(result, 'foo', "'foo' should === '" + result);
    });

    it('Unknown helper in knownHelpers only mode should be passed as undefined', function() {
      var template = CompilerContext.compile('{{typeof hello}}', {knownHelpers: {'typeof': true}, knownHelpersOnly: true});

      var result = template({}, {helpers: {'typeof': function(arg) { return typeof arg; }, hello: function() { return 'foo'; }}});
      equal(result, 'undefined', "'undefined' should === '" + result);
    });
    it('Builtin helpers available in knownHelpers only mode', function() {
      var template = CompilerContext.compile('{{#unless foo}}bar{{/unless}}', {knownHelpersOnly: true});

      var result = template({});
      equal(result, 'bar', "'bar' should === '" + result);
    });
    it('Field lookup works in knownHelpers only mode', function() {
      var template = CompilerContext.compile('{{foo}}', {knownHelpersOnly: true});

      var result = template({foo: 'bar'});
      equal(result, 'bar', "'bar' should === '" + result);
    });
    it('Conditional blocks work in knownHelpers only mode', function() {
      var template = CompilerContext.compile('{{#foo}}bar{{/foo}}', {knownHelpersOnly: true});

      var result = template({foo: 'baz'});
      equal(result, 'bar', "'bar' should === '" + result);
    });
    it('Invert blocks work in knownHelpers only mode', function() {
      var template = CompilerContext.compile('{{^foo}}bar{{/foo}}', {knownHelpersOnly: true});

      var result = template({foo: false});
      equal(result, 'bar', "'bar' should === '" + result);
    });
    it('Functions are bound to the context in knownHelpers only mode', function() {
      var template = CompilerContext.compile('{{foo}}', {knownHelpersOnly: true});
      var result = template({foo: function() { return this.bar; }, bar: 'bar'});
      equal(result, 'bar', "'bar' should === '" + result);
    });
    it('Unknown helper call in knownHelpers only mode should throw', function() {
      shouldThrow(function() {
        CompilerContext.compile('{{typeof hello}}', {knownHelpersOnly: true});
      }, Error);
    });
  });

  describe('blockHelperMissing', function() {
    it('lambdas are resolved by blockHelperMissing, not handlebars proper', function() {
      var string = '{{#truthy}}yep{{/truthy}}';
      var data = { truthy: function() { return true; } };
      shouldCompileTo(string, data, 'yep');
    });
    it('lambdas resolved by blockHelperMissing are bound to the context', function() {
      var string = '{{#truthy}}yep{{/truthy}}';
      var boundData = { truthy: function() { return this.truthiness(); }, truthiness: function() { return false; } };
      shouldCompileTo(string, boundData, '');
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
      shouldCompileTo('{{helper}}', [context, helpers], 'ran: helper');
    });
    it('should include in helper mustache calls', function() {
      shouldCompileTo('{{helper 1}}', [context, helpers], 'ran: helper');
    });
    it('should include in ambiguous block calls', function() {
      shouldCompileTo('{{#helper}}{{/helper}}', [context, helpers], 'ran: helper');
    });
    it('should include in simple block calls', function() {
      shouldCompileTo('{{#./helper}}{{/./helper}}', [context, helpers], 'missing: ./helper');
    });
    it('should include in helper block calls', function() {
      shouldCompileTo('{{#helper 1}}{{/helper}}', [context, helpers], 'ran: helper');
    });
    it('should include in known helper calls', function() {
      var template = CompilerContext.compile('{{helper}}', {knownHelpers: {'helper': true}, knownHelpersOnly: true});

      equal(template({}, {helpers: helpers}), 'ran: helper');
    });

    it('should include full id', function() {
      shouldCompileTo('{{#foo.helper}}{{/foo.helper}}', [{foo: {}}, helpers], 'missing: foo.helper');
    });

    it('should include full id if a hash is passed', function() {
      shouldCompileTo('{{#foo.helper bar=baz}}{{/foo.helper}}', [{foo: {}}, helpers], 'helper missing: foo.helper');
    });
  });

  describe('name conflicts', function() {
    it('helpers take precedence over same-named context properties', function() {
      var template = CompilerContext.compile('{{goodbye}} {{cruel world}}');

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

      var result = template(context, {helpers: helpers});
      equals(result, 'GOODBYE cruel WORLD', 'Helper executed');
    });

    it('helpers take precedence over same-named context properties$', function() {
      var template = CompilerContext.compile('{{#goodbye}} {{cruel world}}{{/goodbye}}');

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

      var result = template(context, {helpers: helpers});
      equals(result, 'GOODBYE cruel WORLD', 'Helper executed');
    });

    it('Scoped names take precedence over helpers', function() {
      var template = CompilerContext.compile('{{this.goodbye}} {{cruel world}} {{cruel this.goodbye}}');

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

      var result = template(context, {helpers: helpers});
      equals(result, 'goodbye cruel WORLD cruel GOODBYE', 'Helper not executed');
    });

    it('Scoped names take precedence over block helpers', function() {
      var template = CompilerContext.compile('{{#goodbye}} {{cruel world}}{{/goodbye}} {{this.goodbye}}');

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

      var result = template(context, {helpers: helpers});
      equals(result, 'GOODBYE cruel WORLD goodbye', 'Helper executed');
    });
  });

  describe('block params', function() {
    it('should take presedence over context values', function() {
      var hash = {value: 'foo'};
      var helpers = {
        goodbyes: function(options) {
          equals(options.fn.blockParams, 1);
          return options.fn({value: 'bar'}, {blockParams: [1, 2]});
        }
      };
      shouldCompileTo('{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{value}}', [hash, helpers], '1foo');
    });
    it('should take presedence over helper values', function() {
      var hash = {};
      var helpers = {
        value: function() {
          return 'foo';
        },
        goodbyes: function(options) {
          equals(options.fn.blockParams, 1);
          return options.fn({}, {blockParams: [1, 2]});
        }
      };
      shouldCompileTo('{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{value}}', [hash, helpers], '1foo');
    });
    it('should not take presedence over pathed values', function() {
      var hash = {value: 'bar'};
      var helpers = {
        value: function() {
          return 'foo';
        },
        goodbyes: function(options) {
          equals(options.fn.blockParams, 1);
          return options.fn(this, {blockParams: [1, 2]});
        }
      };
      shouldCompileTo('{{#goodbyes as |value|}}{{./value}}{{/goodbyes}}{{value}}', [hash, helpers], 'barfoo');
    });
    it('should take presednece over parent block params', function() {
      var hash = {value: 'foo'},
          value = 1;
      var helpers = {
        goodbyes: function(options) {
          return options.fn({value: 'bar'}, {blockParams: options.fn.blockParams === 1 ? [value++, value++] : undefined});
        }
      };
      shouldCompileTo('{{#goodbyes as |value|}}{{#goodbyes}}{{value}}{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{/goodbyes}}{{/goodbyes}}{{value}}', [hash, helpers], '13foo');
    });

    it('should allow block params on chained helpers', function() {
      var hash = {value: 'foo'};
      var helpers = {
        goodbyes: function(options) {
          equals(options.fn.blockParams, 1);
          return options.fn({value: 'bar'}, {blockParams: [1, 2]});
        }
      };
      shouldCompileTo('{{#if bar}}{{else goodbyes as |value|}}{{value}}{{/if}}{{value}}', [hash, helpers], '1foo');
    });
  });
});
