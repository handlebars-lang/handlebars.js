global.handlebarsEnv = null;

beforeEach(function () {
  global.handlebarsEnv = Handlebars.create();
});

describe('basic context', function () {
  it('most basic', function () {
    expectTemplate('{{foo}}').withInput({ foo: 'foo' }).toCompileTo('foo');
  });

  it('escaping', function () {
    expectTemplate('\\{{foo}}')
      .withInput({ foo: 'food' })
      .toCompileTo('{{foo}}');

    expectTemplate('content \\{{foo}}')
      .withInput({ foo: 'food' })
      .toCompileTo('content {{foo}}');

    expectTemplate('\\\\{{foo}}')
      .withInput({ foo: 'food' })
      .toCompileTo('\\food');

    expectTemplate('content \\\\{{foo}}')
      .withInput({ foo: 'food' })
      .toCompileTo('content \\food');

    expectTemplate('\\\\ {{foo}}')
      .withInput({ foo: 'food' })
      .toCompileTo('\\\\ food');
  });

  it('compiling with a basic context', function () {
    expectTemplate('Goodbye\n{{cruel}}\n{{world}}!')
      .withInput({
        cruel: 'cruel',
        world: 'world',
      })
      .withMessage('It works if all the required keys are provided')
      .toCompileTo('Goodbye\ncruel\nworld!');
  });

  it('compiling with a string context', function () {
    expectTemplate('{{.}}{{length}}').withInput('bye').toCompileTo('bye3');
  });

  it('compiling with an undefined context', function () {
    expectTemplate('Goodbye\n{{cruel}}\n{{world.bar}}!')
      .withInput(undefined)
      .toCompileTo('Goodbye\n\n!');

    expectTemplate('{{#unless foo}}Goodbye{{../test}}{{test2}}{{/unless}}')
      .withInput(undefined)
      .toCompileTo('Goodbye');
  });

  it('comments', function () {
    expectTemplate('{{! Goodbye}}Goodbye\n{{cruel}}\n{{world}}!')
      .withInput({
        cruel: 'cruel',
        world: 'world',
      })
      .withMessage('comments are ignored')
      .toCompileTo('Goodbye\ncruel\nworld!');

    expectTemplate('    {{~! comment ~}}      blah').toCompileTo('blah');

    expectTemplate('    {{~!-- long-comment --~}}      blah').toCompileTo(
      'blah'
    );

    expectTemplate('    {{! comment ~}}      blah').toCompileTo('    blah');

    expectTemplate('    {{!-- long-comment --~}}      blah').toCompileTo(
      '    blah'
    );

    expectTemplate('    {{~! comment}}      blah').toCompileTo('      blah');

    expectTemplate('    {{~!-- long-comment --}}      blah').toCompileTo(
      '      blah'
    );
  });

  it('boolean', function () {
    var string = '{{#goodbye}}GOODBYE {{/goodbye}}cruel {{world}}!';
    expectTemplate(string)
      .withInput({
        goodbye: true,
        world: 'world',
      })
      .withMessage('booleans show the contents when true')
      .toCompileTo('GOODBYE cruel world!');

    expectTemplate(string)
      .withInput({
        goodbye: false,
        world: 'world',
      })
      .withMessage('booleans do not show the contents when false')
      .toCompileTo('cruel world!');
  });

  it('zeros', function () {
    expectTemplate('num1: {{num1}}, num2: {{num2}}')
      .withInput({
        num1: 42,
        num2: 0,
      })
      .toCompileTo('num1: 42, num2: 0');

    expectTemplate('num: {{.}}').withInput(0).toCompileTo('num: 0');

    expectTemplate('num: {{num1/num2}}')
      .withInput({ num1: { num2: 0 } })
      .toCompileTo('num: 0');
  });

  it('false', function () {
    /* eslint-disable no-new-wrappers */
    expectTemplate('val1: {{val1}}, val2: {{val2}}')
      .withInput({
        val1: false,
        val2: new Boolean(false),
      })
      .toCompileTo('val1: false, val2: false');

    expectTemplate('val: {{.}}').withInput(false).toCompileTo('val: false');

    expectTemplate('val: {{val1/val2}}')
      .withInput({ val1: { val2: false } })
      .toCompileTo('val: false');

    expectTemplate('val1: {{{val1}}}, val2: {{{val2}}}')
      .withInput({
        val1: false,
        val2: new Boolean(false),
      })
      .toCompileTo('val1: false, val2: false');

    expectTemplate('val: {{{val1/val2}}}')
      .withInput({ val1: { val2: false } })
      .toCompileTo('val: false');
    /* eslint-enable */
  });

  it('should handle undefined and null', function () {
    expectTemplate('{{awesome undefined null}}')
      .withInput({
        awesome: function (_undefined, _null, options) {
          return (
            (_undefined === undefined) +
            ' ' +
            (_null === null) +
            ' ' +
            typeof options
          );
        },
      })
      .toCompileTo('true true object');

    expectTemplate('{{undefined}}')
      .withInput({
        undefined: function () {
          return 'undefined!';
        },
      })
      .toCompileTo('undefined!');

    expectTemplate('{{null}}')
      .withInput({
        null: function () {
          return 'null!';
        },
      })
      .toCompileTo('null!');
  });

  it('newlines', function () {
    expectTemplate("Alan's\nTest").toCompileTo("Alan's\nTest");

    expectTemplate("Alan's\rTest").toCompileTo("Alan's\rTest");
  });

  it('escaping text', function () {
    expectTemplate("Awesome's")
      .withMessage(
        "text is escaped so that it doesn't get caught on single quotes"
      )
      .toCompileTo("Awesome's");

    expectTemplate('Awesome\\')
      .withMessage("text is escaped so that the closing quote can't be ignored")
      .toCompileTo('Awesome\\');

    expectTemplate('Awesome\\\\ foo')
      .withMessage("text is escaped so that it doesn't mess up backslashes")
      .toCompileTo('Awesome\\\\ foo');

    expectTemplate('Awesome {{foo}}')
      .withInput({ foo: '\\' })
      .withMessage("text is escaped so that it doesn't mess up backslashes")
      .toCompileTo('Awesome \\');

    expectTemplate(" ' ' ")
      .withMessage('double quotes never produce invalid javascript')
      .toCompileTo(" ' ' ");
  });

  it('escaping expressions', function () {
    expectTemplate('{{{awesome}}}')
      .withInput({ awesome: "&'\\<>" })
      .withMessage("expressions with 3 handlebars aren't escaped")
      .toCompileTo("&'\\<>");

    expectTemplate('{{&awesome}}')
      .withInput({ awesome: "&'\\<>" })
      .withMessage("expressions with {{& handlebars aren't escaped")
      .toCompileTo("&'\\<>");

    expectTemplate('{{awesome}}')
      .withInput({ awesome: '&"\'`\\<>' })
      .withMessage('by default expressions should be escaped')
      .toCompileTo('&amp;&quot;&#x27;&#x60;\\&lt;&gt;');

    expectTemplate('{{awesome}}')
      .withInput({ awesome: 'Escaped, <b> looks like: &lt;b&gt;' })
      .withMessage('escaping should properly handle amperstands')
      .toCompileTo('Escaped, &lt;b&gt; looks like: &amp;lt;b&amp;gt;');
  });

  it("functions returning safestrings shouldn't be escaped", function () {
    expectTemplate('{{awesome}}')
      .withInput({
        awesome: function () {
          return new Handlebars.SafeString("&'\\<>");
        },
      })
      .withMessage("functions returning safestrings aren't escaped")
      .toCompileTo("&'\\<>");
  });

  it('functions', function () {
    expectTemplate('{{awesome}}')
      .withInput({
        awesome: function () {
          return 'Awesome';
        },
      })
      .withMessage('functions are called and render their output')
      .toCompileTo('Awesome');

    expectTemplate('{{awesome}}')
      .withInput({
        awesome: function () {
          return this.more;
        },
        more: 'More awesome',
      })
      .withMessage('functions are bound to the context')
      .toCompileTo('More awesome');
  });

  it('functions with context argument', function () {
    expectTemplate('{{awesome frank}}')
      .withInput({
        awesome: function (context) {
          return context;
        },
        frank: 'Frank',
      })
      .withMessage('functions are called with context arguments')
      .toCompileTo('Frank');
  });

  it('pathed functions with context argument', function () {
    expectTemplate('{{bar.awesome frank}}')
      .withInput({
        bar: {
          awesome: function (context) {
            return context;
          },
        },
        frank: 'Frank',
      })
      .withMessage('functions are called with context arguments')
      .toCompileTo('Frank');
  });

  it('depthed functions with context argument', function () {
    expectTemplate('{{#with frank}}{{../awesome .}}{{/with}}')
      .withInput({
        awesome: function (context) {
          return context;
        },
        frank: 'Frank',
      })
      .withMessage('functions are called with context arguments')
      .toCompileTo('Frank');
  });

  it('block functions with context argument', function () {
    expectTemplate('{{#awesome 1}}inner {{.}}{{/awesome}}')
      .withInput({
        awesome: function (context, options) {
          return options.fn(context);
        },
      })
      .withMessage('block functions are called with context and options')
      .toCompileTo('inner 1');
  });

  it('depthed block functions with context argument', function () {
    expectTemplate(
      '{{#with value}}{{#../awesome 1}}inner {{.}}{{/../awesome}}{{/with}}'
    )
      .withInput({
        value: true,
        awesome: function (context, options) {
          return options.fn(context);
        },
      })
      .withMessage('block functions are called with context and options')
      .toCompileTo('inner 1');
  });

  it('block functions without context argument', function () {
    expectTemplate('{{#awesome}}inner{{/awesome}}')
      .withInput({
        awesome: function (options) {
          return options.fn(this);
        },
      })
      .withMessage('block functions are called with options')
      .toCompileTo('inner');
  });

  it('pathed block functions without context argument', function () {
    expectTemplate('{{#foo.awesome}}inner{{/foo.awesome}}')
      .withInput({
        foo: {
          awesome: function () {
            return this;
          },
        },
      })
      .withMessage('block functions are called with options')
      .toCompileTo('inner');
  });

  it('depthed block functions without context argument', function () {
    expectTemplate(
      '{{#with value}}{{#../awesome}}inner{{/../awesome}}{{/with}}'
    )
      .withInput({
        value: true,
        awesome: function () {
          return this;
        },
      })
      .withMessage('block functions are called with options')
      .toCompileTo('inner');
  });

  it('paths with hyphens', function () {
    expectTemplate('{{foo-bar}}')
      .withInput({ 'foo-bar': 'baz' })
      .withMessage('Paths can contain hyphens (-)')
      .toCompileTo('baz');

    expectTemplate('{{foo.foo-bar}}')
      .withInput({ foo: { 'foo-bar': 'baz' } })
      .withMessage('Paths can contain hyphens (-)')
      .toCompileTo('baz');

    expectTemplate('{{foo/foo-bar}}')
      .withInput({ foo: { 'foo-bar': 'baz' } })
      .withMessage('Paths can contain hyphens (-)')
      .toCompileTo('baz');
  });

  it('nested paths', function () {
    expectTemplate('Goodbye {{alan/expression}} world!')
      .withInput({ alan: { expression: 'beautiful' } })
      .withMessage('Nested paths access nested objects')
      .toCompileTo('Goodbye beautiful world!');
  });

  it('nested paths with Map', function () {
    expectTemplate('Goodbye {{alan/expression}} world!')
      .withInput({ alan: new Map([['expression', 'beautiful']]) })
      .withMessage('Nested paths access nested objects')
      .toCompileTo('Goodbye beautiful world!');
  });

  it('nested paths with empty string value', function () {
    expectTemplate('Goodbye {{alan/expression}} world!')
      .withInput({ alan: { expression: '' } })
      .withMessage('Nested paths access nested objects with empty string')
      .toCompileTo('Goodbye  world!');
  });

  it('literal paths', function () {
    expectTemplate('Goodbye {{[@alan]/expression}} world!')
      .withInput({ '@alan': { expression: 'beautiful' } })
      .withMessage('Literal paths can be used')
      .toCompileTo('Goodbye beautiful world!');

    expectTemplate('Goodbye {{[foo bar]/expression}} world!')
      .withInput({ 'foo bar': { expression: 'beautiful' } })
      .withMessage('Literal paths can be used')
      .toCompileTo('Goodbye beautiful world!');
  });

  it('literal references', function () {
    expectTemplate('Goodbye {{[foo bar]}} world!')
      .withInput({ 'foo bar': 'beautiful' })
      .toCompileTo('Goodbye beautiful world!');

    expectTemplate('Goodbye {{"foo bar"}} world!')
      .withInput({ 'foo bar': 'beautiful' })
      .toCompileTo('Goodbye beautiful world!');

    expectTemplate("Goodbye {{'foo bar'}} world!")
      .withInput({ 'foo bar': 'beautiful' })
      .toCompileTo('Goodbye beautiful world!');

    expectTemplate('Goodbye {{"foo[bar"}} world!')
      .withInput({ 'foo[bar': 'beautiful' })
      .toCompileTo('Goodbye beautiful world!');

    expectTemplate('Goodbye {{"foo\'bar"}} world!')
      .withInput({ "foo'bar": 'beautiful' })
      .toCompileTo('Goodbye beautiful world!');

    expectTemplate("Goodbye {{'foo\"bar'}} world!")
      .withInput({ 'foo"bar': 'beautiful' })
      .toCompileTo('Goodbye beautiful world!');
  });

  it("that current context path ({{.}}) doesn't hit helpers", function () {
    expectTemplate('test: {{.}}')
      .withInput(null)
      .withHelpers({ helper: 'awesome' })
      .toCompileTo('test: ');
  });

  it('complex but empty paths', function () {
    expectTemplate('{{person/name}}')
      .withInput({ person: { name: null } })
      .toCompileTo('');

    expectTemplate('{{person/name}}').withInput({ person: {} }).toCompileTo('');
  });

  it('this keyword in paths', function () {
    expectTemplate('{{#goodbyes}}{{this}}{{/goodbyes}}')
      .withInput({ goodbyes: ['goodbye', 'Goodbye', 'GOODBYE'] })
      .withMessage('This keyword in paths evaluates to current context')
      .toCompileTo('goodbyeGoodbyeGOODBYE');

    expectTemplate('{{#hellos}}{{this/text}}{{/hellos}}')
      .withInput({
        hellos: [{ text: 'hello' }, { text: 'Hello' }, { text: 'HELLO' }],
      })
      .withMessage('This keyword evaluates in more complex paths')
      .toCompileTo('helloHelloHELLO');
  });

  it('this keyword nested inside path', function () {
    expectTemplate('{{#hellos}}{{text/this/foo}}{{/hellos}}').toThrow(
      Error,
      'Invalid path: text/this - 1:13'
    );

    expectTemplate('{{[this]}}').withInput({ this: 'bar' }).toCompileTo('bar');

    expectTemplate('{{text/[this]}}')
      .withInput({ text: { this: 'bar' } })
      .toCompileTo('bar');
  });

  it('this keyword in helpers', function () {
    var helpers = {
      foo: function (value) {
        return 'bar ' + value;
      },
    };

    expectTemplate('{{#goodbyes}}{{foo this}}{{/goodbyes}}')
      .withInput({ goodbyes: ['goodbye', 'Goodbye', 'GOODBYE'] })
      .withHelpers(helpers)
      .withMessage('This keyword in paths evaluates to current context')
      .toCompileTo('bar goodbyebar Goodbyebar GOODBYE');

    expectTemplate('{{#hellos}}{{foo this/text}}{{/hellos}}')
      .withInput({
        hellos: [{ text: 'hello' }, { text: 'Hello' }, { text: 'HELLO' }],
      })
      .withHelpers(helpers)
      .withMessage('This keyword evaluates in more complex paths')
      .toCompileTo('bar hellobar Hellobar HELLO');
  });

  it('this keyword nested inside helpers param', function () {
    expectTemplate('{{#hellos}}{{foo text/this/foo}}{{/hellos}}').toThrow(
      Error,
      'Invalid path: text/this - 1:17'
    );

    expectTemplate('{{foo [this]}}')
      .withInput({
        foo: function (value) {
          return value;
        },
        this: 'bar',
      })
      .toCompileTo('bar');

    expectTemplate('{{foo text/[this]}}')
      .withInput({
        foo: function (value) {
          return value;
        },
        text: { this: 'bar' },
      })
      .toCompileTo('bar');
  });

  it('pass string literals', function () {
    expectTemplate('{{"foo"}}').toCompileTo('');

    expectTemplate('{{"foo"}}').withInput({ foo: 'bar' }).toCompileTo('bar');

    expectTemplate('{{#"foo"}}{{.}}{{/"foo"}}')
      .withInput({
        foo: ['bar', 'baz'],
      })
      .toCompileTo('barbaz');
  });

  it('pass number literals', function () {
    expectTemplate('{{12}}').toCompileTo('');

    expectTemplate('{{12}}').withInput({ 12: 'bar' }).toCompileTo('bar');

    expectTemplate('{{12.34}}').toCompileTo('');

    expectTemplate('{{12.34}}').withInput({ 12.34: 'bar' }).toCompileTo('bar');

    expectTemplate('{{12.34 1}}')
      .withInput({
        12.34: function (arg) {
          return 'bar' + arg;
        },
      })
      .toCompileTo('bar1');
  });

  it('pass boolean literals', function () {
    expectTemplate('{{true}}').toCompileTo('');

    expectTemplate('{{true}}').withInput({ '': 'foo' }).toCompileTo('');

    expectTemplate('{{false}}').withInput({ false: 'foo' }).toCompileTo('foo');
  });

  it('should handle literals in subexpression', function () {
    expectTemplate('{{foo (false)}}')
      .withInput({
        false: function () {
          return 'bar';
        },
      })
      .withHelper('foo', function (arg) {
        return arg;
      })
      .toCompileTo('bar');
  });
});
