describe('Regressions', function() {
  it('GH-94: Cannot read property of undefined', function() {
    var data = {
      'books': [{
        'title': 'The origin of species',
        'author': {
          'name': 'Charles Darwin'
        }
      }, {
        'title': 'Lazarillo de Tormes'
      }]
    };
    var string = '{{#books}}{{title}}{{author.name}}{{/books}}';
    shouldCompileTo(string, data, 'The origin of speciesCharles DarwinLazarillo de Tormes',
                    'Renders without an undefined property error');
  });

  it("GH-150: Inverted sections print when they shouldn't", function() {
    var string = '{{^set}}not set{{/set}} :: {{#set}}set{{/set}}';

    shouldCompileTo(string, {}, 'not set :: ', "inverted sections run when property isn't present in context");
    shouldCompileTo(string, {set: undefined}, 'not set :: ', 'inverted sections run when property is undefined');
    shouldCompileTo(string, {set: false}, 'not set :: ', 'inverted sections run when property is false');
    shouldCompileTo(string, {set: true}, ' :: set', "inverted sections don't run when property is true");
  });

  it('GH-158: Using array index twice, breaks the template', function() {
    var string = '{{arr.[0]}}, {{arr.[1]}}';
    var data = { 'arr': [1, 2] };

    shouldCompileTo(string, data, '1, 2', 'it works as expected');
  });

  it("bug reported by @fat where lambdas weren't being properly resolved", function() {
    var string = '<strong>This is a slightly more complicated {{thing}}.</strong>.\n'
        + '{{! Just ignore this business. }}\n'
        + 'Check this out:\n'
        + '{{#hasThings}}\n'
        + '<ul>\n'
        + '{{#things}}\n'
        + '<li class={{className}}>{{word}}</li>\n'
        + '{{/things}}</ul>.\n'
        + '{{/hasThings}}\n'
        + '{{^hasThings}}\n'
        + '\n'
        + '<small>Nothing to check out...</small>\n'
        + '{{/hasThings}}';
    var data = {
      thing: function() {
        return 'blah';
      },
      things: [
        {className: 'one', word: '@fat'},
        {className: 'two', word: '@dhg'},
        {className: 'three', word: '@sayrer'}
      ],
      hasThings: function() {
        return true;
      }
    };

    var output = '<strong>This is a slightly more complicated blah.</strong>.\n'
        + 'Check this out:\n'
        + '<ul>\n'
        + '<li class=one>@fat</li>\n'
        + '<li class=two>@dhg</li>\n'
        + '<li class=three>@sayrer</li>\n'
        + '</ul>.\n';
    shouldCompileTo(string, data, output);
  });

  it('GH-408: Multiple loops fail', function() {
    var context = [
      { name: 'John Doe', location: { city: 'Chicago' } },
      { name: 'Jane Doe', location: { city: 'New York'} }
    ];

    var template = CompilerContext.compile('{{#.}}{{name}}{{/.}}{{#.}}{{name}}{{/.}}{{#.}}{{name}}{{/.}}');

    var result = template(context);
    equals(result, 'John DoeJane DoeJohn DoeJane DoeJohn DoeJane Doe', 'It should output multiple times');
  });

  it('GS-428: Nested if else rendering', function() {
    var succeedingTemplate = '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}}  {{#blk}} Expected {{/blk}} {{/inverse}}';
    var failingTemplate = '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}} {{#blk}} Expected {{/blk}} {{/inverse}}';

    var helpers = {
      blk: function(block) { return block.fn(''); },
      inverse: function(block) { return block.inverse(''); }
    };

    shouldCompileTo(succeedingTemplate, [{}, helpers], '   Expected  ');
    shouldCompileTo(failingTemplate, [{}, helpers], '  Expected  ');
  });

  it('GH-458: Scoped this identifier', function() {
    shouldCompileTo('{{./foo}}', {foo: 'bar'}, 'bar');
  });

  it('GH-375: Unicode line terminators', function() {
    shouldCompileTo('\u2028', {}, '\u2028');
  });

  it('GH-534: Object prototype aliases', function() {
    /* eslint-disable no-extend-native */
    Object.prototype[0xD834] = true;

    shouldCompileTo('{{foo}}', { foo: 'bar' }, 'bar');

    delete Object.prototype[0xD834];
    /* eslint-enable no-extend-native */
  });

  it('GH-437: Matching escaping', function() {
    shouldThrow(function() {
      CompilerContext.compile('{{{a}}');
    }, Error);
    shouldThrow(function() {
      CompilerContext.compile('{{a}}}');
    }, Error);
  });

  it('GH-676: Using array in escaping mustache fails', function() {
    var string = '{{arr}}';
    var data = { 'arr': [1, 2] };

    shouldCompileTo(string, data, data.arr.toString(), 'it works as expected');
  });

  it('Mustache man page', function() {
    var string = 'Hello {{name}}. You have just won ${{value}}!{{#in_ca}} Well, ${{taxed_value}}, after taxes.{{/in_ca}}';
    var data = {
      'name': 'Chris',
      'value': 10000,
      'taxed_value': 10000 - (10000 * 0.4),
      'in_ca': true
    };

    shouldCompileTo(string, data, 'Hello Chris. You have just won $10000! Well, $6000, after taxes.', 'the hello world mustache example works');
  });

  it('GH-731: zero context rendering', function() {
    shouldCompileTo('{{#foo}} This is {{bar}} ~ {{/foo}}', {foo: 0, bar: 'OK'}, ' This is  ~ ');
  });

  it('GH-820: zero pathed rendering', function() {
    shouldCompileTo('{{foo.bar}}', {foo: 0}, '');
  });

  it('GH-837: undefined values for helpers', function() {
    var helpers = {
      str: function(value) { return value + ''; }
    };

    shouldCompileTo('{{str bar.baz}}', [{}, helpers], 'undefined');
  });

  it('GH-926: Depths and de-dupe', function() {
    var context = {
      name: 'foo',
      data: [
        1
      ],
      notData: [
        1
      ]
    };

    var template = CompilerContext.compile('{{#if dater}}{{#each data}}{{../name}}{{/each}}{{else}}{{#each notData}}{{../name}}{{/each}}{{/if}}');

    var result = template(context);
    equals(result, 'foo');
  });

  it('GH-1021: Each empty string key', function() {
    var data = {
      '': 'foo',
      'name': 'Chris',
      'value': 10000
    };

    shouldCompileTo('{{#each data}}Key: {{@key}}\n{{/each}}', {data: data}, 'Key: \nKey: name\nKey: value\n');
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

    shouldCompileToWithPartials(root, [{}, helpers, partials], true, '<partial>');
  });

  it('GH-1065: Sparse arrays', function() {
    var array = [];
    array[1] = 'foo';
    array[3] = 'bar';
    shouldCompileTo('{{#each array}}{{@index}}{{.}}{{/each}}', {array: array}, '1foo3bar');
  });

  it('GH-1093: Undefined helper context', function() {
    var obj = {foo: undefined, bar: 'bat'};
    var helpers = {
      helper: function() {
        // It's valid to execute a block against an undefined context, but
        // helpers can not do so, so we expect to have an empty object here;
        for (var name in this) {
          if (this.hasOwnProperty(name)) {
            return 'found';
          }
        }
        // And to make IE happy, check for the known string as length is not enumerated.
        return (this == 'bat' ? 'found' : 'not');
      }
    };

    shouldCompileTo('{{#each obj}}{{{helper}}}{{.}}{{/each}}', [{obj: obj}, helpers], 'notfoundbat');
  });

  it('should support multiple levels of inline partials', function() {
    var string = '{{#> layout}}{{#*inline "subcontent"}}subcontent{{/inline}}{{/layout}}';
    var partials = {
      doctype: 'doctype{{> content}}',
      layout: '{{#> doctype}}{{#*inline "content"}}layout{{> subcontent}}{{/inline}}{{/doctype}}'
    };
    shouldCompileToWithPartials(string, [{}, {}, partials], true, 'doctypelayoutsubcontent');
  });
  it('GH-1089: should support failover content in multiple levels of inline partials', function() {
    var string = '{{#> layout}}{{/layout}}';
    var partials = {
      doctype: 'doctype{{> content}}',
      layout: '{{#> doctype}}{{#*inline "content"}}layout{{#> subcontent}}subcontent{{/subcontent}}{{/inline}}{{/doctype}}'
    };
    shouldCompileToWithPartials(string, [{}, {}, partials], true, 'doctypelayoutsubcontent');
  });
  it('GH-1099: should support greater than 3 nested levels of inline partials', function() {
    var string = '{{#> layout}}Outer{{/layout}}';
    var partials = {
      layout: '{{#> inner}}Inner{{/inner}}{{> @partial-block }}',
      inner: ''
    };
    shouldCompileToWithPartials(string, [{}, {}, partials], true, 'Outer');
  });
});
