global.handlebarsEnv = null;

beforeEach(function() {
  global.handlebarsEnv = Handlebars.create();
});

describe('basic context', function() {
  it('most basic', function() {
    shouldCompileTo('{{foo}}', { foo: 'foo' }, 'foo');
  });

  it('escaping', function() {
    shouldCompileTo('\\{{foo}}', { foo: 'food' }, '{{foo}}');
    shouldCompileTo('content \\{{foo}}', { foo: 'food' }, 'content {{foo}}');
    shouldCompileTo('\\\\{{foo}}', { foo: 'food' }, '\\food');
    shouldCompileTo('content \\\\{{foo}}', { foo: 'food' }, 'content \\food');
    shouldCompileTo('\\\\ {{foo}}', { foo: 'food' }, '\\\\ food');
  });

  it('compiling with a basic context', function() {
    shouldCompileTo('Goodbye\n{{cruel}}\n{{world}}!', {cruel: 'cruel', world: 'world'}, 'Goodbye\ncruel\nworld!',
                    'It works if all the required keys are provided');
  });

  it('compiling with a string context', function() {
    shouldCompileTo('{{.}}{{length}}', 'bye', 'bye3');
  });

  it('compiling with an undefined context', function() {
    shouldCompileTo('Goodbye\n{{cruel}}\n{{world.bar}}!', undefined, 'Goodbye\n\n!');

    shouldCompileTo('{{#unless foo}}Goodbye{{../test}}{{test2}}{{/unless}}', undefined, 'Goodbye');
  });

  it('comments', function() {
    shouldCompileTo('{{! Goodbye}}Goodbye\n{{cruel}}\n{{world}}!',
      {cruel: 'cruel', world: 'world'}, 'Goodbye\ncruel\nworld!',
      'comments are ignored');

    shouldCompileTo('    {{~! comment ~}}      blah', {}, 'blah');
    shouldCompileTo('    {{~!-- long-comment --~}}      blah', {}, 'blah');
    shouldCompileTo('    {{! comment ~}}      blah', {}, '    blah');
    shouldCompileTo('    {{!-- long-comment --~}}      blah', {}, '    blah');
    shouldCompileTo('    {{~! comment}}      blah', {}, '      blah');
    shouldCompileTo('    {{~!-- long-comment --}}      blah', {}, '      blah');
  });

  it('boolean', function() {
    var string = '{{#goodbye}}GOODBYE {{/goodbye}}cruel {{world}}!';
    shouldCompileTo(string, {goodbye: true, world: 'world'}, 'GOODBYE cruel world!',
                    'booleans show the contents when true');

    shouldCompileTo(string, {goodbye: false, world: 'world'}, 'cruel world!',
                    'booleans do not show the contents when false');
  });

  it('zeros', function() {
    shouldCompileTo('num1: {{num1}}, num2: {{num2}}', {num1: 42, num2: 0},
        'num1: 42, num2: 0');
    shouldCompileTo('num: {{.}}', 0, 'num: 0');
    shouldCompileTo('num: {{num1/num2}}', {num1: {num2: 0}}, 'num: 0');
  });
  it('false', function() {
    /* eslint-disable no-new-wrappers */
    shouldCompileTo('val1: {{val1}}, val2: {{val2}}', {val1: false, val2: new Boolean(false)}, 'val1: false, val2: false');
    shouldCompileTo('val: {{.}}', false, 'val: false');
    shouldCompileTo('val: {{val1/val2}}', {val1: {val2: false}}, 'val: false');

    shouldCompileTo('val1: {{{val1}}}, val2: {{{val2}}}', {val1: false, val2: new Boolean(false)}, 'val1: false, val2: false');
    shouldCompileTo('val: {{{val1/val2}}}', {val1: {val2: false}}, 'val: false');
    /* eslint-enable */
  });

  it('should handle undefined and null', function() {
    shouldCompileTo('{{awesome undefined null}}',
        {
          awesome: function(_undefined, _null, options) {
            return (_undefined === undefined) + ' ' + (_null === null) + ' ' + (typeof options);
          }
        },
        'true true object');
    shouldCompileTo('{{undefined}}',
        {
          'undefined': function() {
            return 'undefined!';
          }
        },
        'undefined!');
    shouldCompileTo('{{null}}',
        {
          'null': function() {
            return 'null!';
          }
        },
        'null!');
  });

  it('newlines', function() {
      shouldCompileTo("Alan's\nTest", {}, "Alan's\nTest");
      shouldCompileTo("Alan's\rTest", {}, "Alan's\rTest");
  });

  it('escaping text', function() {
    shouldCompileTo("Awesome's", {}, "Awesome's", "text is escaped so that it doesn't get caught on single quotes");
    shouldCompileTo('Awesome\\', {}, 'Awesome\\', "text is escaped so that the closing quote can't be ignored");
    shouldCompileTo('Awesome\\\\ foo', {}, 'Awesome\\\\ foo', "text is escaped so that it doesn't mess up backslashes");
    shouldCompileTo('Awesome {{foo}}', {foo: '\\'}, 'Awesome \\', "text is escaped so that it doesn't mess up backslashes");
    shouldCompileTo(" ' ' ", {}, " ' ' ", 'double quotes never produce invalid javascript');
  });

  it('escaping expressions', function() {
   shouldCompileTo('{{{awesome}}}', {awesome: '&\'\\<>'}, '&\'\\<>',
          "expressions with 3 handlebars aren't escaped");

   shouldCompileTo('{{&awesome}}', {awesome: '&\'\\<>'}, '&\'\\<>',
          "expressions with {{& handlebars aren't escaped");

   shouldCompileTo('{{awesome}}', {awesome: "&\"'`\\<>"}, '&amp;&quot;&#x27;&#x60;\\&lt;&gt;',
          'by default expressions should be escaped');

   shouldCompileTo('{{awesome}}', {awesome: 'Escaped, <b> looks like: &lt;b&gt;'}, 'Escaped, &lt;b&gt; looks like: &amp;lt;b&amp;gt;',
          'escaping should properly handle amperstands');
  });

  it("functions returning safestrings shouldn't be escaped", function() {
    var hash = {awesome: function() { return new Handlebars.SafeString('&\'\\<>'); }};
    shouldCompileTo('{{awesome}}', hash, '&\'\\<>',
        "functions returning safestrings aren't escaped");
  });

  it('functions', function() {
    shouldCompileTo('{{awesome}}', {awesome: function() { return 'Awesome'; }}, 'Awesome',
                    'functions are called and render their output');
    shouldCompileTo('{{awesome}}', {awesome: function() { return this.more; }, more: 'More awesome'}, 'More awesome',
                    'functions are bound to the context');
  });

  it('functions with context argument', function() {
    shouldCompileTo('{{awesome frank}}',
        {awesome: function(context) { return context; },
          frank: 'Frank'},
        'Frank', 'functions are called with context arguments');
  });
  it('pathed functions with context argument', function() {
    shouldCompileTo('{{bar.awesome frank}}',
        {bar: {awesome: function(context) { return context; }},
          frank: 'Frank'},
        'Frank', 'functions are called with context arguments');
  });
  it('depthed functions with context argument', function() {
    shouldCompileTo('{{#with frank}}{{../awesome .}}{{/with}}',
        {awesome: function(context) { return context; },
          frank: 'Frank'},
        'Frank', 'functions are called with context arguments');
  });

  it('block functions with context argument', function() {
    shouldCompileTo('{{#awesome 1}}inner {{.}}{{/awesome}}',
        {awesome: function(context, options) { return options.fn(context); }},
        'inner 1', 'block functions are called with context and options');
  });

  it('depthed block functions with context argument', function() {
    shouldCompileTo('{{#with value}}{{#../awesome 1}}inner {{.}}{{/../awesome}}{{/with}}',
        {value: true, awesome: function(context, options) { return options.fn(context); }},
        'inner 1', 'block functions are called with context and options');
  });

  it('block functions without context argument', function() {
    shouldCompileTo('{{#awesome}}inner{{/awesome}}',
        {awesome: function(options) { return options.fn(this); }},
        'inner', 'block functions are called with options');
  });
  it('pathed block functions without context argument', function() {
    shouldCompileTo('{{#foo.awesome}}inner{{/foo.awesome}}',
        {foo: {awesome: function() { return this; }}},
        'inner', 'block functions are called with options');
  });
  it('depthed block functions without context argument', function() {
    shouldCompileTo('{{#with value}}{{#../awesome}}inner{{/../awesome}}{{/with}}',
        {value: true, awesome: function() { return this; }},
        'inner', 'block functions are called with options');
  });


  it('paths with hyphens', function() {
    shouldCompileTo('{{foo-bar}}', {'foo-bar': 'baz'}, 'baz', 'Paths can contain hyphens (-)');
    shouldCompileTo('{{foo.foo-bar}}', {foo: {'foo-bar': 'baz'}}, 'baz', 'Paths can contain hyphens (-)');
    shouldCompileTo('{{foo/foo-bar}}', {foo: {'foo-bar': 'baz'}}, 'baz', 'Paths can contain hyphens (-)');
  });

  it('nested paths', function() {
    shouldCompileTo('Goodbye {{alan/expression}} world!', {alan: {expression: 'beautiful'}},
                    'Goodbye beautiful world!', 'Nested paths access nested objects');
  });

  it('nested paths with empty string value', function() {
    shouldCompileTo('Goodbye {{alan/expression}} world!', {alan: {expression: ''}},
                    'Goodbye  world!', 'Nested paths access nested objects with empty string');
  });

  it('literal paths', function() {
    shouldCompileTo('Goodbye {{[@alan]/expression}} world!', {'@alan': {expression: 'beautiful'}},
        'Goodbye beautiful world!', 'Literal paths can be used');
    shouldCompileTo('Goodbye {{[foo bar]/expression}} world!', {'foo bar': {expression: 'beautiful'}},
        'Goodbye beautiful world!', 'Literal paths can be used');
  });

  it('literal references', function() {
    shouldCompileTo('Goodbye {{[foo bar]}} world!', {'foo bar': 'beautiful'}, 'Goodbye beautiful world!');
    shouldCompileTo('Goodbye {{"foo bar"}} world!', {'foo bar': 'beautiful'}, 'Goodbye beautiful world!');
    shouldCompileTo("Goodbye {{'foo bar'}} world!", {'foo bar': 'beautiful'}, 'Goodbye beautiful world!');
    shouldCompileTo('Goodbye {{"foo[bar"}} world!', {'foo[bar': 'beautiful'}, 'Goodbye beautiful world!');
    shouldCompileTo('Goodbye {{"foo\'bar"}} world!', {"foo'bar": 'beautiful'}, 'Goodbye beautiful world!');
    shouldCompileTo("Goodbye {{'foo\"bar'}} world!", {'foo"bar': 'beautiful'}, 'Goodbye beautiful world!');
  });

  it("that current context path ({{.}}) doesn't hit helpers", function() {
    shouldCompileTo('test: {{.}}', [null, {helper: 'awesome'}], 'test: ');
  });

  it('complex but empty paths', function() {
    shouldCompileTo('{{person/name}}', {person: {name: null}}, '');
    shouldCompileTo('{{person/name}}', {person: {}}, '');
  });

  it('this keyword in paths', function() {
    var string = '{{#goodbyes}}{{this}}{{/goodbyes}}';
    var hash = {goodbyes: ['goodbye', 'Goodbye', 'GOODBYE']};
    shouldCompileTo(string, hash, 'goodbyeGoodbyeGOODBYE',
      'This keyword in paths evaluates to current context');

    string = '{{#hellos}}{{this/text}}{{/hellos}}';
    hash = {hellos: [{text: 'hello'}, {text: 'Hello'}, {text: 'HELLO'}]};
    shouldCompileTo(string, hash, 'helloHelloHELLO', 'This keyword evaluates in more complex paths');
  });

  it('this keyword nested inside path', function() {
    shouldThrow(function() {
      CompilerContext.compile('{{#hellos}}{{text/this/foo}}{{/hellos}}');
    }, Error, 'Invalid path: text/this - 1:13');

    shouldCompileTo('{{[this]}}', {'this': 'bar'}, 'bar');
    shouldCompileTo('{{text/[this]}}', {text: {'this': 'bar'}}, 'bar');
  });

  it('this keyword in helpers', function() {
    var helpers = {foo: function(value) {
        return 'bar ' + value;
    }};
    var string = '{{#goodbyes}}{{foo this}}{{/goodbyes}}';
    var hash = {goodbyes: ['goodbye', 'Goodbye', 'GOODBYE']};
    shouldCompileTo(string, [hash, helpers], 'bar goodbyebar Goodbyebar GOODBYE',
      'This keyword in paths evaluates to current context');

    string = '{{#hellos}}{{foo this/text}}{{/hellos}}';
    hash = {hellos: [{text: 'hello'}, {text: 'Hello'}, {text: 'HELLO'}]};
    shouldCompileTo(string, [hash, helpers], 'bar hellobar Hellobar HELLO', 'This keyword evaluates in more complex paths');
  });

  it('this keyword nested inside helpers param', function() {
    var string = '{{#hellos}}{{foo text/this/foo}}{{/hellos}}';
    shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error, 'Invalid path: text/this - 1:17');

    shouldCompileTo(
        '{{foo [this]}}',
        {foo: function(value) { return value; }, 'this': 'bar'},
        'bar');
    shouldCompileTo(
        '{{foo text/[this]}}',
        {foo: function(value) { return value; }, text: {'this': 'bar'}},
        'bar');
  });

  it('pass string literals', function() {
    shouldCompileTo('{{"foo"}}', {}, '');
    shouldCompileTo('{{"foo"}}', { foo: 'bar' }, 'bar');
    shouldCompileTo('{{#"foo"}}{{.}}{{/"foo"}}', { foo: ['bar', 'baz'] }, 'barbaz');
  });

  it('pass number literals', function() {
    shouldCompileTo('{{12}}', {}, '');
    shouldCompileTo('{{12}}', { '12': 'bar' }, 'bar');
    shouldCompileTo('{{12.34}}', {}, '');
    shouldCompileTo('{{12.34}}', { '12.34': 'bar' }, 'bar');
    shouldCompileTo('{{12.34 1}}', { '12.34': function(arg) { return 'bar' + arg; } }, 'bar1');
  });

  it('pass boolean literals', function() {
    shouldCompileTo('{{true}}', {}, '');
    shouldCompileTo('{{true}}', { '': 'foo' }, '');
    shouldCompileTo('{{false}}', { 'false': 'foo' }, 'foo');
  });

  it('should handle literals in subexpression', function() {
    var helpers = {
      foo: function(arg) {
        return arg;
      }
    };
    shouldCompileTo('{{foo (false)}}', [{ 'false': function() { return 'bar'; } }, helpers], 'bar');
  });
});
